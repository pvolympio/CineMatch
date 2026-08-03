// src/routes/watchlist.js
// Watchlist endpoints: add/remove/list movies in watchlist
const express = require('express');
const { body, param, query: expressQuery, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All watchlist routes require authentication
router.use(authenticate);

// =============================================
// POST /api/watchlist
// Add a movie to watchlist
// =============================================
router.post('/', [
  body('tmdb_movie_id').isInt({ min: 1 }).withMessage('ID do filme inválido'),
  body('movie_title').trim().notEmpty().withMessage('Título obrigatório').escape(),
  body('movie_poster').optional().trim().isString(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { tmdb_movie_id, movie_title, movie_poster } = req.body;

    // Upsert: add to watchlist or update existing rating
    const { rows: [saved] } = await query(
      `INSERT INTO user_ratings
       (user_id, tmdb_movie_id, movie_title, movie_poster, watchlist, watched, created_at, updated_at)
       VALUES ($1, $2, $3, $4, true, false, NOW(), NOW())
       ON CONFLICT (user_id, tmdb_movie_id) DO UPDATE SET
         watchlist = true,
         movie_title = EXCLUDED.movie_title,
         movie_poster = COALESCE(EXCLUDED.movie_poster, user_ratings.movie_poster),
         updated_at = NOW()
       RETURNING *`,
      [req.user.id, tmdb_movie_id, movie_title, movie_poster]
    );

    res.json({
      success: true,
      message: 'Filme adicionado à watchlist',
      item: saved,
    });
  } catch (error) {
    console.error('Watchlist add error:', error);
    res.status(500).json({ success: false, error: 'Erro ao adicionar à watchlist' });
  }
});

// =============================================
// GET /api/watchlist
// Get all movies in user's watchlist
// =============================================
router.get('/', [
  expressQuery('page').optional().isInt({ min: 1 }).withMessage('Página inválida'),
  expressQuery('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite deve estar entre 1 e 100'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { rows } = await query(
      `SELECT * FROM user_ratings
       WHERE user_id = $1 AND watchlist = true
       ORDER BY updated_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, parseInt(limit), offset]
    );

    const { rows: [{ count }] } = await query(
      'SELECT COUNT(*) FROM user_ratings WHERE user_id = $1 AND watchlist = true',
      [req.user.id]
    );

    res.json({
      success: true,
      watchlist: rows,
      total: parseInt(count),
      page: parseInt(page),
      limit: parseInt(limit),
      total_pages: Math.ceil(parseInt(count) / parseInt(limit)),
    });
  } catch (error) {
    console.error('Watchlist get error:', error);
    res.status(500).json({ success: false, error: 'Erro ao buscar watchlist' });
  }
});

// =============================================
// DELETE /api/watchlist/:movieId
// Remove a movie from watchlist
// =============================================
router.delete('/:movieId', [
  param('movieId').isInt({ min: 1 }).withMessage('ID do filme inválido'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const movieId = parseInt(req.params.movieId);

    // Update watchlist flag to false (keep the rating if exists)
    await query(
      `UPDATE user_ratings
       SET watchlist = false, updated_at = NOW()
       WHERE user_id = $1 AND tmdb_movie_id = $2`,
      [req.user.id, movieId]
    );

    res.json({ success: true, message: 'Filme removido da watchlist' });
  } catch (error) {
    console.error('Watchlist remove error:', error);
    res.status(500).json({ success: false, error: 'Erro ao remover da watchlist' });
  }
});

// =============================================
// POST /api/watchlist/:movieId/watched
// Mark a watchlist movie as watched
// =============================================
router.post('/:movieId/watched', [
  param('movieId').isInt({ min: 1 }).withMessage('ID do filme inválido'),
  body('rating').optional().isFloat({ min: 0, max: 10 }).withMessage('Nota deve estar entre 0 e 10'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const movieId = parseInt(req.params.movieId);
    const { rating } = req.body;

    const { rows: [updated] } = await query(
      `UPDATE user_ratings
       SET watched = true,
           watchlist = false,
           rating = COALESCE($3, rating),
           updated_at = NOW()
       WHERE user_id = $1 AND tmdb_movie_id = $2
       RETURNING *`,
      [req.user.id, movieId, rating || null]
    );

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Filme não encontrado na watchlist' });
    }

    res.json({
      success: true,
      message: 'Filme marcado como assistido',
      item: updated,
    });
  } catch (error) {
    console.error('Watchlist mark watched error:', error);
    res.status(500).json({ success: false, error: 'Erro ao marcar como assistido' });
  }
});

module.exports = router;
