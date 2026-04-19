// src/config/initDb.js
// Run this script once to create all database tables: node src/config/initDb.js
require('dotenv').config();
const { query, pool } = require('./database');

const initializeDatabase = async () => {
  console.log('🎬 Initializing CineMatch Database...\n');

  try {
    // =============================================
    // USERS TABLE - Core user accounts
    // =============================================
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        avatar_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_login TIMESTAMP WITH TIME ZONE
      )
    `);
    console.log('✅ Table: users');

    // =============================================
    // USER RATINGS TABLE - Movie ratings by users
    // =============================================
    await query(`
      CREATE TABLE IF NOT EXISTS user_ratings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        tmdb_movie_id INTEGER NOT NULL,
        movie_title VARCHAR(500) NOT NULL,
        movie_poster TEXT,
        rating DECIMAL(3,1) CHECK (rating >= 0 AND rating <= 10),
        watched BOOLEAN DEFAULT true,
        watchlist BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, tmdb_movie_id)
      )
    `);
    console.log('✅ Table: user_ratings');

    // =============================================
    // USER PREFERENCES TABLE - Computed profile
    // =============================================
    await query(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        genre_weights JSONB DEFAULT '{}',        -- { "28": 0.8, "18": 0.6, ... }
        narrative_profile JSONB DEFAULT '{}',    -- { "complex": 0.7, "emotional": 0.9 }
        style_profile JSONB DEFAULT '{}',        -- { "action": 0.3, "drama": 0.8 }
        avg_rating_given DECIMAL(3,1) DEFAULT 0,
        total_movies_rated INTEGER DEFAULT 0,
        onboarding_completed BOOLEAN DEFAULT false,
        computed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('✅ Table: user_preferences');

    // =============================================
    // MOVIE CACHE TABLE - Cache TMDB responses
    // =============================================
    await query(`
      CREATE TABLE IF NOT EXISTS movie_cache (
        tmdb_id INTEGER PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        original_title VARCHAR(500),
        overview TEXT,
        poster_path TEXT,
        backdrop_path TEXT,
        release_date DATE,
        vote_average DECIMAL(4,2),
        vote_count INTEGER,
        popularity DECIMAL(10,3),
        genre_ids INTEGER[],
        runtime INTEGER,
        budget BIGINT,
        revenue BIGINT,
        director VARCHAR(255),
        keywords TEXT[],
        cached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('✅ Table: movie_cache');

    // =============================================
    // RECOMMENDATION LOG TABLE - Track what was shown
    // =============================================
    await query(`
      CREATE TABLE IF NOT EXISTS recommendation_log (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        tmdb_movie_id INTEGER NOT NULL,
        recommendation_type VARCHAR(50) NOT NULL, -- 'hidden_gem', 'similar', 'genre_match'
        score DECIMAL(5,4),
        reason TEXT,
        clicked BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('✅ Table: recommendation_log');

    // =============================================
    // INDEXES for performance
    // =============================================
    await query(`CREATE INDEX IF NOT EXISTS idx_user_ratings_user_id ON user_ratings(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_user_ratings_movie_id ON user_ratings(tmdb_movie_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_recommendation_log_user ON recommendation_log(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_movie_cache_popularity ON movie_cache(popularity)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_movie_cache_vote ON movie_cache(vote_average)`);
    console.log('✅ Indexes created');

    console.log('\n🎉 Database initialized successfully!');
    console.log('📌 Next step: Set your TMDB_API_KEY in .env and start the server.\n');

  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

initializeDatabase();
