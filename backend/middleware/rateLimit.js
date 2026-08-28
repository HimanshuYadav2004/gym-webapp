import rateLimit from 'express-rate-limit';

// Login/register — generous enough for real use, blocks credential-stuffing/brute force
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { error: 'Too many attempts. Please try again in a few minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Public check-in lookup/confirm — no login required, so this is the most exposed
// surface for phone-number enumeration or spam check-ins
export const checkinLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  message: { error: 'Too many attempts. Please wait a few minutes and try again.' },
  standardHeaders: true,
  legacyHeaders: false
});
