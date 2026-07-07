import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Users, Sprout, Sparkles, ArrowRight } from 'lucide-react';

export default function LoginSelect() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Decorative background elements */}
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

      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-primary rounded-2xl blur-lg opacity-50" />
                <div className="relative bg-gradient-to-br from-primary to-primary/80 p-4 rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-300">
                  <Sprout className="h-10 w-10 text-primary-foreground" />
                </div>
              </div>
            </div>
            <h1 className="text-4xl font-display font-bold text-foreground mb-2">
              Welcome to DharaaAI
            </h1>
            <p className="text-lg text-muted-foreground flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Choose your login type to continue
            </p>
          </div>

          {/* Login options */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* User Login */}
            <Card className="shadow-2xl border border-border bg-card backdrop-blur-sm hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 transform"
              onClick={() => navigate('/login/user')}>
              <CardHeader className="text-center space-y-3">
                <div className="flex items-center justify-center">
                  <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/10 p-4 rounded-2xl">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <CardTitle className="text-2xl">Farmer Login</CardTitle>
                <CardDescription>Access your farming dashboard and tools</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    Get crop recommendations
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    Check fertilizer suggestions
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    Join farming communities
                  </li>
                </ul>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={(e) => {
                  e.stopPropagation();
                  navigate('/login/user');
                }}>
                  Login as Farmer
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Admin Login */}
            <Card className="shadow-2xl border border-border bg-card backdrop-blur-sm hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 transform"
              onClick={() => navigate('/login/admin')}>
              <CardHeader className="text-center space-y-3">
                <div className="flex items-center justify-center">
                  <div className="bg-gradient-to-br from-purple-500/20 to-purple-500/10 p-4 rounded-2xl">
                    <Shield className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
                <CardTitle className="text-2xl">Admin Login</CardTitle>
                <CardDescription>Access system administration panel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    Manage crop database
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    Update recommendations
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    Manage user accounts
                  </li>
                </ul>
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white" onClick={(e) => {
                  e.stopPropagation();
                  navigate('/login/admin');
                }}>
                  Login as Admin
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="text-center mt-12 text-sm text-muted-foreground">
            <p>Don't have an account? <button onClick={() => navigate('/register')} className="text-primary hover:text-primary/80 font-medium hover:underline">Register here</button></p>
          </div>
        </div>
      </div>
    </div>
  );
}
