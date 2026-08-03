// src/services/__tests__/tmdbService.test.js
const tmdbService = require('../tmdbService');
const axios = require('axios');
const { cache } = require('../../config/redis');

jest.mock('axios');
jest.mock('../../config/redis');

describe('TMDBService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    cache.get.mockResolvedValue(null);
    cache.set.mockResolvedValue(true);
  });

  describe('searchMovies', () => {
    it('deve buscar filmes por título', async () => {
      const mockResponse = {
        data: {
          results: [
            {
              id: 1,
              title: 'Inception',
              vote_average: 8.8,
              genre_ids: [878, 28],
              poster_path: '/poster.jpg',
            },
          ],
          total_pages: 1,
          total_results: 1,
          page: 1,
        },
      };

      axios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await tmdbService.searchMovies('Inception', 1);

      expect(result).toHaveProperty('results');
      expect(result.results).toBeInstanceOf(Array);
      expect(result.results[0]).toHaveProperty('title');
      expect(result.results[0].title).toBe('Inception');
    });

    it('deve usar cache quando disponível', async () => {
      const cachedData = {
        results: [{ id: 1, title: 'Cached Movie' }],
        total_pages: 1,
      };

      cache.get.mockResolvedValueOnce(cachedData);

      const result = await tmdbService.searchMovies('test', 1);

      expect(result).toEqual(cachedData);
      expect(cache.get).toHaveBeenCalledWith('tmdb:search:test:1');
    });
  });

  describe('getMovieDetails', () => {
    it('deve retornar detalhes completos do filme', async () => {
      const mockResponse = {
        data: {
          id: 1,
          title: 'Inception',
          runtime: 148,
          genres: [{ id: 878, name: 'Sci-Fi' }],
          credits: {
            crew: [{ job: 'Director', name: 'Christopher Nolan', id: 525 }],
            cast: [{ name: 'Leonardo DiCaprio', character: 'Cobb' }],
          },
          keywords: { keywords: [{ name: 'dream' }] },
          similar: { results: [] },
          videos: { results: [] },
        },
      };

      axios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await tmdbService.getMovieDetails(1);

      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('runtime');
      expect(result).toHaveProperty('director');
      expect(result.director.name).toBe('Christopher Nolan');
    });
  });

  describe('discoverMovies', () => {
    it('deve descobrir filmes com filtros', async () => {
      const mockResponse = {
        data: {
          results: [
            { id: 1, title: 'Movie 1', vote_average: 8.0 },
            { id: 2, title: 'Movie 2', vote_average: 7.5 },
          ],
          total_pages: 5,
          page: 1,
        },
      };

      axios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await tmdbService.discoverMovies({
        with_genres: 878,
        min_rating: 7.0,
        min_votes: 100,
      });

      expect(result).toHaveProperty('results');
      expect(result.results.length).toBe(2);
    });
  });
});
