# TradingApp Backend API

A robust Node.js backend API for the TradingApp financial trading platform.

## 🚀 Features

- **Authentication**: JWT-based user authentication
- **KYC Management**: Complete KYC workflow with file uploads
- **Product Management**: CRUD operations for investment products
- **Transaction Processing**: Buy/sell transactions with wallet management
- **Portfolio Management**: User portfolio tracking and analytics
- **Admin Panel**: User and transaction management
- **Security**: Rate limiting, input validation, and secure file handling
- **Caching**: Redis integration for improved performance

## 🛠️ Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Primary database
- **Redis** - Caching layer (optional)
- **JWT** - Authentication tokens
- **Multer** - File upload handling
- **Joi** - Data validation
- **bcryptjs** - Password hashing
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Redis (optional, for caching)

## 🚀 Installation

```bash
# Install dependencies
npm install

# Create environment file
cp env.example .env

# Set up database
createdb trading_app

# Seed database with sample data
npm run seed

# Start development server
npm run dev
```

## 🔧 Environment Variables

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=trading_app
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5001
NODE_ENV=development

# Redis Configuration (Optional)
REDIS_URL=redis://localhost:6379

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### KYC Management
- `POST /api/kyc/submit` - Submit KYC documents
- `GET /api/kyc/status` - Get KYC status
- `GET /api/kyc/all` - Get all KYC submissions (Admin)
- `PUT /api/kyc/:id/status` - Update KYC status (Admin)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/search?q=term` - Search products
- `GET /api/products/category/:category` - Get products by category
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id/price` - Update product price (Admin)

### Transactions
- `POST /api/transactions/buy` - Buy product
- `GET /api/transactions/my` - Get user transactions
- `GET /api/transactions/stats` - Get transaction statistics
- `GET /api/transactions/all` - Get all transactions (Admin)

### Portfolio
- `GET /api/portfolio` - Get user portfolio
- `GET /api/portfolio/summary` - Get portfolio summary
- `GET /api/portfolio/watchlist` - Get watchlist
- `POST /api/portfolio/watchlist/:productId` - Add to watchlist
- `DELETE /api/portfolio/watchlist/:productId` - Remove from watchlist

### Admin
- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get user by ID
- `PUT /api/admin/users/:id/wallet` - Update user wallet

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Input Validation**: Joi schema validation
- **Rate Limiting**: Prevent API abuse
- **CORS**: Configured for frontend integration
- **Helmet**: Security headers
- **File Upload Security**: Type and size validation

## 📊 Database Schema

### Users
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(15),
  role VARCHAR(20) DEFAULT 'user',
  wallet_balance DECIMAL(15,2) DEFAULT 100000.00,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Products
```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  pe_ratio DECIMAL(8,2),
  market_cap BIGINT,
  volume BIGINT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Transactions
```sql
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  type VARCHAR(10) NOT NULL CHECK (type IN ('buy', 'sell')),
  units DECIMAL(15,4) NOT NULL,
  price_per_unit DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### KYC
```sql
CREATE TABLE kyc (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  pan_number VARCHAR(10) UNIQUE NOT NULL,
  address TEXT NOT NULL,
  phone VARCHAR(15) NOT NULL,
  id_image_path VARCHAR(500),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Watchlist
```sql
CREATE TABLE watchlist (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);
```

## 🚀 Scripts

```bash
# Development
npm run dev          # Start with nodemon
npm start           # Start production server

# Database
npm run seed        # Seed database with sample data
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Database and Redis configuration
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── scripts/         # Database seeding scripts
│   └── server.js        # Main server file
├── uploads/             # File upload directory
├── package.json
└── README.md
```

## 🔧 Middleware

- **Authentication**: JWT token verification
- **Authorization**: Role-based access control
- **Validation**: Request data validation
- **File Upload**: Secure file handling
- **Rate Limiting**: API request limiting
- **Error Handling**: Global error handling

## 📈 Performance

- **Redis Caching**: Product listing caching
- **Database Indexing**: Optimized queries
- **Connection Pooling**: PostgreSQL connection management
- **Compression**: Response compression
- **Rate Limiting**: API abuse prevention

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run with coverage
npm run test:coverage
```

## 🚀 Deployment

### Railway/Render
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

### Docker
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5001
CMD ["npm", "start"]
```

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": ["Validation error details"]
}
```

## 🔍 Health Check

```http
GET /health
```

Response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 📞 Support

For issues and questions:
- Email: ai@enxtai.com
- Phone: +91 82794-25232

---

**Built for EnxtAI Full-Stack Developer Assignment**
