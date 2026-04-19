// src/server.js
// =============================================
// CINEMATCH BACKEND - Main Server Entry Point
// =============================================
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Import routes
const authRoutes = require('./routes/auth');
const moviesRoutes = require('./routes/movies');
const ratingsRoutes = require('./routes/ratings');
const profileRoutes = require('./routes/profile');

const app = express();
const PORT = process.env.PORT || 3001;

// =============================================
// SECURITY MIDDLEWARE
// =============================================

// Helmet sets secure HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow images from TMDB
}));

// CORS - allow frontend to access the API
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'http://localhost:3001',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Rate limiting - prevent abuse
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, error: 'Muitas requisições. Tente novamente em alguns minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Stricter limit for auth endpoints
  message: { success: false, error: 'Muitas tentativas de login. Aguarde 15 minutos.' },
});

app.use('/api/', generalLimiter);
app.use('/api/auth/', authLimiter);

// =============================================
// REQUEST PARSING MIDDLEWARE
// =============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// =============================================
// API ROUTES
// =============================================
app.use('/api/auth', authRoutes);
app.use('/api/movies', moviesRoutes);
app.use('/api/ratings', ratingsRoutes);
app.use('/api/profile', profileRoutes);

// =============================================
// HEALTH CHECK
// =============================================
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'CineMatch API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

app.get('/', (req, res) => {
  res.json({
    message: '🎬 CineMatch API',
    docs: 'See /health for status',
    endpoints: {
      auth: '/api/auth',
      movies: '/api/movies',
      ratings: '/api/ratings',
      profile: '/api/profile',
    },
  });
});

// =============================================
// 404 HANDLER
// =============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Rota não encontrada: ${req.method} ${req.path}`,
  });
});

// =============================================
// GLOBAL ERROR HANDLER
// =============================================
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);

  // Don't leak error details in production
  const message = process.env.NODE_ENV === 'production'
    ? 'Erro interno do servidor'
    : err.message;

  res.status(err.status || 500).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// =============================================
// START SERVER
// =============================================
app.listen(PORT, () => {
  console.log('\n🎬 ================================');
  console.log(`🎬  CineMatch API is running!`);
  console.log(`🎬  Port: ${PORT}`);
  console.log(`🎬  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🎬  Health: http://localhost:${PORT}/health`);
  console.log('🎬 ================================\n');

  if (!process.env.TMDB_API_KEY || process.env.TMDB_API_KEY === 'your_tmdb_api_key_here') {
    console.warn('⚠️  WARNING: TMDB_API_KEY not set! Movie features won\'t work.');
    console.warn('   Get a free key at: https://www.themoviedb.org/settings/api\n');
  }
});

module.exports = app;
