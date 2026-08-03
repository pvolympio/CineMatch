// src/routes/ratings.js
// User rating endpoints: rate movies, get ratings, batch rate (onboarding)
const express = require('express');
const { body, param, query: expressQuery, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { computeUserProfile } = require('../services/recommendationService');

const router = express.Router();

// All rating routes require authentication
router.use(authenticate);

// =============================================
// POST /api/ratings
// Rate or update rating for a movie
// =============================================
router.post('/', [
  body('tmdb_movie_id').isInt({ min: 1 }).withMessage('ID do filme inválido'),
  body('rating').optional().isFloat({ min: 0, max: 10 }).withMessage('Nota deve estar entre 0 e 10'),
  body('movie_title').trim().notEmpty().withMessage('Título obrigatório').escape(),
  body('movie_poster').optional().trim().isString(),
  body('watched').optional().isBoolean(),
  body('watchlist').optional().isBoolean(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      tmdb_movie_id,
      rating,
      movie_title,
      movie_poster,
      watched = true,
      watchlist = false,
    } = req.body;

    // Upsert rating (insert or update if already rated)
    const { rows: [savedRating] } = await query(
      `INSERT INTO user_ratings 
       (user_id, tmdb_movie_id, movie_title, movie_poster, rating, watched, watchlist, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       ON CONFLICT (user_id, tmdb_movie_id) DO UPDATE SET
         rating = COALESCE(EXCLUDED.rating, user_ratings.rating),
         watched = EXCLUDED.watched,
         watchlist = EXCLUDED.watchlist,
         movie_title = EXCLUDED.movie_title,
         movie_poster = COALESCE(EXCLUDED.movie_poster, user_ratings.movie_poster),
         updated_at = NOW()
       RETURNING *`,
      [req.user.id, tmdb_movie_id, movie_title, movie_poster, rating, watched, watchlist]
    );

    // Recompute user profile in background (don't await to keep response fast)
    computeUserProfile(req.user.id).catch(err =>
      console.warn('Profile recompute failed:', err.message)
    );

    res.json({
      success: true,
      message: 'Avaliação salva!',
      rating: savedRating,
    });
  } catch (error) {
    console.error('Rating save error:', error);
    res.status(500).json({ success: false, error: 'Erro ao salvar avaliação' });
  }
});

// =============================================
// POST /api/ratings/batch
// Rate multiple movies at once (used in onboarding)
// =============================================
router.post('/batch', [
  body('ratings').isArray({ min: 1 }).withMessage('Lista de avaliações necessária'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { ratings } = req.body;
    const userId = req.user.id;

    // Use a transaction for batch insert
    const client = await require('../config/database').getClient();
    try {
      await client.query('BEGIN');

      const savedRatings = [];
      for (const r of ratings) {
        if (!r.tmdb_movie_id || !r.movie_title) continue;

        const { rows: [saved] } = await client.query(
          `INSERT INTO user_ratings 
           (user_id, tmdb_movie_id, movie_title, movie_poster, rating, watched, watchlist, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
           ON CONFLICT (user_id, tmdb_movie_id) DO UPDATE SET
             rating = COALESCE(EXCLUDED.rating, user_ratings.rating),
             watched = EXCLUDED.watched,
             movie_title = EXCLUDED.movie_title,
             movie_poster = COALESCE(EXCLUDED.movie_poster, user_ratings.movie_poster),
             updated_at = NOW()
           RETURNING *`,
          [userId, r.tmdb_movie_id, r.movie_title, r.movie_poster, r.rating, true, false]
        );
        savedRatings.push(saved);
      }

      await client.query('COMMIT');

      // Compute profile after batch (this IS awaited since it's the main point of onboarding)
      const profile = await computeUserProfile(userId);

      res.json({
        success: true,
        message: `${savedRatings.length} filmes avaliados com sucesso!`,
        ratings_count: savedRatings.length,
        profile,
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Batch rating error:', error);
    res.status(500).json({ success: false, error: 'Erro ao salvar avaliações em lote' });
  }
});

// =============================================
// GET /api/ratings
// Get all ratings for the current user with pagination
// =============================================
router.get('/', [
  expressQuery('page').optional().isInt({ min: 1 }).withMessage('Página inválida'),
  expressQuery('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite deve estar entre 1 e 100'),
  expressQuery('sort').optional().isIn(['updated_at', 'rating', 'movie_title', 'created_at']).withMessage('Ordenação inválida'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { page = 1, limit = 20, sort = 'updated_at' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const validSorts = ['updated_at', 'rating', 'movie_title', 'created_at'];
    const sortColumn = validSorts.includes(sort) ? sort : 'updated_at';

    const { rows } = await query(
      `SELECT * FROM user_ratings
       WHERE user_id = $1
       ORDER BY ${sortColumn} DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, parseInt(limit), offset]
    );

    const { rows: [{ count }] } = await query(
      'SELECT COUNT(*) FROM user_ratings WHERE user_id = $1',
      [req.user.id]
    );

    res.json({
      success: true,
      ratings: rows,
      total: parseInt(count),
      page: parseInt(page),
      limit: parseInt(limit),
      total_pages: Math.ceil(parseInt(count) / parseInt(limit)),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro ao buscar avaliações' });
  }
});

// =============================================
// DELETE /api/ratings/:movieId
// Remove a rating
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
    await query(
      'DELETE FROM user_ratings WHERE user_id = $1 AND tmdb_movie_id = $2',
      [req.user.id, movieId]
    );

    // Recompute profile
    computeUserProfile(req.user.id).catch(() => {});

    res.json({ success: true, message: 'Avaliação removida' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro ao remover avaliação' });
  }
});

module.exports = router;
