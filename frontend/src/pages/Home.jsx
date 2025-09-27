import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  TrendingUp, 
  Shield, 
  Zap, 
  BarChart3,
  ArrowRight,
  Star,
  Users,
  DollarSign
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardFooter } from '../components/ui/card';

const Home = () => {
  const { isAuthenticated } = useAuth();    

  const features = [
    {
      icon: <TrendingUp className="h-8 w-8 text-primary-600" />,
      title: 'Real-time Trading',
      description: 'Buy and sell stocks and mutual funds with real-time market data and instant execution.'
    },
    {
      icon: <Shield className="h-8 w-8 text-primary-600" />,
      title: 'Secure Platform',
      description: 'Bank-grade security with encrypted transactions and secure authentication.'
    },
    {
      icon: <Zap className="h-8 w-8 text-primary-600" />,
      title: 'Fast Execution',
      description: 'Lightning-fast order execution with minimal latency for optimal trading experience.'
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-primary-600" />,
      title: 'Advanced Analytics',
      description: 'Comprehensive portfolio analytics and performance tracking with detailed insights.'
    }
  ];

  const stats = [
    { label: 'Active Users', value: '10,000+', icon: <Users className="h-6 w-6" /> },
    { label: 'Total Volume', value: '₹50Cr+', icon: <DollarSign className="h-6 w-6" /> },
    { label: 'Products', value: '500+', icon: <TrendingUp className="h-6 w-6" /> },
    { label: 'Success Rate', value: '99.9%', icon: <Star className="h-6 w-6" /> }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Trade Smart,{' '}
              <span className="text-primary-600">Trade Simple</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Join thousands of investors who trust our platform for their financial growth. 
              Start your trading journey with ₹100,000 virtual balance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link to="/products">
                  <Button size="lg" className="text-lg px-8">
                    Start Trading
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <Button size="lg" className="text-lg px-8">
                      Get Started Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline" size="lg" className="text-lg px-8">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-full text-primary-600">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose TradingApp?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We provide everything you need to make informed trading decisions and grow your wealth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent>
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Trading?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join our platform today and get started with ₹100,000 virtual balance. 
            No risk, all the learning.
          </p>
          {!isAuthenticated && (
            <Link to="/register">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-muted/50 rounded-lg p-8 text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Try Our Demo
            </h3>
            <p className="text-muted-foreground mb-6">
              Experience our platform with demo credentials
            </p>
            <div className="bg-card rounded-lg p-4 inline-block border">
              <p className="text-sm text-muted-foreground mb-2">Demo Login:</p>
              <p className="font-mono text-sm text-foreground">
                Email: admin@tradingapp.com<br />
                Password: password123
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
