#!/usr/bin/env node

require('dotenv').config();
const pool = require('./src/config/database');

const checkUsers = async () => {
  try {
    console.log('👥 Checking existing users...');
    
    const usersResult = await pool.query('SELECT id, name, email, role FROM users ORDER BY id');
    
    console.log('\n📋 Existing users:');
    usersResult.rows.forEach(user => {
      console.log(`  ID: ${user.id} | Name: ${user.name} | Email: ${user.email} | Role: ${user.role}`);
    });
    
    console.log(`\n📊 Total users: ${usersResult.rows.length}`);
    
    // Check products
    console.log('\n📈 Checking products...');
    const productsResult = await pool.query('SELECT id, name, current_price FROM products ORDER BY id');
    
    console.log('\n📋 Existing products:');
    productsResult.rows.forEach(product => {
      console.log(`  ID: ${product.id} | Name: ${product.name} | Price: ₹${product.current_price}`);
    });
    
    console.log(`\n📊 Total products: ${productsResult.rows.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
};

checkUsers();
