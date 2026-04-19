// src/routes/movies.js
// Movie-related endpoints: search, details, popular, trending
const express = require('express');
const { query } = require('../config/database');
const tmdbService = require('../services/tmdbService');
const { optionalAuthenticate } = require('../middleware/auth');

const router = express.Router();

// =============================================
// GET /api/movies/search?q=title
// Search movies by title
// =============================================
router.get('/search', async (req, res) => {
  try {
    const { q, page = 1 } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Query muito curta' });
    }

    const results = await tmdbService.searchMovies(q.trim(), parseInt(page));
    res.json({ success: true, ...results });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro na busca' });
  }
});

// =============================================
// GET /api/movies/popular
// Get popular movies (for onboarding)
// =============================================
router.get('/popular', async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const movies = await tmdbService.getPopularMovies(parseInt(page));
    res.json({ success: true, results: movies });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro ao buscar filmes populares' });
  }
});

// =============================================
// GET /api/movies/trending
// Trending movies for the home screen
// =============================================
router.get('/trending', async (req, res) => {
  try {
    const movies = await tmdbService.getPopularMovies(1);
    // Mix in some top-rated for variety
    const topRated = await tmdbService.getTopRatedMovies(1);

    // Interleave: 2 popular, 1 top-rated
    const mixed = [];
    for (let i = 0; i < Math.min(movies.length, topRated.length, 10); i++) {
      mixed.push(movies[i]);
      if (i % 2 === 1) mixed.push(topRated[Math.floor(i / 2)]);
    }

    res.json({ success: true, results: mixed.slice(0, 20) });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro ao buscar trending' });
  }
});

// =============================================
// GET /api/movies/genres
// Get all available genres
// =============================================
router.get('/genres', async (req, res) => {
  try {
    const genres = await tmdbService.getGenreList();
    res.json({ success: true, genres });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro ao buscar gêneros' });
  }
});

// =============================================
// GET /api/movies/:id
// Get detailed movie information
// =============================================
router.get('/:id', optionalAuthenticate, async (req, res) => {
  try {
    const movieId = parseInt(req.params.id);
    if (isNaN(movieId)) {
      return res.status(400).json({ success: false, error: 'ID inválido' });
    }

    // Try cache first
    const { rows: cached } = await query(
      'SELECT * FROM movie_cache WHERE tmdb_id = $1',
      [movieId]
    );

    let movieDetails;

    if (cached.length > 0) {
      // Use cached data if less than 24 hours old
      const cacheAge = Date.now() - new Date(cached[0].cached_at).getTime();
      if (cacheAge < 24 * 60 * 60 * 1000) {
        // Cache is fresh, but still fetch full details from TMDB for complete data
      }
    }

    // Fetch from TMDB
    movieDetails = await tmdbService.getMovieDetails(movieId);

    // Cache the basic info for faster lookups
    await query(
      `INSERT INTO movie_cache 
       (tmdb_id, title, original_title, overview, poster_path, backdrop_path,
        release_date, vote_average, vote_count, popularity, genre_ids, runtime, director, cached_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
       ON CONFLICT (tmdb_id) DO UPDATE SET
         vote_average = EXCLUDED.vote_average,
         vote_count = EXCLUDED.vote_count,
         popularity = EXCLUDED.popularity,
         cached_at = NOW()`,
      [
        movieId,
        movieDetails.title,
        movieDetails.original_title,
        movieDetails.overview,
        movieDetails.poster_url,
        movieDetails.backdrop_url,
        movieDetails.release_date,
        movieDetails.vote_average,
        movieDetails.vote_count,
        movieDetails.popularity,
        movieDetails.genre_ids,
        movieDetails.runtime,
        movieDetails.director?.name || null,
      ]
    ).catch(() => {}); // Non-critical

    // If user is authenticated, attach their rating
    let userRating = null;
    if (req.user) {
      const { rows: ratingRows } = await query(
        'SELECT rating, watched, watchlist FROM user_ratings WHERE user_id = $1 AND tmdb_movie_id = $2',
        [req.user.id, movieId]
      );
      if (ratingRows.length > 0) userRating = ratingRows[0];
    }

    res.json({
      success: true,
      movie: movieDetails,
      user_rating: userRating,
    });
  } catch (error) {
    console.error('Movie details error:', error.message);
    res.status(500).json({ success: false, error: 'Erro ao buscar detalhes do filme' });
  }
});

// =============================================
// GET /api/movies/:id/similar
// Get movies similar to given movie
// =============================================
router.get('/:id/similar', async (req, res) => {
  try {
    const movieId = parseInt(req.params.id);
    const similar = await tmdbService.getSimilarMovies(movieId);
    res.json({ success: true, results: similar });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro ao buscar filmes similares' });
  }
});

module.exports = router;
