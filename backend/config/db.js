import { PrismaClient } from '@prisma/client';

// Full query logging (with bound parameter values — password hashes, payment
// amounts, phone numbers) is fine for local dev but must not go to Render's
// log stream in production.
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'production' ? ['error'] : ['query', 'info', 'warn', 'error'],
});

export default prisma;
