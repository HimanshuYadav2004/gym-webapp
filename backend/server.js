import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

dotenv.config();

// Import routes
import authRoutes from './routes/authRoutes.js';
import membershipRoutes from './routes/membershipRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import checkinRoutes from './routes/checkinRoutes.js';
import licenseRoutes from './routes/licenseRoutes.js';
import superAdminRoutes from './routes/superAdminRoutes.js';
import { startAutoCheckoutJob } from './jobs/autoCheckout.js';

// Use Supabase storage for production, local storage for development
const useSupabaseStorage = process.env.USE_SUPABASE_STORAGE === 'true';
const memberRoutes = useSupabaseStorage
  ? (await import('./routes/memberRoutesSupabase.js')).default
  : (await import('./routes/memberRoutes.js')).default;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Create uploads directory if it doesn't exist
const uploadsDir = join(__dirname, 'uploads', 'members');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
// CSP is disabled here — this server only serves JSON + uploaded images, never
// HTML, so a page-oriented CSP has nothing to protect and would only risk
// interfering with the /uploads static route. crossOriginResourcePolicy is
// relaxed for the same reason: member photos are loaded cross-origin from the
// Vercel-hosted frontend, and Helmet's default 'same-origin' would block that.
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser clients (curl, server-to-server) which send no Origin header
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  }
}));
// Capture the raw body alongside the parsed one — the Razorpay webhook
// signature is computed over the exact raw bytes, which express.json()
// otherwise discards after parsing.
app.use(express.json({ verify: (req, res, buf) => { req.rawBody = buf; } }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/checkin', checkinRoutes);
app.use('/api/license', licenseRoutes);
app.use('/api/super-admin', superAdminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Gym Management API is running' });
});

// Error handling middleware — full detail stays server-side only; a client
// (or an attacker probing for info) never sees more than a generic message.
app.use((err, req, res, next) => {
  console.error(err.stack);
  const message = process.env.NODE_ENV === 'production' ? 'Something went wrong!' : (err.message || 'Something went wrong!');
  res.status(err.status || 500).json({ error: message });
});

app.listen(PORT, () => {
  console.log(`🏋️ Server is running on port ${PORT}`);
  console.log(`📍 API URL: http://localhost:${PORT}`);
  startAutoCheckoutJob();
});
