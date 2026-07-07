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
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Users,
  Shield,
  Lock,
  LockOpen,
  Search,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  username: string;
  location?: string;
  is_blocked?: boolean;
  role?: string;
  created_at: string;
}

export default function AdminUsers() {
  const { user: currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'blocked'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || currentUser?.role !== 'admin') {
      navigate('/');
      return;
    }

    fetchUsers();
  }, [isAuthenticated, currentUser, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('dharaa_auth_token');

      const response = await fetch(`/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (err: any) {
      // In local-only mode, show empty users list
      setUsers([]);
      setError('Admin panel running in local-only mode (server unavailable). User management features are disabled.');
      toast.error('Server unavailable - running in local-only mode');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId: string, reason?: string) => {
    try {
      setActionLoading(userId);
      const token = localStorage.getItem('dharaa_auth_token');
      const response = await fetch(`/api/admin/users/${userId}/block`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: reason || 'Blocked by admin' }),
      });

      if (!response.ok) {
        throw new Error('Failed to block user');
      }

      toast.success('User blocked successfully');
      fetchUsers();
    } catch (err: any) {
      toast.error('Admin panel in local-only mode - user management unavailable');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnblockUser = async (userId: string) => {
    try {
      setActionLoading(userId);
      const token = localStorage.getItem('dharaa_auth_token');
      const response = await fetch(`/api/admin/users/${userId}/unblock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to unblock user');
      }

      toast.success('User unblocked successfully');
      fetchUsers();
    } catch (err: any) {
      toast.error('Admin panel in local-only mode - user management unavailable');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMakeAdmin = async (userId: string) => {
    try {
      setActionLoading(userId);
      const token = localStorage.getItem('dharaa_auth_token');
      const response = await fetch(`/api/admin/users/${userId}/make-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to promote user');
      }

      toast.success('User promoted to admin');
      fetchUsers();
    } catch (err: any) {
      toast.error('Admin panel in local-only mode - user management unavailable');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveAdmin = async (userId: string) => {
    try {
      setActionLoading(userId);
      const token = localStorage.getItem('dharaa_auth_token');
      const response = await fetch(`/api/admin/users/${userId}/remove-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to demote user');
      }

      toast.success('Admin role removed');
      fetchUsers();
    } catch (err: any) {
      toast.error('Admin panel in local-only mode - user management unavailable');
    } finally {
      setActionLoading(null);
    }
  };

  if (!isAuthenticated || currentUser?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4">
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

  const filteredUsers = users.filter((u) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = u.email.toLowerCase().includes(searchLower) ||
                         u.username.toLowerCase().includes(searchLower);
    const matchesStatus = filterStatus === 'all' ||
                         (filterStatus === 'active' && !u.is_blocked) ||
                         (filterStatus === 'blocked' && u.is_blocked);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">User Management</h1>
              <p className="text-muted-foreground">View, block, and manage user accounts</p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/admin')}
            variant="outline"
            className="mb-4"
          >
            ← Back to Admin Dashboard
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by email or username..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterStatus} onValueChange={(val: any) => setFilterStatus(val)}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="blocked">Blocked Only</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => fetchUsers()} variant="outline">
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
            <CardDescription>All registered users in the system</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground mt-2">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-8 w-8 mx-auto text-muted-foreground opacity-50 mb-2" />
                <p className="text-muted-foreground">No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">User</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Role</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr
                        key={u.id}
                        className="border-b border-border hover:bg-muted/50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <p className="font-semibold text-foreground">{u.username}</p>
                          <p className="text-sm text-muted-foreground">{u.location}</p>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{u.email}</td>
                        <td className="py-3 px-4">
                          {u.role === 'admin' ? (
                            <Badge className="bg-purple-600">Admin</Badge>
                          ) : (
                            <Badge variant="outline">User</Badge>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {u.is_blocked ? (
                            <Badge variant="destructive">Blocked</Badge>
                          ) : (
                            <Badge className="bg-green-600">Active</Badge>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-2">
                            {u.is_blocked ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUnblockUser(u.id)}
                                disabled={actionLoading === u.id}
                                className="text-xs"
                              >
                                {actionLoading === u.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                ) : (
                                  <LockOpen className="h-3 w-3 mr-1" />
                                )}
                                Unblock
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleBlockUser(u.id)}
                                disabled={actionLoading === u.id}
                                className="text-xs"
                              >
                                {actionLoading === u.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                ) : (
                                  <Lock className="h-3 w-3 mr-1" />
                                )}
                                Block
                              </Button>
                            )}

                            {u.role === 'admin' ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRemoveAdmin(u.id)}
                                disabled={actionLoading === u.id}
                                className="text-xs"
                              >
                                {actionLoading === u.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                ) : (
                                  <Trash2 className="h-3 w-3 mr-1" />
                                )}
                                Remove Admin
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMakeAdmin(u.id)}
                                disabled={actionLoading === u.id}
                                className="text-xs"
                              >
                                {actionLoading === u.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                ) : (
                                  <Shield className="h-3 w-3 mr-1" />
                                )}
                                Make Admin
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
