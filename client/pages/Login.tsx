import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { LoginFormData } from '@/types/auth';
import { authService } from '@/services/authService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sprout, Loader2, Eye, EyeOff, LogIn, Sparkles } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await authService.login(data);
      if (response.success) {
        navigate('/dashboard');
      } else {
        setError(response.message);
      }
    } catch (e) {
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" />
        <div
          className="absolute top-40 right-10 w-72 h-72 bg-primary/25 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float"
          style={{ animationDelay: '2s' }}
        />
        <div
          className="absolute -bottom-8 left-1/2 w-72 h-72 bg-primary/15 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float"
          style={{ animationDelay: '4s' }}
        />
      </div>

      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-10 right-1/4 w-2 h-2 bg-primary rounded-full opacity-60" />
        <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-primary rounded-full opacity-40" />
        <div className="absolute bottom-1/4 right-1/3 w-2 h-2 bg-primary rounded-full opacity-50" />
      </div>

      <div className="relative flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md shadow-2xl border border-border bg-card backdrop-blur-sm animate-fadeIn">
          <CardHeader className="space-y-3 pb-6">
            <div className="flex items-center justify-center mb-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-primary rounded-2xl blur-lg opacity-50" />
                <div className="relative bg-gradient-to-br from-primary to-primary/80 p-4 rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-300">
                  <Sprout className="h-10 w-10 text-primary-foreground" />
                </div>
              </div>
            </div>
            <div className="text-center space-y-2">
              <CardTitle className="text-3xl font-display text-foreground">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-base flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Login to your DharaaAI account
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-medium">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="farmer@example.com"
                  className="border-input focus:border-ring focus:ring-ring transition-all duration-200"
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
                  <p className="text-destructive text-sm flex items-center gap-1">
                    <span className="text-xs">⚠</span> {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-medium">
                  Password *
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="border-input focus:border-ring focus:ring-ring transition-all duration-200 pr-10"
                    {...register('password', { required: 'Password is required' })}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-destructive text-sm flex items-center gap-1">
                    <span className="text-xs">⚠</span> {errors.password.message}
                  </p>
                )}
              </div>

              {error && (
                <Alert variant="destructive" className="animate-fadeIn">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center pb-6">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-primary hover:text-primary/80 font-medium hover:underline transition-all duration-200"
                disabled={isLoading}
              >
                Register here
              </button>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
