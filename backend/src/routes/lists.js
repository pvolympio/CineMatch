// src/routes/lists.js
// Custom movie lists endpoints: create, update, delete, add/remove movies
const express = require('express');
const { body, param, query: expressQuery, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All list routes require authentication
router.use(authenticate);

// =============================================
// POST /api/lists
// Create a new custom list
// =============================================
router.post('/', [
  body('name').trim().notEmpty().withMessage('Nome da lista obrigatório').isLength({ max: 100 }).escape(),
  body('description').optional().trim().isLength({ max: 500 }).escape(),
  body('is_public').optional().isBoolean(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, description, is_public = false } = req.body;

    const { rows: [list] } = await query(
      `INSERT INTO user_lists (user_id, name, description, is_public, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING *`,
      [req.user.id, name, description, is_public]
    );

    res.json({
      success: true,
      message: 'Lista criada com sucesso',
      list,
    });
  } catch (error) {
    console.error('List create error:', error);
    res.status(500).json({ success: false, error: 'Erro ao criar lista' });
  }
});

// =============================================
// GET /api/lists
// Get all lists for current user
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
      `SELECT l.*, COUNT(li.id) as movie_count
       FROM user_lists l
       LEFT JOIN list_items li ON l.id = li.list_id
       WHERE l.user_id = $1
       GROUP BY l.id
       ORDER BY l.updated_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, parseInt(limit), offset]
    );

    const { rows: [{ count }] } = await query(
      'SELECT COUNT(*) FROM user_lists WHERE user_id = $1',
      [req.user.id]
    );

    res.json({
      success: true,
      lists: rows,
      total: parseInt(count),
      page: parseInt(page),
      limit: parseInt(limit),
      total_pages: Math.ceil(parseInt(count) / parseInt(limit)),
    });
  } catch (error) {
    console.error('Lists get error:', error);
    res.status(500).json({ success: false, error: 'Erro ao buscar listas' });
  }
});

// =============================================
// GET /api/lists/:listId
// Get a specific list with its movies
// =============================================
router.get('/:listId', [
  param('listId').isInt({ min: 1 }).withMessage('ID da lista inválido'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const listId = parseInt(req.params.listId);

    // Get list details
    const { rows: [list] } = await query(
      'SELECT * FROM user_lists WHERE id = $1 AND user_id = $2',
      [listId, req.user.id]
    );

    if (!list) {
      return res.status(404).json({ success: false, error: 'Lista não encontrada' });
    }

    // Get movies in the list
    const { rows: movies } = await query(
      `SELECT li.*, mc.title, mc.poster_path, mc.vote_average, mc.release_date
       FROM list_items li
       LEFT JOIN movie_cache mc ON li.tmdb_movie_id = mc.tmdb_id
       WHERE li.list_id = $1
       ORDER BY li.added_at DESC`,
      [listId]
    );

    res.json({
      success: true,
      list: {
        ...list,
        movies,
        movie_count: movies.length,
      },
    });
  } catch (error) {
    console.error('List get error:', error);
    res.status(500).json({ success: false, error: 'Erro ao buscar lista' });
  }
});

// =============================================
// PUT /api/lists/:listId
// Update a list
// =============================================
router.put('/:listId', [
  param('listId').isInt({ min: 1 }).withMessage('ID da lista inválido'),
  body('name').optional().trim().notEmpty().isLength({ max: 100 }).escape(),
  body('description').optional().trim().isLength({ max: 500 }).escape(),
  body('is_public').optional().isBoolean(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const listId = parseInt(req.params.listId);
    const { name, description, is_public } = req.body;

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (is_public !== undefined) {
      updates.push(`is_public = $${paramCount++}`);
      values.push(is_public);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: 'Nenhum campo para atualizar' });
    }

    updates.push(`updated_at = NOW()`);
    values.push(listId, req.user.id);

    const { rows: [updated] } = await query(
      `UPDATE user_lists
       SET ${updates.join(', ')}
       WHERE id = $${paramCount++} AND user_id = $${paramCount++}
       RETURNING *`,
      values
    );

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Lista não encontrada' });
    }

    res.json({
      success: true,
      message: 'Lista atualizada',
      list: updated,
    });
  } catch (error) {
    console.error('List update error:', error);
    res.status(500).json({ success: false, error: 'Erro ao atualizar lista' });
  }
});

// =============================================
// DELETE /api/lists/:listId
// Delete a list
// =============================================
router.delete('/:listId', [
  param('listId').isInt({ min: 1 }).withMessage('ID da lista inválido'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const listId = parseInt(req.params.listId);

    // Delete list items first (cascade should handle this, but being explicit)
    await query('DELETE FROM list_items WHERE list_id = $1', [listId]);

    // Delete the list
    const { rowCount } = await query(
      'DELETE FROM user_lists WHERE id = $1 AND user_id = $2',
      [listId, req.user.id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Lista não encontrada' });
    }

    res.json({ success: true, message: 'Lista removida' });
  } catch (error) {
    console.error('List delete error:', error);
    res.status(500).json({ success: false, error: 'Erro ao remover lista' });
  }
});

// =============================================
// POST /api/lists/:listId/movies
// Add a movie to a list
// =============================================
router.post('/:listId/movies', [
  param('listId').isInt({ min: 1 }).withMessage('ID da lista inválido'),
  body('tmdb_movie_id').isInt({ min: 1 }).withMessage('ID do filme inválido'),
  body('movie_title').optional().trim().escape(),
  body('movie_poster').optional().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const listId = parseInt(req.params.listId);
    const { tmdb_movie_id, movie_title, movie_poster } = req.body;

    // Verify list belongs to user
    const { rows: [list] } = await query(
      'SELECT id FROM user_lists WHERE id = $1 AND user_id = $2',
      [listId, req.user.id]
    );

    if (!list) {
      return res.status(404).json({ success: false, error: 'Lista não encontrada' });
    }

    // Add movie to list
    const { rows: [item] } = await query(
      `INSERT INTO list_items (list_id, tmdb_movie_id, added_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (list_id, tmdb_movie_id) DO NOTHING
       RETURNING *`,
      [listId, tmdb_movie_id]
    );

    // Update list timestamp
    await query('UPDATE user_lists SET updated_at = NOW() WHERE id = $1', [listId]);

    res.json({
      success: true,
      message: 'Filme adicionado à lista',
      item,
    });
  } catch (error) {
    console.error('List add movie error:', error);
    res.status(500).json({ success: false, error: 'Erro ao adicionar filme à lista' });
  }
});

// =============================================
// DELETE /api/lists/:listId/movies/:movieId
// Remove a movie from a list
// =============================================
router.delete('/:listId/movies/:movieId', [
  param('listId').isInt({ min: 1 }).withMessage('ID da lista inválido'),
  param('movieId').isInt({ min: 1 }).withMessage('ID do filme inválido'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const listId = parseInt(req.params.listId);
    const movieId = parseInt(req.params.movieId);

    // Verify list belongs to user
    const { rows: [list] } = await query(
      'SELECT id FROM user_lists WHERE id = $1 AND user_id = $2',
      [listId, req.user.id]
    );

    if (!list) {
      return res.status(404).json({ success: false, error: 'Lista não encontrada' });
    }

    // Remove movie from list
    await query(
      'DELETE FROM list_items WHERE list_id = $1 AND tmdb_movie_id = $2',
      [listId, movieId]
    );

    // Update list timestamp
    await query('UPDATE user_lists SET updated_at = NOW() WHERE id = $1', [listId]);

    res.json({ success: true, message: 'Filme removido da lista' });
  } catch (error) {
    console.error('List remove movie error:', error);
    res.status(500).json({ success: false, error: 'Erro ao remover filme da lista' });
  }
});

module.exports = router;
