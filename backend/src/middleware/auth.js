// src/middleware/auth.js
// JWT authentication middleware
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

/**
 * Middleware to verify JWT token on protected routes.
 * Attaches the full user object to req.user.
 */
const authenticate = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token de autenticação não fornecido',
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify and decode the JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch fresh user data from DB (ensures user still exists)
    const { rows } = await query(
      'SELECT id, email, username, created_at FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não encontrado',
      });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Token expirado' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, error: 'Token inválido' });
    }
    next(error);
  }
};

/**
 * Optional authentication - attaches user if token is valid, continues either way
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { rows } = await query(
        'SELECT id, email, username FROM users WHERE id = $1',
        [decoded.userId]
      );
      if (rows.length > 0) req.user = rows[0];
    }
  } catch (e) {
    // Ignore auth errors for optional auth
  }
  next();
};

module.exports = { authenticate, optionalAuthenticate };
