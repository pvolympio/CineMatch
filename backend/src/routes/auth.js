// src/routes/auth.js
// Authentication endpoints: register, login, me
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// =============================================
// POST /api/auth/register
// Create a new user account
// =============================================
router.post('/register', [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('username').trim().isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username inválido (use letras, números e _)'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
], async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, username, password } = req.body;

    // Check if email or username already exists
    const { rows: existing } = await query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Email ou nome de usuário já cadastrado',
      });
    }

    // Hash password with bcrypt (12 rounds = secure but not too slow)
    const passwordHash = await bcrypt.hash(password, 12);

    // Insert new user
    const { rows: [newUser] } = await query(
      `INSERT INTO users (email, username, password_hash, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING id, email, username, created_at`,
      [email, username, passwordHash]
    );

    // Create empty preferences record
    await query(
      `INSERT INTO user_preferences (user_id) VALUES ($1) ON CONFLICT DO NOTHING`,
      [newUser.id]
    );

    // Generate JWT
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Conta criada com sucesso!',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, error: 'Erro ao criar conta' });
  }
});

// =============================================
// POST /api/auth/login
// Authenticate and return JWT
// =============================================
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: 'Dados inválidos' });
    }

    const { email, password } = req.body;

    // Find user
    const { rows } = await query(
      'SELECT id, email, username, password_hash FROM users WHERE email = $1',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Email ou senha incorretos' });
    }

    const user = rows[0];

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, error: 'Email ou senha incorretos' });
    }

    // Update last login
    await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      token,
      user: { id: user.id, email: user.email, username: user.username },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Erro ao fazer login' });
  }
});

// =============================================
// GET /api/auth/me
// Get current authenticated user
// =============================================
router.get('/me', authenticate, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT u.id, u.email, u.username, u.created_at,
              up.onboarding_completed, up.total_movies_rated
       FROM users u
       LEFT JOIN user_preferences up ON up.user_id = u.id
       WHERE u.id = $1`,
      [req.user.id]
    );

    res.json({ success: true, user: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro ao buscar dados do usuário' });
  }
});

module.exports = router;
