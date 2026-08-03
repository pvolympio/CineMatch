// src/services/__tests__/recommendationService.test.js
const { computeUserProfile, getHiddenGems } = require('../recommendationService');
const { query } = require('../../config/database');
const tmdbService = require('../tmdbService');

jest.mock('../../config/database');
jest.mock('../tmdbService');

describe('RecommendationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('computeUserProfile', () => {
    it('deve calcular perfil do usuário com base nas avaliações', async () => {
      const userId = 1;

      // Mock ratings
      query.mockResolvedValueOnce({
        rows: [
          { tmdb_movie_id: 1, rating: 8.5, movie_title: 'Inception' },
          { tmdb_movie_id: 2, rating: 9.0, movie_title: 'The Matrix' },
          { tmdb_movie_id: 3, rating: 7.0, movie_title: 'Toy Story' },
        ],
      });

      // Mock cached movies
      query.mockResolvedValueOnce({
        rows: [
          { tmdb_id: 1, genre_ids: [878, 28], popularity: 50, vote_average: 8.8 },
          { tmdb_id: 2, genre_ids: [878, 28], popularity: 60, vote_average: 8.7 },
          { tmdb_id: 3, genre_ids: [16, 35], popularity: 70, vote_average: 8.3 },
        ],
      });

      // Mock profile save
      query.mockResolvedValueOnce({ rows: [] });

      const profile = await computeUserProfile(userId);

      expect(profile).toHaveProperty('genre_weights');
      expect(profile).toHaveProperty('narrative_profile');
      expect(profile).toHaveProperty('style_profile');
      expect(profile).toHaveProperty('avg_rating_given');
      expect(profile.total_movies_rated).toBe(3);
      expect(profile.avg_rating_given).toBeCloseTo(8.2, 1);
    });

    it('deve retornar erro quando não há avaliações', async () => {
      query.mockResolvedValueOnce({ rows: [] });

      const profile = await computeUserProfile(1);

      expect(profile).toHaveProperty('error');
      expect(profile.error).toBe('No ratings found');
    });
  });

  describe('getHiddenGems', () => {
    it('deve retornar recomendações personalizadas', async () => {
      const userId = 1;

      // Mock user preferences
      query.mockResolvedValueOnce({
        rows: [
          {
            user_id: 1,
            username: 'testuser',
            genre_weights: { '878': 0.9, '28': 0.7 },
            narrative_profile: { complex: 0.8, emotional: 0.5 },
          },
        ],
      });

      // Mock seen movies
      query.mockResolvedValueOnce({
        rows: [{ tmdb_movie_id: 1 }, { tmdb_movie_id: 2 }],
      });

      // Mock TMDB discover results
      tmdbService.discoverMovies.mockResolvedValue({
        results: [
          {
            id: 100,
            title: 'Hidden Gem 1',
            genre_ids: [878, 28],
            vote_average: 8.0,
            popularity: 20,
          },
          {
            id: 101,
            title: 'Hidden Gem 2',
            genre_ids: [878],
            vote_average: 7.5,
            popularity: 15,
          },
        ],
      });

      // Mock recommendation log
      query.mockResolvedValueOnce({ rows: [] });

      const recommendations = await getHiddenGems(userId, 5);

      expect(recommendations).toBeInstanceOf(Array);
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations[0]).toHaveProperty('recommendation_score');
      expect(recommendations[0]).toHaveProperty('reason');
    });

    it('deve lançar erro quando perfil não existe', async () => {
      query.mockResolvedValueOnce({ rows: [] });

      await expect(getHiddenGems(1)).rejects.toThrow(
        'User profile not found. Complete onboarding first.'
      );
    });
  });
});
