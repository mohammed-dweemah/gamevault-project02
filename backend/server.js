require('dotenv').config();

const express    = require('express');
const mongoose   = require('mongoose');
const session    = require('express-session');
const MongoStore = require('connect-mongo');
const cors       = require('cors');

const authRoutes  = require('./routes/auth');
const gameRoutes  = require('./routes/games');
const postLogger  = require('./middleware/postLogger');

const app      = express();
const PORT     = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const isProd   = process.env.NODE_ENV === 'production';

if (!MONGO_URI) {
  console.error('MONGO_URI is not defined');
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// ── TRUST PROXY (مهم جداً لـ Render) ─────────────────
app.set('trust proxy', 1);

// ── CORS ──────────────────────────────────────────────
// نسمح لأي origin يرسل credentials — الحل الصحيح للـ mobile
app.use(cors({
  origin: function (origin, callback) {
    // السماح لـ requests بدون origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    const allowed = [
      process.env.CLIENT_URL,
      'http://localhost:5173',
      'http://localhost:3000',
    ].filter(Boolean);

    // السماح لأي onrender.com domain
    if (
      allowed.some(o => origin.startsWith(o.replace(/\/$/, ''))) ||
      origin.includes('onrender.com') ||
      origin.includes('localhost')
    ) {
      return callback(null, true);
    }

    // في production نسمح لكل شيء لتجنب مشاكل الـ mobile
    if (isProd) return callback(null, true);

    callback(new Error('CORS: origin not allowed'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── SESSION ───────────────────────────────────────────
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: MONGO_URI,
    ttl: 7 * 24 * 60 * 60, // 7 أيام
    touchAfter: 24 * 3600,  // تحديث الـ session مرة كل 24 ساعة فقط
  }),
  name: 'gamevault.sid',
  cookie: {
    httpOnly: true,
    secure: isProd,          // true في production (HTTPS)
    sameSite: isProd ? 'none' : 'lax', // 'none' ضروري للـ cross-site على الهاتف
    maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 أيام
  },
}));

app.use(postLogger);
app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((req, res) => res.status(404).json({ message: 'Route not found.' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`   Mode: ${isProd ? 'production' : 'development'}`);
  console.log(`   CLIENT_URL: ${process.env.CLIENT_URL || 'not set'}`);
});
