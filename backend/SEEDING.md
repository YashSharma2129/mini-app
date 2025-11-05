# 🌱 Database Seeding Guide

This guide shows you how to seed your Render PostgreSQL database with sample data.

## 🚀 Quick Start

### Method 1: Run Seeding Script Locally (Recommended)

1. **Set up environment variables for production database:**
   ```bash
   # Create a temporary .env file with your Render database credentials
   echo "DATABASE_URL=postgresql://mini_app_database_user:pLeIDxvXwxA9TSwy41dl8wM6ofj4wmCf@dpg-d3brmtb7mgec739vq6tg-a.oregon-postgres.render.com/mini_app_database" > .env
   echo "JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-secure" >> .env
   echo "NODE_ENV=production" >> .env
   ```

2. **Run the production seeding script:**
   ```bash
   npm run seed:production
   ```

3. **Clean up (optional):**
   ```bash
   rm .env  # Remove the temporary .env file
   ```

### Method 2: Deploy with Auto-Seeding

The backend server automatically creates tables and seeds data on startup if they don't exist. Just make sure your Render backend service has these environment variables:

```
DATABASE_URL=postgresql://mini_app_database_user:pLeIDxvXwxA9TSwy41dl8wM6ofj4wmCf@dpg-d3brmtb7mgec739vq6tg-a.oregon-postgres.render.com/mini_app_database
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-secure
NODE_ENV=production
FRONTEND_URL=https://mini-app-frontend-git-main-yashsharma2129s-projects.vercel.app
REDIS_URL=redis://red-d3brooali9vc73d1lld0:6379
```

## 📊 What Gets Seeded

### Users
- **Admin User**: `admin@tradingapp.com` / `password123`
- **John Doe**: `john@example.com` / `password123`
- **Jane Smith**: `jane@example.com` / `password123`

### Products
- **Stocks**: Reliance, TCS, HDFC Bank, Infosys
- **Mutual Funds**: SBI Bluechip Fund, Axis Long Term Equity, ICICI Technology Fund

### Sample Data
- Portfolio holdings
- Watchlist items
- Notifications
- KYC records
- Audit logs
- Sample transactions

## 🔧 Troubleshooting

### SSL/TLS Required Error
Make sure you're using the full `DATABASE_URL` with SSL configuration.

### Connection Refused
Verify your `DATABASE_URL` is correct and the database is accessible.

### Permission Denied
Ensure your database user has CREATE TABLE permissions.

## ✅ Verification

After seeding, you can verify the data by:

1. **Check users:**
   ```sql
   SELECT id, name, email, role FROM users;
   ```

2. **Check products:**
   ```sql
   SELECT id, name, category, price FROM products;
   ```

3. **Check portfolio:**
   ```sql
   SELECT u.name, p.name as product, po.quantity, po.average_price 
   FROM portfolio po 
   JOIN users u ON po.user_id = u.id 
   JOIN products p ON po.product_id = p.id;
   ```

## 🎯 Next Steps

After seeding:
1. Deploy your backend to Render with the environment variables
2. Test login with `admin@tradingapp.com` / `password123`
3. Verify your frontend can connect to the API
4. Check that products and portfolio data loads correctly
