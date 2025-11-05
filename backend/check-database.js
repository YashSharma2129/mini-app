#!/usr/bin/env node

/**
 * Database Structure Checker
 * This script checks what columns exist in your database tables
 */

require('dotenv').config();
const pool = require('./src/config/database');

const checkDatabaseStructure = async () => {
  try {
    console.log('🔍 Checking database structure...');
    
    // Check if tables exist
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('\n📋 Existing tables:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // Check products table structure
    console.log('\n📈 Products table structure:');
    const productsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'products' 
      ORDER BY ordinal_position;
    `);
    
    if (productsResult.rows.length > 0) {
      productsResult.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
    } else {
      console.log('  ❌ Products table does not exist');
    }
    
    // Check users table structure
    console.log('\n👥 Users table structure:');
    const usersResult = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position;
    `);
    
    if (usersResult.rows.length > 0) {
      usersResult.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
    } else {
      console.log('  ❌ Users table does not exist');
    }
    
    // Check sample data
    console.log('\n📊 Sample data check:');
    
    const usersCount = await pool.query('SELECT COUNT(*) FROM users');
    console.log(`  - Users: ${usersCount.rows[0].count}`);
    
    const productsCount = await pool.query('SELECT COUNT(*) FROM products');
    console.log(`  - Products: ${productsCount.rows[0].count}`);
    
    const portfolioCount = await pool.query('SELECT COUNT(*) FROM portfolio');
    console.log(`  - Portfolio entries: ${portfolioCount.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await pool.end();
  }
};

checkDatabaseStructure();
