require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const ApiError = require('./utils/ApiError');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const recordRoutes = require('./routes/recordRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
connectDB();

app.use(helmet());

// Proper CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'https://finance-dashboard-five-sage.vercel.app'
];
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like Postman, curl, or direct browser access)
    if (!origin) return callback(null, true);

    // Allow explicitly listed origins OR any Vercel deployment preview URL
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      // Passes the error down to your centralized errorHandler gracefully
      callback(new ApiError(403, 'Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies / authorization headers
  optionsSuccessStatus: 200
};

// Apply CORS middleware BEFORE routes
app.use(cors(corsOptions));
// Handle preflight requests (OPTIONS) for all routes properly
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Basic brute-force and DoS protection per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests'
});
app.use('/api', apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use((req, res, next) => {
  next(new ApiError(404, 'Not found'));
});

app.use(errorHandler);

module.exports = app;
