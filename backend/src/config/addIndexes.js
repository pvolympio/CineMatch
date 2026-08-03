// src/config/addIndexes.js
// Script to add database indexes for performance optimization
const { query } = require('./database');

const addIndexes = async () => {
  console.log('🔧 Adding database indexes...\n');

  const indexes = [
    {
      name: 'idx_user_ratings_user_id',
      sql: 'CREATE INDEX IF NOT EXISTS idx_user_ratings_user_id ON user_ratings(user_id);',
      description: 'Index on user_ratings.user_id for faster user queries',
    },
    {
      name: 'idx_user_ratings_tmdb_movie_id',
      sql: 'CREATE INDEX IF NOT EXISTS idx_user_ratings_tmdb_movie_id ON user_ratings(tmdb_movie_id);',
      description: 'Index on user_ratings.tmdb_movie_id for faster movie lookups',
    },
    {
      name: 'idx_user_ratings_user_movie',
      sql: 'CREATE INDEX IF NOT EXISTS idx_user_ratings_user_movie ON user_ratings(user_id, tmdb_movie_id);',
      description: 'Composite index for user-movie pair lookups',
    },
    {
      name: 'idx_user_ratings_watched',
      sql: 'CREATE INDEX IF NOT EXISTS idx_user_ratings_watched ON user_ratings(user_id, watched) WHERE watched = true;',
      description: 'Partial index for watched movies',
    },
    {
      name: 'idx_user_ratings_watchlist',
      sql: 'CREATE INDEX IF NOT EXISTS idx_user_ratings_watchlist ON user_ratings(user_id, watchlist) WHERE watchlist = true;',
      description: 'Partial index for watchlist',
    },
    {
      name: 'idx_movie_cache_tmdb_id',
      sql: 'CREATE INDEX IF NOT EXISTS idx_movie_cache_tmdb_id ON movie_cache(tmdb_id);',
      description: 'Index on movie_cache.tmdb_id',
    },
    {
      name: 'idx_movie_cache_cached_at',
      sql: 'CREATE INDEX IF NOT EXISTS idx_movie_cache_cached_at ON movie_cache(cached_at);',
      description: 'Index on movie_cache.cached_at for cache expiration queries',
    },
    {
      name: 'idx_recommendation_log_user_id',
      sql: 'CREATE INDEX IF NOT EXISTS idx_recommendation_log_user_id ON recommendation_log(user_id);',
      description: 'Index on recommendation_log.user_id',
    },
    {
      name: 'idx_recommendation_log_created_at',
      sql: 'CREATE INDEX IF NOT EXISTS idx_recommendation_log_created_at ON recommendation_log(created_at);',
      description: 'Index on recommendation_log.created_at for time-based queries',
    },
    {
      name: 'idx_users_email',
      sql: 'CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);',
      description: 'Unique index on users.email',
    },
    {
      name: 'idx_users_username',
      sql: 'CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username);',
      description: 'Unique index on users.username',
    },
  ];

  let successCount = 0;
  let errorCount = 0;

  for (const index of indexes) {
    try {
      await query(index.sql);
      console.log(`✅ ${index.name}: ${index.description}`);
      successCount++;
    } catch (error) {
      console.error(`❌ ${index.name}: ${error.message}`);
      errorCount++;
    }
  }

  console.log(`\n📊 Summary: ${successCount} indexes created, ${errorCount} errors`);
  process.exit(errorCount > 0 ? 1 : 0);
};

addIndexes().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
