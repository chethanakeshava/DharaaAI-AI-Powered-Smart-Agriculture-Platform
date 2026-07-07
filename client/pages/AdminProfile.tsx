import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  BarChart3,
  Users,
  Shield,
  Lock,
  AlertTriangle,
  CheckCircle2,
  Leaf,
  Droplets,
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
  adminUsers: number;
}

export default function AdminProfile() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/');
      return;
    }

    fetchAdminStats();
  }, [isAuthenticated, user, navigate]);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('dharaa_auth_token');
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch admin stats');
      }

      const data = await response.json();
      setStats(data.stats);
    } catch (err: any) {
      // In local-only mode, show default stats
      setStats({
        totalUsers: 0,
        activeUsers: 0,
        blockedUsers: 0,
        adminUsers: 1,
      });
      // Only show error if it's a real network issue, not just a missing endpoint
      if (err.message.includes('fetch')) {
        setError('Admin panel running in local-only mode (server stats unavailable)');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Access denied. Admin privileges required.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-display font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-muted-foreground">Manage users and system settings</p>
              </div>
            </div>
            <Badge className="bg-primary">{user?.username}</Badge>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Admin Info Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Admin Profile
            </CardTitle>
            <CardDescription>Your administrative account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Username</p>
                <p className="text-lg font-semibold text-foreground">{user?.username}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Email</p>
                <p className="text-lg font-semibold text-foreground">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Role</p>
                <Badge className="bg-primary">Administrator</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <Badge className="bg-green-600">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Users</p>
                  <p className="text-3xl font-bold text-foreground">
                    {loading ? '-' : stats?.totalUsers}
                  </p>
                </div>
                <Users className="h-8 w-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Active Users</p>
                  <p className="text-3xl font-bold text-foreground">
                    {loading ? '-' : stats?.activeUsers}
                  </p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Blocked Users</p>
                  <p className="text-3xl font-bold text-foreground">
                    {loading ? '-' : stats?.blockedUsers}
                  </p>
                </div>
                <Lock className="h-8 w-8 text-destructive opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Admin Users</p>
                  <p className="text-3xl font-bold text-foreground">
                    {loading ? '-' : stats?.adminUsers}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* User Management Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>Manage user accounts and roles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => navigate('/admin/users')}
                className="w-full justify-start"
                variant="outline"
              >
                <Users className="mr-2 h-4 w-4" />
                View & Manage Users
              </Button>
              <p className="text-xs text-muted-foreground">
                View registered users, block/unblock accounts, and manage admin roles.
              </p>
            </CardContent>
          </Card>

          {/* Data Management Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-green-600" />
                Data Management
              </CardTitle>
              <CardDescription>Manage crops and fertilizers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 space-x-3">
              <Button
                onClick={() => navigate('/admin/crops')}
                className="w-full justify-start"
                variant="outline"
              >
                <Leaf className="mr-2 h-4 w-4 text-green-600" />
                Manage Crops
              </Button>
              <Button
                onClick={() => navigate('/admin/fertilizers')}
                className="w-full justify-start"
                variant="outline"
              >
                <Droplets className="mr-2 h-4 w-4 text-blue-600" />
                Manage Fertilizers
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Refresh Stats Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Statistics
            </CardTitle>
            <CardDescription>Refresh dashboard data</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => fetchAdminStats()}
              className="w-full justify-start"
              variant="outline"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Refresh Statistics
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
