import { execSync } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔧 Setting up database...');
console.log('📍 Database URL:', process.env.DATABASE_URL?.split('@')[1] || 'Not set');

try {
  console.log('\n1️⃣ Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  console.log('\n2️⃣ Pushing schema to database...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  
  console.log('\n✅ Database setup complete!');
  console.log('🎉 You can now start your server with: npm run dev');
} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
}
