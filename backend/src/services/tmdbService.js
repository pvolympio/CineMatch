// src/services/tmdbService.js
// Centralized service for all TMDB API interactions
// TMDB Docs: https://developers.themoviedb.org/3
const axios = require('axios');

const TMDB_BASE_URL = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const IMAGE_BASE = 'https://image.tmdb.org/t/p';

// Axios instance with default config for TMDB
const tmdbClient = axios.create({
  baseURL: TMDB_BASE_URL,
  timeout: 10000,
  params: {
    api_key: TMDB_API_KEY,
    language: 'pt-BR',  // Portuguese Brazilian by default
  },
});

// =============================================
// IMAGE URL HELPERS
// =============================================

const getImageUrl = (path, size = 'w500') => {
  if (!path) return null;
  return `${IMAGE_BASE}/${size}${path}`;
};

const getPosterUrl = (path) => getImageUrl(path, 'w500');
const getBackdropUrl = (path) => getImageUrl(path, 'w1280');

// =============================================
// TMDB GENRE ID MAP
// =============================================
const GENRE_MAP = {
  28: 'Ação',
  12: 'Aventura',
  16: 'Animação',
  35: 'Comédia',
  80: 'Crime',
  99: 'Documentário',
  18: 'Drama',
  10751: 'Família',
  14: 'Fantasia',
  36: 'História',
  27: 'Terror',
  10402: 'Música',
  9648: 'Mistério',
  10749: 'Romance',
  878: 'Ficção Científica',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'Guerra',
  37: 'Faroeste',
};

// =============================================
// MOVIE SEARCH & DISCOVERY
// =============================================

/**
 * Search movies by title
 */
const searchMovies = async (query, page = 1) => {
  try {
    const { data } = await tmdbClient.get('/search/movie', {
      params: { query, page, include_adult: false },
    });
    return {
      results: data.results.map(formatMovie),
      total_pages: data.total_pages,
      total_results: data.total_results,
      page: data.page,
    };
  } catch (error) {
    throw new Error(`TMDB search failed: ${error.message}`);
  }
};

/**
 * Get popular movies (for onboarding selection)
 */
const getPopularMovies = async (page = 1) => {
  try {
    const { data } = await tmdbClient.get('/movie/popular', { params: { page } });
    return data.results.map(formatMovie);
  } catch (error) {
    throw new Error(`TMDB popular movies failed: ${error.message}`);
  }
};

/**
 * Get top-rated movies (good source for hidden gems)
 */
const getTopRatedMovies = async (page = 1) => {
  try {
    const { data } = await tmdbClient.get('/movie/top_rated', { params: { page } });
    return data.results.map(formatMovie);
  } catch (error) {
    throw new Error(`TMDB top rated failed: ${error.message}`);
  }
};

/**
 * Discover movies with filters - core for recommendations
 * @param {Object} options - genre_ids, sort_by, vote_average.gte, with_keywords, etc.
 */
const discoverMovies = async (options = {}) => {
  try {
    const params = {
      page: options.page || 1,
      sort_by: options.sort_by || 'vote_average.desc',
      'vote_count.gte': options.min_votes || 100,
      'vote_average.gte': options.min_rating || 6.0,
      include_adult: false,
      ...options,
    };

    // Remove custom options that aren't TMDB params
    delete params.min_votes;
    delete params.min_rating;

    const { data } = await tmdbClient.get('/discover/movie', { params });
    return {
      results: data.results.map(formatMovie),
      total_pages: data.total_pages,
      page: data.page,
    };
  } catch (error) {
    throw new Error(`TMDB discover failed: ${error.message}`);
  }
};

/**
 * Get detailed movie info including credits and keywords
 */
const getMovieDetails = async (movieId) => {
  try {
    const { data } = await tmdbClient.get(`/movie/${movieId}`, {
      params: { append_to_response: 'credits,keywords,similar,videos' },
    });
    return formatMovieDetails(data);
  } catch (error) {
    throw new Error(`TMDB movie details failed for ${movieId}: ${error.message}`);
  }
};

/**
 * Get movies similar to a given movie
 */
const getSimilarMovies = async (movieId, page = 1) => {
  try {
    const { data } = await tmdbClient.get(`/movie/${movieId}/similar`, { params: { page } });
    return data.results.map(formatMovie);
  } catch (error) {
    throw new Error(`TMDB similar movies failed: ${error.message}`);
  }
};

/**
 * Get movies by genre
 */
const getMoviesByGenre = async (genreId, page = 1) => {
  return discoverMovies({
    with_genres: genreId,
    sort_by: 'vote_average.desc',
    min_votes: 50,
    page,
  });
};

/**
 * Get list of all genres
 */
const getGenreList = async () => {
  try {
    const { data } = await tmdbClient.get('/genre/movie/list');
    return data.genres;
  } catch (error) {
    return Object.entries(GENRE_MAP).map(([id, name]) => ({ id: parseInt(id), name }));
  }
};

// =============================================
// DATA FORMATTERS
// =============================================

/**
 * Format a movie from TMDB list/search response
 */
const formatMovie = (movie) => ({
  id: movie.id,
  title: movie.title,
  original_title: movie.original_title,
  overview: movie.overview,
  poster_url: getPosterUrl(movie.poster_path),
  backdrop_url: getBackdropUrl(movie.backdrop_path),
  release_date: movie.release_date,
  release_year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
  vote_average: parseFloat((movie.vote_average || 0).toFixed(1)),
  vote_count: movie.vote_count || 0,
  popularity: movie.popularity || 0,
  genre_ids: movie.genre_ids || [],
  genres: (movie.genre_ids || []).map(id => ({
    id,
    name: GENRE_MAP[id] || 'Outros',
  })),
});

/**
 * Format detailed movie response with credits/keywords
 */
const formatMovieDetails = (movie) => {
  const base = formatMovie(movie);

  // Extract director from credits
  const director = movie.credits?.crew?.find(p => p.job === 'Director');
  const cast = (movie.credits?.cast || []).slice(0, 10).map(p => ({
    id: p.id,
    name: p.name,
    character: p.character,
    profile_url: getPosterUrl(p.profile_path),
  }));

  // Extract keywords
  const keywords = (movie.keywords?.keywords || []).map(k => k.name);

  return {
    ...base,
    runtime: movie.runtime,
    budget: movie.budget,
    revenue: movie.revenue,
    status: movie.status,
    tagline: movie.tagline,
    genres: (movie.genres || []).map(g => ({ id: g.id, name: GENRE_MAP[g.id] || g.name })),
    director: director ? {
      id: director.id,
      name: director.name,
      profile_url: getPosterUrl(director.profile_path),
    } : null,
    cast,
    keywords,
    similar: (movie.similar?.results || []).slice(0, 6).map(formatMovie),
    trailer: movie.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube') || null,
  };
};

module.exports = {
  searchMovies,
  getPopularMovies,
  getTopRatedMovies,
  discoverMovies,
  getMovieDetails,
  getSimilarMovies,
  getMoviesByGenre,
  getGenreList,
  getPosterUrl,
  getBackdropUrl,
  GENRE_MAP,
};
