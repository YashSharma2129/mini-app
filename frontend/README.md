# TradingApp Frontend

A modern React frontend for the TradingApp financial trading platform, built with React 18, Tailwind CSS, and modern web technologies.

## 🚀 Features

- **Modern UI/UX**: Clean, responsive design with Tailwind CSS
- **Authentication**: Login/register with JWT integration
- **KYC Management**: Complete KYC form with file upload
- **Product Browsing**: Search, filter, and view investment products
- **Trading**: Buy products with virtual wallet
- **Portfolio**: Dashboard with performance analytics
- **Watchlist**: Track favorite products
- **Transaction History**: View all trading activities
- **Responsive Design**: Mobile-first approach
- **Real-time Updates**: Live data and notifications

## 🛠️ Tech Stack

- **React 18** - UI framework
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Data visualization
- **React Hook Form** - Form management
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Lucide React** - Icon library
- **Yup** - Schema validation

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running on port 5000

## 🚀 Installation

```bash
# Install dependencies
npm install

# Start development server
npm start
```

The application will be available at http://localhost:3000

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Proxy Configuration
The app is configured to proxy API requests to the backend server.

## 📱 Pages & Components

### Pages
- **Home** (`/`) - Landing page with features and stats
- **Login** (`/login`) - User authentication
- **Register** (`/register`) - User registration
- **KYC** (`/kyc`) - KYC form submission
- **Dashboard** (`/dashboard`) - User dashboard
- **Products** (`/products`) - Product listing and search
- **Product Detail** (`/products/:id`) - Individual product view
- **Portfolio** (`/portfolio`) - Portfolio management
- **Transactions** (`/transactions`) - Transaction history

### Components

#### UI Components
- **Button** - Reusable button component
- **Input** - Form input component
- **Card** - Card layout component
- **Badge** - Status badge component
- **LoadingSpinner** - Loading indicator

#### Layout Components
- **Header** - Navigation header
- **Footer** - Application footer

#### Feature Components
- **ProductCard** - Product display card
- **ProductFilters** - Product filtering
- **BuyProductModal** - Product purchase modal
- **KYCForm** - KYC submission form
- **LoginForm** - Authentication form
- **RegisterForm** - Registration form

## 🎨 Styling

### Tailwind CSS Configuration
- Custom color palette
- Responsive design utilities
- Animation classes
- Component-specific styles

### Design System
- **Colors**: Primary, success, danger, warning variants
- **Typography**: Inter font family
- **Spacing**: Consistent spacing scale
- **Components**: Reusable UI components

## 🔐 Authentication

### Auth Context
- Global authentication state
- JWT token management
- User profile management
- Protected routes

### Features
- Automatic token refresh
- Secure logout
- Role-based access
- Persistent sessions

## 📊 Data Visualization

### Charts
- **Line Charts**: Portfolio performance
- **Pie Charts**: Portfolio allocation
- **Responsive**: Mobile-friendly charts

### Libraries
- **Recharts**: Chart components
- **ResponsiveContainer**: Responsive chart containers

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Features
- Mobile-first approach
- Touch-friendly interfaces
- Responsive navigation
- Adaptive layouts

## 🚀 Performance

### Optimization
- **Code Splitting**: Route-based splitting
- **Lazy Loading**: Component lazy loading
- **Memoization**: React.memo for components
- **Bundle Optimization**: Webpack optimization

### Caching
- **API Caching**: Axios interceptors
- **Local Storage**: User data persistence
- **Service Workers**: Offline support (future)

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🚀 Build & Deployment

### Development
```bash
npm start
```

### Production Build
```bash
npm run build
```

### Deployment
The build folder contains the production-ready files.

#### Vercel
1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `build`
4. Deploy automatically

#### Netlify
1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Deploy automatically

## 📁 Project Structure

```
frontend/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── auth/          # Authentication components
│   │   ├── kyc/           # KYC components
│   │   ├── layout/        # Layout components
│   │   ├── products/      # Product components
│   │   └── ui/            # Reusable UI components
│   ├── context/           # React contexts
│   ├── pages/             # Page components
│   ├── utils/             # Utility functions
│   ├── App.js             # Main app component
│   ├── index.js           # Entry point
│   └── index.css          # Global styles
├── package.json
└── README.md
```

## 🔧 Available Scripts

```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
npm run eject      # Eject from Create React App
```

## 📱 Mobile Features

### Touch Support
- Touch-friendly buttons
- Swipe gestures
- Mobile navigation
- Responsive forms

### PWA Features
- Service worker ready
- Offline support (future)
- App-like experience
- Install prompts

## 🎯 User Experience

### Features
- **Intuitive Navigation**: Easy-to-use interface
- **Real-time Feedback**: Instant notifications
- **Loading States**: Smooth loading indicators
- **Error Handling**: User-friendly error messages
- **Accessibility**: WCAG compliant

### Performance
- **Fast Loading**: Optimized bundle size
- **Smooth Animations**: CSS transitions
- **Responsive**: Works on all devices
- **Offline Ready**: Service worker support

## 🔍 Development

### Code Quality
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Husky**: Git hooks
- **Lint-staged**: Pre-commit linting

### Best Practices
- **Component Composition**: Reusable components
- **Custom Hooks**: Logic reuse
- **Context API**: State management
- **Error Boundaries**: Error handling

## 📞 Support

For issues and questions:
- Email: ai@enxtai.com
- Phone: +91 82794-25232

## 🎥 Demo

### Demo Credentials
- **Admin**: admin@tradingapp.com / password123
- **User**: john@example.com / password123

### Features Demo
1. User registration and KYC
2. Product browsing and purchasing
3. Portfolio management
4. Transaction history
5. Admin features

---

**Built for EnxtAI Full-Stack Developer Assignment**
