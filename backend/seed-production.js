#!/usr/bin/env node

/**
 * Production Database Seeding Script
 * Run this script to seed your Render PostgreSQL database
 */

require('dotenv').config();
const { seedDatabase } = require('./src/scripts/seed');

console.log('🚀 Starting production database seeding...');
console.log('📊 Database URL:', process.env.DATABASE_URL ? 'Set ✅' : 'Not set ❌');
console.log('🔑 JWT Secret:', process.env.JWT_SECRET ? 'Set ✅' : 'Not set ❌');
console.log('🌍 Environment:', process.env.NODE_ENV || 'development');

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required!');
  console.log('Please set your Render database URL:');
  console.log('DATABASE_URL=postgresql://username:password@host:port/database');
  process.exit(1);
}

seedDatabase()
  .then(() => {
    console.log('🎉 Production seeding completed successfully!');
    console.log('✅ Your Render database is now ready with sample data');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Production seeding failed:', error);
    process.exit(1);
  });
