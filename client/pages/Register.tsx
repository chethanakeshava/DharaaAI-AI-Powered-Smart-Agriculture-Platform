import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { RegisterFormData } from '@/types/auth';
import { authService } from '@/services/authService';
import { LocationPicker } from '@/components/common/LocationPicker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sprout, Loader2, Eye, EyeOff, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [location, setLocation] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<RegisterFormData>();

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    if (!location) {
      setError('Please select a location using the map picker');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authService.register({
        ...data,
        location,
      });

      if (response.success) {
        setSuccess(response.message);
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Animated background elements */}
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

      {/* Decorative circles */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-10 right-1/4 w-2 h-2 bg-primary rounded-full opacity-60" />
        <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-primary rounded-full opacity-40" />
        <div className="absolute bottom-1/4 right-1/3 w-2 h-2 bg-primary rounded-full opacity-50" />
      </div>

      <div className="relative flex items-center justify-center min-h-screen p-4 py-12">
        <Card className="w-full max-w-2xl shadow-2xl border border-border bg-card backdrop-blur-sm animate-fadeIn">
          <CardHeader className="space-y-3 pb-6">
            <div className="flex items-center justify-center mb-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-primary rounded-2xl blur-lg opacity-50" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <CardTitle className="text-3xl font-display text-foreground">
                Join DhaaraAI
              </CardTitle>
              <CardDescription className="text-base flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Create your farmer account to get started
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-foreground font-medium">
                    Full Name *
                  </Label>
                  <Input
                    id="username"
                    placeholder="Enter your full name"
                    className="border-input focus:border-ring focus:ring-ring transition-all duration-200"
                    {...register('username', { required: 'Name is required' })}
                    disabled={isLoading}
                  />
                  {errors.username && (
                    <p className="text-destructive text-sm flex items-center gap-1">
                      <span className="text-xs">⚠</span> {errors.username.message}
                    </p>
                  )}
                </div>

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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground font-medium">
                    Password *
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password"
                      className="border-input focus:border-ring focus:ring-ring transition-all duration-200 pr-10"
                      {...register('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters',
                        },
                      })}
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

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-foreground font-medium">
                    Confirm Password *
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      className="border-input focus:border-ring focus:ring-ring transition-all duration-200 pr-10"
                      {...register('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: (value) => value === password || 'Passwords do not match',
                      })}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-destructive text-sm flex items-center gap-1">
                      <span className="text-xs">⚠</span> {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="farmName" className="text-foreground font-medium">
                    Farm Name (Optional)
                  </Label>
                  <Input
                    id="farmName"
                    placeholder="Enter your farm name"
                    className="border-input focus:border-ring focus:ring-ring transition-all duration-200"
                    {...register('farmName')}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <LocationPicker
                    value={location}
                    onChange={setLocation}
                    placeholder="Search or select location on map"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="animate-fadeIn">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="animate-fadeIn border border-border">
                  <CheckCircle2 className="h-4 w-4 text-foreground" />
                  <AlertDescription className="text-foreground ml-2">{success}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" /> Create Account
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center pb-6">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-primary hover:text-primary/80 font-medium hover:underline transition-all duration-200"
                disabled={isLoading}
              >
                Login here
              </button>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
