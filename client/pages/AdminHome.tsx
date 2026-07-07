import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Leaf,
  Droplets,
  BarChart3,
  Settings,
  LogOut,
  Shield,
  AlertCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
  adminUsers: number;
}

export default function AdminHome() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const redirectedRef = useRef(false);

  useEffect(() => {
    // Redirect non-admins to home (only once)
    if (!isAuthenticated || user?.role !== 'admin') {
      if (!redirectedRef.current) {
        redirectedRef.current = true;
        navigate('/');
      }
      return;
    }

    const fetchAdminStats = async () => {
      try {
        const token = localStorage.getItem('dharaa_auth_token');
        const response = await fetch('/api/admin/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
        } else {
          // Local-only mode
          setStats({
            totalUsers: 0,
            activeUsers: 0,
            blockedUsers: 0,
            adminUsers: 1,
          });
        }
      } catch {
        // Local-only mode
        setStats({
          totalUsers: 0,
          activeUsers: 0,
          blockedUsers: 0,
          adminUsers: 1,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <div className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold text-foreground">DharaaAI Admin</h1>
                <p className="text-xs text-muted-foreground">Administration Panel</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge className="bg-purple-600">{user?.username}</Badge>
              <Button
                onClick={() => {
                  logout();
                  navigate('/login/admin');
                }}
                variant="outline"
                size="sm"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Navigation */}
      <div className="border-b border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1 py-3 overflow-x-auto">
            <Button
              variant="ghost"
              className="rounded-full"
              onClick={() => window.location.href = '/admin-home'}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            <Button
              variant="ghost"
              className="rounded-full"
              onClick={() => navigate('/admin')}
            >
              <Shield className="mr-2 h-4 w-4" />
              Admin Panel
            </Button>
            <Button
              variant="ghost"
              className="rounded-full"
              onClick={() => navigate('/admin/users')}
            >
              <Users className="mr-2 h-4 w-4" />
              Users
            </Button>
            <Button
              variant="ghost"
              className="rounded-full"
              onClick={() => navigate('/admin/crops')}
            >
              <Leaf className="mr-2 h-4 w-4" />
              Crops
            </Button>
            <Button
              variant="ghost"
              className="rounded-full"
              onClick={() => navigate('/admin/fertilizers')}
            >
              <Droplets className="mr-2 h-4 w-4" />
              Fertilizers
            </Button>
            <Button
              variant="ghost"
              className="rounded-full"
              onClick={() => navigate('/admin')}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-display font-bold text-foreground">
                Welcome, {user?.username}
              </h2>
              <p className="text-lg text-muted-foreground mt-1">
                Manage DharaaAI system, data, and users
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Users</p>
                  <p className="text-4xl font-bold text-foreground">
                    {loading ? '-' : stats?.totalUsers || 0}
                  </p>
                </div>
                <Users className="h-10 w-10 text-purple-600 opacity-30" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Active Users</p>
                  <p className="text-4xl font-bold text-foreground">
                    {loading ? '-' : stats?.activeUsers || 0}
                  </p>
                </div>
                <CheckCircle2 className="h-10 w-10 text-green-600 opacity-30" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Blocked Users</p>
                  <p className="text-4xl font-bold text-foreground">
                    {loading ? '-' : stats?.blockedUsers || 0}
                  </p>
                </div>
                <Lock className="h-10 w-10 text-red-600 opacity-30" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Admin Users</p>
                  <p className="text-4xl font-bold text-foreground">
                    {loading ? '-' : stats?.adminUsers || 1}
                  </p>
                </div>
                <Shield className="h-10 w-10 text-purple-600 opacity-30" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* User Management Section */}
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-background hover:shadow-lg transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6 text-purple-600" />
                User Management
              </CardTitle>
              <CardDescription>Manage user accounts and access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground mb-4">
                View all registered farmers, block/unblock accounts, and manage admin roles.
              </p>
              <div className="space-y-2">
                <Button
                  onClick={() => navigate('/admin/users')}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Data Management Section */}
          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-background hover:shadow-lg transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-6 w-6 text-green-600" />
                Agricultural Data
              </CardTitle>
              <CardDescription>Manage crops and fertilizer database</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground mb-4">
                Add, update, and manage crop varieties and fertilizer recommendations used by farmers.
              </p>
              <div className="space-y-2">
                <Button
                  onClick={() => navigate('/admin/crops')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Leaf className="mr-2 h-4 w-4 text-green-600" />
                  Manage Crops
                </Button>
                <Button
                  onClick={() => navigate('/admin/fertilizers')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Droplets className="mr-2 h-4 w-4 text-blue-600" />
                  Manage Fertilizers
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Features */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* System Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                System Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Admin Features:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ View system statistics</li>
                  <li>✓ Manage user accounts</li>
                  <li>✓ Control data access</li>
                  <li>✓ System monitoring</li>
                </ul>
              </div>
              <Button
                onClick={() => navigate('/admin')}
                variant="outline"
                className="w-full"
              >
                View Details
              </Button>
            </CardContent>
          </Card>

          {/* Crop Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-green-600" />
                Crop Database
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Operations:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ Add new crop varieties</li>
                  <li>✓ Update crop data</li>
                  <li>✓ Manage seasons</li>
                  <li>✓ Set requirements</li>
                </ul>
              </div>
              <Button
                onClick={() => navigate('/admin/crops')}
                variant="outline"
                className="w-full"
              >
                Manage Crops
              </Button>
            </CardContent>
          </Card>

          {/* Fertilizer Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplets className="h-5 w-5 text-blue-600" />
                Fertilizer Database
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Operations:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ Add fertilizers</li>
                  <li>✓ Update recommendations</li>
                  <li>✓ Manage NPK ratios</li>
                  <li>✓ Set pricing</li>
                </ul>
              </div>
              <Button
                onClick={() => navigate('/admin/fertilizers')}
                variant="outline"
                className="w-full"
              >
                Manage Fertilizers
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info Alert */}
        <Alert className="mt-8 border-purple-200 bg-purple-50">
          <AlertCircle className="h-4 w-4 text-purple-600" />
          <AlertDescription className="text-purple-900">
            <strong>Admin Dashboard:</strong> This is the exclusive admin interface. Only administrators have access to these features. Farmer users see a different interface with features like crop advisory, fertilizer recommendations, and community forums.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
