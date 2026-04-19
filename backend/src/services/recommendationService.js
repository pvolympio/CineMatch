// src/services/recommendationService.js
// =============================================
// CINEMATCH RECOMMENDATION ENGINE
// =============================================
// This is the core logic that makes CineMatch intelligent.
// It combines genre affinity, rating scoring, and popularity
// penalty to surface "hidden gems" tailored to each user.

const { query } = require('../config/database');
const tmdbService = require('./tmdbService');

// =============================================
// CINEMATIC PROFILE COMPUTATION
// =============================================

/**
 * Analyze a user's ratings and compute their cinematic profile.
 * This is called after onboarding or when ratings change.
 *
 * @param {number} userId - The user's database ID
 * @returns {Object} Computed profile with genre weights, style, narrative prefs
 */
const computeUserProfile = async (userId) => {
  // Fetch all rated movies for this user
  const { rows: ratings } = await query(
    `SELECT tmdb_movie_id, rating, movie_title FROM user_ratings 
     WHERE user_id = $1 AND watched = true ORDER BY rating DESC`,
    [userId]
  );

  if (ratings.length === 0) {
    return { error: 'No ratings found' };
  }

  // Fetch cached genre data for each rated movie
  const movieIds = ratings.map(r => r.tmdb_movie_id);
  const { rows: cachedMovies } = await query(
    `SELECT tmdb_id, genre_ids, popularity, vote_average 
     FROM movie_cache WHERE tmdb_id = ANY($1)`,
    [movieIds]
  );

  // Build a quick lookup map
  const movieMap = {};
  cachedMovies.forEach(m => { movieMap[m.tmdb_id] = m; });

  // =============================================
  // STEP 1: Compute genre weights
  // Weight each genre by the user's rating (higher rating = more weight)
  // =============================================
  const genreScores = {};
  const genreCounts = {};
  let totalWeight = 0;

  ratings.forEach(rating => {
    const movie = movieMap[rating.tmdb_movie_id];
    if (!movie || !movie.genre_ids) return;

    // Normalize rating to a 0-1 weight (ratings are 0-10)
    // We use a sigmoid-like normalization: ratings above 7 = positive signal
    const normalizedRating = (parseFloat(rating.rating) - 5) / 5;
    const weight = Math.max(0.1, normalizedRating);

    movie.genre_ids.forEach(genreId => {
      genreScores[genreId] = (genreScores[genreId] || 0) + weight;
      genreCounts[genreId] = (genreCounts[genreId] || 0) + 1;
      totalWeight += weight;
    });
  });

  // Normalize genre weights to 0-1 range
  const genreWeights = {};
  const maxScore = Math.max(...Object.values(genreScores), 0.001);
  Object.entries(genreScores).forEach(([genreId, score]) => {
    genreWeights[genreId] = parseFloat((score / maxScore).toFixed(3));
  });

  // Sort genres by weight (top genres first)
  const topGenres = Object.entries(genreWeights)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([id, weight]) => ({
      id: parseInt(id),
      name: tmdbService.GENRE_MAP[id] || 'Outros',
      weight,
      percentage: Math.round(weight * 100),
    }));

  // =============================================
  // STEP 2: Compute narrative profile
  // Based on genre combinations, infer narrative preferences
  // =============================================
  const narrativeProfile = computeNarrativeProfile(genreWeights);

  // =============================================
  // STEP 3: Compute style profile
  // =============================================
  const styleProfile = computeStyleProfile(genreWeights);

  // =============================================
  // STEP 4: Compute basic stats
  // =============================================
  const avgRating = ratings.reduce((sum, r) => sum + parseFloat(r.rating), 0) / ratings.length;
  const ratingDistribution = computeRatingDistribution(ratings);

  // =============================================
  // STEP 5: Save to database
  // =============================================
  const profile = {
    genre_weights: genreWeights,
    narrative_profile: narrativeProfile,
    style_profile: styleProfile,
    avg_rating_given: parseFloat(avgRating.toFixed(1)),
    total_movies_rated: ratings.length,
  };

  await query(
    `INSERT INTO user_preferences (user_id, genre_weights, narrative_profile, style_profile, 
      avg_rating_given, total_movies_rated, onboarding_completed, computed_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())
     ON CONFLICT (user_id) DO UPDATE SET
       genre_weights = EXCLUDED.genre_weights,
       narrative_profile = EXCLUDED.narrative_profile,
       style_profile = EXCLUDED.style_profile,
       avg_rating_given = EXCLUDED.avg_rating_given,
       total_movies_rated = EXCLUDED.total_movies_rated,
       onboarding_completed = true,
       computed_at = NOW(),
       updated_at = NOW()`,
    [userId, JSON.stringify(genreWeights), JSON.stringify(narrativeProfile),
      JSON.stringify(styleProfile), profile.avg_rating_given, ratings.length]
  );

  return {
    ...profile,
    top_genres: topGenres,
    rating_distribution: ratingDistribution,
    personality_type: getPersonalityType(genreWeights, narrativeProfile),
  };
};

/**
 * Infer narrative complexity preferences from genre mix
 */
const computeNarrativeProfile = (genreWeights) => {
  // Genre clusters that suggest narrative complexity
  const complexGenres = [878, 9648, 80, 36]; // Sci-Fi, Mystery, Crime, History
  const emotionalGenres = [18, 10749, 10751]; // Drama, Romance, Family
  const actionGenres = [28, 12, 53]; // Action, Adventure, Thriller
  const lightGenres = [35, 16, 10751]; // Comedy, Animation, Family

  const computeClusterScore = (genres) =>
    genres.reduce((sum, id) => sum + (genreWeights[id] || 0), 0) / genres.length;

  return {
    complex: parseFloat(computeClusterScore(complexGenres).toFixed(3)),
    emotional: parseFloat(computeClusterScore(emotionalGenres).toFixed(3)),
    action_driven: parseFloat(computeClusterScore(actionGenres).toFixed(3)),
    lighthearted: parseFloat(computeClusterScore(lightGenres).toFixed(3)),
  };
};

/**
 * Compute visual/style preferences
 */
const computeStyleProfile = (genreWeights) => {
  return {
    sci_fi: parseFloat((genreWeights[878] || 0).toFixed(3)),
    drama: parseFloat((genreWeights[18] || 0).toFixed(3)),
    action: parseFloat((genreWeights[28] || 0).toFixed(3)),
    comedy: parseFloat((genreWeights[35] || 0).toFixed(3)),
    thriller: parseFloat((genreWeights[53] || 0).toFixed(3)),
    horror: parseFloat((genreWeights[27] || 0).toFixed(3)),
    animation: parseFloat((genreWeights[16] || 0).toFixed(3)),
    documentary: parseFloat((genreWeights[99] || 0).toFixed(3)),
  };
};

/**
 * Map profile to a personality archetype
 */
const getPersonalityType = (genreWeights, narrativeProfile) => {
  const types = [
    {
      name: 'O Analítico',
      description: 'Você ama narrativas complexas e mundos elaborados. Filmes que fazem você pensar são os seus favoritos.',
      icon: '🔭',
      condition: () => (genreWeights[878] || 0) + (genreWeights[9648] || 0) > 1.0,
    },
    {
      name: 'O Sensível',
      description: 'Histórias emocionais e personagens profundos são o seu ponto forte. Você se importa com as pessoas na tela.',
      icon: '🎭',
      condition: () => narrativeProfile.emotional > 0.5,
    },
    {
      name: 'O Aventureiro',
      description: 'Adrenalina e ação são o que você busca. Sem tempo para tédio, só para a próxima missão.',
      icon: '⚡',
      condition: () => narrativeProfile.action_driven > 0.5,
    },
    {
      name: 'O Eclético',
      description: 'Você aprecia todo tipo de cinema. Sua mente aberta te faz descobrir filmes que outros perdem.',
      icon: '🌈',
      condition: () => true, // Default
    },
  ];

  const matched = types.find(t => t.condition());
  return matched;
};

/**
 * Build rating distribution for chart display
 */
const computeRatingDistribution = (ratings) => {
  const buckets = { '1-2': 0, '3-4': 0, '5-6': 0, '7-8': 0, '9-10': 0 };
  ratings.forEach(r => {
    const val = parseFloat(r.rating);
    if (val <= 2) buckets['1-2']++;
    else if (val <= 4) buckets['3-4']++;
    else if (val <= 6) buckets['5-6']++;
    else if (val <= 8) buckets['7-8']++;
    else buckets['9-10']++;
  });
  return buckets;
};

// =============================================
// HIDDEN GEMS RECOMMENDATION ALGORITHM
// =============================================

/**
 * Find hidden gems for a user based on their profile.
 *
 * The algorithm:
 * 1. Fetch movies matching the user's top genres via TMDB Discover
 * 2. Score each movie using:
 *    - Genre affinity score (how well does it match user's taste?)
 *    - Quality score (vote_average normalized)
 *    - Obscurity bonus (LOWER popularity = HIGHER bonus for hidden gems)
 * 3. Filter out movies the user already rated
 * 4. Return top N results with explanation
 *
 * @param {number} userId
 * @param {number} limit - Number of recommendations
 */
const getHiddenGems = async (userId, limit = 12) => {
  // Load user preferences
  const { rows } = await query(
    `SELECT up.*, u.username FROM user_preferences up
     JOIN users u ON u.id = up.user_id
     WHERE up.user_id = $1`,
    [userId]
  );

  if (rows.length === 0) {
    throw new Error('User profile not found. Complete onboarding first.');
  }

  const prefs = rows[0];
  const genreWeights = prefs.genre_weights || {};

  // Get movies the user has already seen (to exclude)
  const { rows: seenMovies } = await query(
    `SELECT tmdb_movie_id FROM user_ratings WHERE user_id = $1`,
    [userId]
  );
  const seenIds = new Set(seenMovies.map(m => m.tmdb_movie_id));

  // Get top 3 genre IDs for the user
  const topGenreIds = Object.entries(genreWeights)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([id]) => id);

  // Fetch candidates from multiple genre searches
  const candidatePromises = topGenreIds.map(genreId =>
    tmdbService.discoverMovies({
      with_genres: genreId,
      sort_by: 'vote_average.desc',
      min_votes: 200,    // Enough votes to be trustworthy
      min_rating: 6.5,   // Decent quality threshold
      'popularity.lte': 50,  // LOW popularity = hidden gem!
      page: Math.floor(Math.random() * 5) + 1, // Randomize for variety
    }).catch(() => ({ results: [] }))
  );

  const candidateResults = await Promise.all(candidatePromises);
  const allCandidates = [];
  const seenTmdbIds = new Set();

  candidateResults.forEach(result => {
    result.results.forEach(movie => {
      if (!seenIds.has(movie.id) && !seenTmdbIds.has(movie.id)) {
        allCandidates.push(movie);
        seenTmdbIds.add(movie.id);
      }
    });
  });

  // =============================================
  // SCORING FUNCTION
  // Score = (genre_affinity * 0.5) + (quality * 0.3) + (obscurity_bonus * 0.2)
  // =============================================
  const scoredMovies = allCandidates.map(movie => {
    // 1. Genre affinity: how much does this movie match the user's top genres?
    const genreAffinityScore = movie.genre_ids.reduce((sum, gId) => {
      return sum + (genreWeights[gId] || 0);
    }, 0) / Math.max(movie.genre_ids.length, 1);

    // 2. Quality score: normalize vote_average (0-10) to 0-1
    const qualityScore = (movie.vote_average - 6.5) / 3.5;

    // 3. Obscurity bonus: lower popularity = higher bonus
    // Popularity scale on TMDB goes from 0 to ~1000+
    // We want movies under 50 popularity to get a bonus
    const obscurityBonus = Math.max(0, 1 - (movie.popularity / 50));

    // Combined score
    const totalScore =
      (genreAffinityScore * 0.50) +
      (Math.max(0, qualityScore) * 0.30) +
      (obscurityBonus * 0.20);

    // Generate human-readable reason
    const reason = generateRecommendationReason(movie, genreWeights, prefs.narrative_profile);

    return {
      ...movie,
      recommendation_score: parseFloat(totalScore.toFixed(4)),
      genre_affinity: parseFloat(genreAffinityScore.toFixed(3)),
      obscurity_bonus: parseFloat(obscurityBonus.toFixed(3)),
      reason,
    };
  });

  // Sort by score and return top N
  scoredMovies.sort((a, b) => b.recommendation_score - a.recommendation_score);
  const topRecommendations = scoredMovies.slice(0, limit);

  // Log recommendations for analytics
  if (topRecommendations.length > 0) {
    const logValues = topRecommendations.map((movie, i) =>
      `(${userId}, ${movie.id}, 'hidden_gem', ${movie.recommendation_score}, '${movie.reason.replace(/'/g, "''")}')`
    ).join(',');

    await query(
      `INSERT INTO recommendation_log (user_id, tmdb_movie_id, recommendation_type, score, reason)
       VALUES ${logValues}
       ON CONFLICT DO NOTHING`
    ).catch(() => {}); // Non-critical, don't fail if logging fails
  }

  return topRecommendations;
};

/**
 * Generate a friendly, human-readable reason for a recommendation
 */
const generateRecommendationReason = (movie, genreWeights, narrativeProfile) => {
  const genreNames = movie.genre_ids
    .filter(id => (genreWeights[id] || 0) > 0.3)
    .map(id => tmdbService.GENRE_MAP[id])
    .filter(Boolean)
    .slice(0, 2);

  if (genreNames.length === 0) {
    return 'Uma joia escondida com alta avaliação que combina com seu gosto';
  }

  const narrativeHints = [];
  if (narrativeProfile) {
    const np = typeof narrativeProfile === 'string'
      ? JSON.parse(narrativeProfile) : narrativeProfile;
    if (np.emotional > 0.4) narrativeHints.push('narrativa emocional');
    if (np.complex > 0.4) narrativeHints.push('roteiro complexo');
    if (np.action_driven > 0.5) narrativeHints.push('ritmo acelerado');
  }

  const base = `Recomendado porque você gosta de ${genreNames.join(' e ')}`;
  const hint = narrativeHints.length > 0 ? ` com ${narrativeHints[0]}` : '';
  return `${base}${hint}`;
};

// =============================================
// GRAPH/CONNECTION DATA FOR VISUAL EXPLORATION
// =============================================

/**
 * Build connection graph data for a seed movie.
 * Returns nodes and edges for force-directed graph visualization.
 *
 * @param {number} movieId - TMDB movie ID to build graph around
 * @param {number} depth - How many layers of connections (default 1)
 */
const getMovieGraph = async (movieId, depth = 1) => {
  const nodes = new Map();
  const edges = [];

  // Fetch the central movie with full details
  const centralMovie = await tmdbService.getMovieDetails(movieId);
  nodes.set(movieId, {
    id: movieId,
    title: centralMovie.title,
    poster_url: centralMovie.poster_url,
    vote_average: centralMovie.vote_average,
    genres: centralMovie.genres,
    is_center: true,
    group: 'center',
  });

  // Connection types to explore
  const connectionTypes = [
    { label: 'Gênero', movies: centralMovie.similar.slice(0, 4) },
  ];

  // Also fetch movies by same director if available
  if (centralMovie.director) {
    try {
      const directorMovies = await tmdbService.discoverMovies({
        with_crew: centralMovie.director.id,
        sort_by: 'vote_average.desc',
        min_votes: 50,
        page: 1,
      });
      connectionTypes.push({
        label: `Diretor: ${centralMovie.director.name}`,
        movies: directorMovies.results.slice(0, 3).filter(m => m.id !== movieId),
      });
    } catch (e) {
      // Director search optional
    }
  }

  // Build nodes and edges
  connectionTypes.forEach(({ label, movies }) => {
    movies.forEach(movie => {
      if (movie.id === movieId) return;

      if (!nodes.has(movie.id)) {
        nodes.set(movie.id, {
          id: movie.id,
          title: movie.title,
          poster_url: movie.poster_url,
          vote_average: movie.vote_average,
          genres: movie.genres,
          is_center: false,
          group: label,
        });
      }

      edges.push({
        source: movieId,
        target: movie.id,
        label,
        strength: 0.7,
      });
    });
  });

  return {
    center_movie: centralMovie,
    nodes: Array.from(nodes.values()),
    edges,
  };
};

module.exports = {
  computeUserProfile,
  getHiddenGems,
  getMovieGraph,
  generateRecommendationReason,
};
