import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface InitFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

export default function InitializeAdmin() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<InitFormData>({
    defaultValues: {
      email: 'admin@example.com',
      password: 'Admin@123456',
    },
  });

  const password = watch('password');

  const onSubmit = async (data: InitFormData) => {
    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Store admin credentials directly in localStorage
      localStorage.setItem('admin_credentials', JSON.stringify({
        email: data.email,
        password: data.password,
      }));

      // Store admin user info for use on login
      const adminUser = {
        id: 'admin-1',
        email: data.email,
        role: 'admin',
        username: 'Administrator'
      };

      localStorage.setItem('dharaa_auth_token', 'admin-token-123');
      localStorage.setItem('dharaa_user', JSON.stringify(adminUser));
      localStorage.setItem('dharaa_user_role', 'admin');
      localStorage.setItem('user_id', 'admin-1');

      setSuccess(true);
      setCredentials({
        email: data.email,
        password: data.password,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-4 pb-6">
          <div className="flex items-center justify-center mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-600 rounded-2xl blur-lg opacity-50" />
              <div className="relative bg-gradient-to-br from-green-600 to-green-700 p-4 rounded-2xl shadow-lg">
                <Shield className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>
          <div className="text-center space-y-2">
            <CardTitle className="text-3xl font-display">
              Initialize Admin Account
            </CardTitle>
            <CardDescription className="text-base">
              Set up the first administrator account for your system
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {success && credentials ? (
            <div className="space-y-4">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Admin account created successfully!
                </AlertDescription>
              </Alert>

              <div className="bg-muted p-4 rounded-lg space-y-3">
                <p className="text-sm font-medium text-foreground">Your credentials:</p>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Email</p>
                    <p className="font-mono text-sm bg-background p-2 rounded border">
                      {credentials.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Password</p>
                    <p className="font-mono text-sm bg-background p-2 rounded border">
                      {credentials.password}
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => navigate('/admin-home')}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                Go to Admin Dashboard
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-medium">
                  Admin Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-destructive text-sm">⚠ {errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter a secure password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                  })}
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-destructive text-sm">⚠ {errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground font-medium">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                  })}
                  disabled={isLoading}
                />
                {errors.confirmPassword && (
                  <p className="text-destructive text-sm">⚠ {errors.confirmPassword.message}</p>
                )}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Admin Account'
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                This account will have full access to the admin panel
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
