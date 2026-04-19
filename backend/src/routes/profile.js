// src/routes/profile.js
// User profile, cinematic analysis, and recommendation endpoints
const express = require('express');
const { query } = require('../config/database');
const { authenticate } = require('../middleware/auth');
const {
  computeUserProfile,
  getHiddenGems,
  getMovieGraph,
} = require('../services/recommendationService');

const router = express.Router();

// All profile routes require authentication
router.use(authenticate);

// =============================================
// GET /api/profile
// Get user's cinematic profile
// =============================================
router.get('/', async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT up.*, u.username, u.email, u.created_at as member_since
       FROM user_preferences up
       JOIN users u ON u.id = up.user_id
       WHERE up.user_id = $1`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.json({
        success: true,
        profile: null,
        onboarding_needed: true,
      });
    }

    const pref = rows[0];

    // Parse JSONB fields (they come as objects from pg)
    const genreWeights = pref.genre_weights || {};
    const narrativeProfile = pref.narrative_profile || {};
    const styleProfile = pref.style_profile || {};

    // Format genres for display
    const { GENRE_MAP } = require('../services/tmdbService');
    const topGenres = Object.entries(genreWeights)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([id, weight]) => ({
        id: parseInt(id),
        name: GENRE_MAP[id] || 'Outros',
        weight: parseFloat(weight),
        percentage: Math.round(parseFloat(weight) * 100),
      }));

    // Personality type based on dominant genres
    const getPersonalityType = () => {
      const dominant = topGenres[0];
      if (!dominant) return null;

      const personalities = {
        878: { name: 'O Visionário', icon: '🔭', desc: 'Fascinado por futuros alternativos e tecnologia' },
        18: { name: 'O Empático', icon: '🎭', desc: 'Conecta-se profundamente com histórias humanas' },
        28: { name: 'O Aventureiro', icon: '⚡', desc: 'Vive para ação e adrenalina nas telas' },
        27: { name: 'O Corajoso', icon: '👻', desc: 'Enfrenta seus medos de camarote' },
        35: { name: 'O Otimista', icon: '😄', desc: 'Acredita que rir é o melhor remédio' },
        80: { name: 'O Investigador', icon: '🔍', desc: 'Adora desvendar mistérios e crimes' },
        9648: { name: 'O Enigmático', icon: '🌀', desc: 'Fascinado por segredos e reviravoltas' },
        16: { name: 'O Jovem de Coração', icon: '✨', desc: 'A magia da animação nunca perde o encanto' },
      };

      return personalities[dominant.id] || { name: 'O Eclético', icon: '🌈', desc: 'Aprecia todo tipo de cinema' };
    };

    res.json({
      success: true,
      profile: {
        user: {
          username: pref.username,
          email: pref.email,
          member_since: pref.member_since,
        },
        top_genres: topGenres,
        narrative_profile: narrativeProfile,
        style_profile: styleProfile,
        avg_rating_given: parseFloat(pref.avg_rating_given),
        total_movies_rated: pref.total_movies_rated,
        onboarding_completed: pref.onboarding_completed,
        personality: getPersonalityType(),
        computed_at: pref.computed_at,
      },
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ success: false, error: 'Erro ao buscar perfil' });
  }
});

// =============================================
// POST /api/profile/compute
// Force recompute of user profile
// =============================================
router.post('/compute', async (req, res) => {
  try {
    const profile = await computeUserProfile(req.user.id);
    res.json({ success: true, profile });
  } catch (error) {
    console.error('Profile compute error:', error);
    res.status(500).json({ success: false, error: 'Erro ao calcular perfil' });
  }
});

// =============================================
// GET /api/profile/recommendations
// Get personalized hidden gem recommendations
// =============================================
router.get('/recommendations', async (req, res) => {
  try {
    const { limit = 12 } = req.query;
    const gems = await getHiddenGems(req.user.id, parseInt(limit));
    res.json({
      success: true,
      recommendations: gems,
      count: gems.length,
    });
  } catch (error) {
    console.error('Recommendations error:', error.message);

    // If profile not found, guide user to onboarding
    if (error.message.includes('profile not found')) {
      return res.status(404).json({
        success: false,
        error: 'Complete o onboarding primeiro para receber recomendações',
        onboarding_needed: true,
      });
    }

    res.status(500).json({ success: false, error: 'Erro ao gerar recomendações' });
  }
});

// =============================================
// GET /api/profile/graph/:movieId
// Get movie connection graph for visual exploration
// =============================================
router.get('/graph/:movieId', async (req, res) => {
  try {
    const movieId = parseInt(req.params.movieId);
    if (isNaN(movieId)) {
      return res.status(400).json({ success: false, error: 'ID de filme inválido' });
    }

    const graphData = await getMovieGraph(movieId);
    res.json({ success: true, ...graphData });
  } catch (error) {
    console.error('Graph error:', error.message);
    res.status(500).json({ success: false, error: 'Erro ao gerar grafo' });
  }
});

// =============================================
// GET /api/profile/stats
// Get user statistics summary
// =============================================
router.get('/stats', async (req, res) => {
  try {
    // Ratings distribution
    const { rows: distRows } = await query(
      `SELECT 
         COUNT(*) as total_rated,
         AVG(rating) as avg_rating,
         MAX(rating) as max_rating,
         MIN(rating) as min_rating,
         COUNT(CASE WHEN rating >= 8 THEN 1 END) as loved,
         COUNT(CASE WHEN rating < 5 THEN 1 END) as disliked,
         COUNT(CASE WHEN watchlist = true THEN 1 END) as watchlist_count
       FROM user_ratings 
       WHERE user_id = $1`,
      [req.user.id]
    );

    // Monthly activity
    const { rows: monthlyRows } = await query(
      `SELECT 
         TO_CHAR(created_at, 'YYYY-MM') as month,
         COUNT(*) as count
       FROM user_ratings 
       WHERE user_id = $1 AND created_at > NOW() - INTERVAL '6 months'
       GROUP BY month
       ORDER BY month`,
      [req.user.id]
    );

    const stats = distRows[0];
    res.json({
      success: true,
      stats: {
        total_rated: parseInt(stats.total_rated),
        avg_rating: parseFloat(parseFloat(stats.avg_rating || 0).toFixed(1)),
        loved: parseInt(stats.loved),
        disliked: parseInt(stats.disliked),
        watchlist_count: parseInt(stats.watchlist_count),
        monthly_activity: monthlyRows,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro ao buscar estatísticas' });
  }
});

module.exports = router;
