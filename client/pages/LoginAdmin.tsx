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
import { Shield, Loader2, Eye, EyeOff, LogIn, Lock, ArrowLeft } from 'lucide-react';

export default function LoginAdmin() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [credentialsNotInitialized, setCredentialsNotInitialized] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();

  React.useEffect(() => {
    // Check if admin credentials are initialized on mount
    const storedCredentials = localStorage.getItem('admin_credentials');
    if (!storedCredentials) {
      setCredentialsNotInitialized(true);
    }
  }, []);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError('');
    setCredentialsNotInitialized(false);
    try {
      // Read admin credentials from localStorage
      const storedCredentials = localStorage.getItem('admin_credentials');

      if (!storedCredentials) {
        setCredentialsNotInitialized(true);
        setIsLoading(false);
        return;
      }

      const { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } = JSON.parse(storedCredentials);

      if (data.email === ADMIN_EMAIL && data.password === ADMIN_PASSWORD) {
        // Successful login - set localStorage for admin session
        const adminUser = {
          id: 'admin-1',
          email: ADMIN_EMAIL,
          role: 'admin',
          username: 'Administrator'
        };

        localStorage.setItem('dharaa_auth_token', 'admin-token-123');
        localStorage.setItem('dharaa_user', JSON.stringify(adminUser));
        localStorage.setItem('dharaa_user_role', 'admin');
        localStorage.setItem('user_id', 'admin-1');

        navigate('/admin-home');
      } else {
        setError('Invalid credentials. Check that they match exactly what you set during initialization.');
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
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" />
        <div
          className="absolute top-40 right-10 w-72 h-72 bg-purple-500/25 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float"
          style={{ animationDelay: '2s' }}
        />
        <div
          className="absolute -bottom-8 left-1/2 w-72 h-72 bg-purple-500/15 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float"
          style={{ animationDelay: '4s' }}
        />
      </div>

      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-10 right-1/4 w-2 h-2 bg-purple-600 rounded-full opacity-60" />
        <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-purple-600 rounded-full opacity-40" />
        <div className="absolute bottom-1/4 right-1/3 w-2 h-2 bg-purple-600 rounded-full opacity-50" />
      </div>

      <div className="relative flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md shadow-2xl border border-border bg-card backdrop-blur-sm animate-fadeIn">
          <CardHeader className="space-y-3 pb-6">
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 text-primary hover:text-primary/80 text-sm mb-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <div className="flex items-center justify-center mb-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-purple-600 to-purple-600 rounded-2xl blur-lg opacity-50" />
                <div className="relative bg-gradient-to-br from-purple-600 to-purple-700 p-4 rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-300">
                  <Shield className="h-10 w-10 text-white" />
                </div>
              </div>
            </div>
            <div className="text-center space-y-2">
              <CardTitle className="text-3xl font-display text-foreground">
                Admin Login
              </CardTitle>
              <CardDescription className="text-base flex items-center justify-center gap-2">
                <Lock className="h-4 w-4 text-purple-600" />
                Administration panel access
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            {credentialsNotInitialized ? (
              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertDescription className="flex flex-col gap-2">
                    <p className="font-semibold">Admin account not initialized</p>
                    <p className="text-sm">You need to set up your admin credentials before logging in.</p>
                  </AlertDescription>
                </Alert>
                <Button
                  onClick={() => navigate('/initialize-admin')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Set Up Admin Account
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground font-medium">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
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
                      placeholder="Enter admin password"
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
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
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
                      Admin Login
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>

          <CardFooter className="flex justify-center pb-6 flex-col gap-3">
            <p className="text-xs text-muted-foreground text-center">
              Enter the admin credentials you set up during initialization
            </p>
            <button
              onClick={() => navigate('/initialize-admin')}
              className="text-xs text-primary hover:text-primary/80 underline transition-colors"
            >
              Setting up the first admin account?
            </button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
