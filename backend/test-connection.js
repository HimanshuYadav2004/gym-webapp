import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

console.log('🔍 Testing Supabase Connection...\n');
console.log('📍 Database URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@') || 'Not set');
console.log('');

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function testConnection() {
  try {
    console.log('⏳ Connecting to database...');
    await prisma.$connect();
    console.log('✅ Connected successfully!\n');
    
    console.log('🔍 Testing query...');
    const result = await prisma.$queryRaw`SELECT current_database(), current_user, version()`;
    console.log('✅ Query successful!');
    console.log('📊 Database info:', result[0]);
    console.log('');
    
    console.log('🔍 Checking tables...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    if (tables.length > 0) {
      console.log('✅ Found tables:');
      tables.forEach(table => console.log(`  - ${table.table_name}`));
    } else {
      console.log('⚠️  No tables found. Run create-tables.sql first!');
    }
    
  } catch (error) {
    console.error('❌ Connection failed!');
    console.error('Error:', error.message);
    console.error('');
    console.error('💡 Troubleshooting:');
    console.error('1. Check your DATABASE_URL in .env file');
    console.error('2. Get the correct connection string from Supabase:');
    console.error('   Dashboard → Settings → Database → Connection string');
    console.error('3. Use the "Connection pooling" string (port 6543)');
    console.error('4. Make sure to URL-encode special characters in password');
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
