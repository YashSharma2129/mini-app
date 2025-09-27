import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';

const loginSchema = z.object({
  email: z.string().email('Invalid email format').min(1, 'Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@tradingapp.com',
      password: 'password123',
      rememberMe: false,
    },
  });

  const onSubmit = async (data) => {
    if (isLoading) return; // Prevent multiple submissions
    
    setIsLoading(true);
    try {
      const result = await login(data);
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Sign in to your account
          </h2>
          <p className="text-sm text-gray-600">
            Or{' '}
            <Link
              to="/register"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              create a new account
            </Link>
          </p>
        </div>

        {/* Login Form Card */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email"
                    className="pl-10 bg-blue-50/50 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                    {...form.register('email')}
                  />
                </div>
                {form.formState.errors.email && (
                  <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="pl-10 pr-10 bg-blue-50/50 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                    {...form.register('password')}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    checked={form.watch('rememberMe')}
                    onCheckedChange={(checked) => form.setValue('rememberMe', checked)}
                  />
                  <Label htmlFor="rememberMe" className="text-sm text-gray-700 cursor-pointer">
                    Remember me
                  </Label>
                </div>

                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>

              {/* Sign In Button */}
              <Button
                type="submit"
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 rounded-lg transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">Demo credentials:</p>
          <div className="bg-gray-100 rounded-lg px-4 py-3 font-mono text-sm">
            admin@tradingapp.com / password123
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
