const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');

// Load environment variables from backend or root .env
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config();

const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const paymentRoutes = require('./routes/payments');
const contentRoutes = require('./routes/content');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Security HTTP headers
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS Configuration: Restrict to ALLOWED_ORIGINS env var, default same-origin only
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()).filter(Boolean)
  : [];

app.use(cors((req, callback) => {
  const origin = req.headers.origin;
  const host = req.headers.host;

  // Requests without Origin header (e.g. server-to-server, same-origin scripts)
  if (!origin) {
    return callback(null, {
      origin: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Range']
    });
  }

  // If explicit ALLOWED_ORIGINS allowlist is provided
  if (allowedOrigins.length > 0) {
    if (allowedOrigins.includes(origin)) {
      return callback(null, {
        origin: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Range']
      });
    }
    return callback(new Error('Not allowed by CORS'));
  }

  // Default: same origin only
  const isSameOrigin = host && (
    origin === `http://${host}` ||
    origin === `https://${host}`
  );

  if (isSameOrigin) {
    return callback(null, {
      origin: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Range']
    });
  }

  return callback(new Error('Not allowed by CORS: Only same-origin access is permitted by default.'));
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve thumbnails statically
app.use('/uploads/thumbnails', express.static(path.join(__dirname, 'uploads', 'thumbnails')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'EduLearn Portal API'
  });
});

// Serve frontend static build if available
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  // Fallback for single page application (SPA) routing
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api/') && !req.path.startsWith('/uploads/')) {
      return res.sendFile(path.join(frontendDist, 'index.html'));
    }
    next();
  });
}

// Error handler (CORS and general errors)
app.use((err, req, res, next) => {
  if (err && err.message && err.message.includes('CORS')) {
    return res.status(403).json({ success: false, message: err.message });
  }
  next(err);
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`===============================================`);
  console.log(`EduLearn Portal Server is running on:`);
  console.log(`-> Local:   http://localhost:${PORT}`);
  console.log(`-> API:     http://localhost:${PORT}/api/health`);
  console.log(`===============================================`);
});
