import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Sprout, Loader2, LogOut, User as UserIcon, MapPin, Phone, Mail, Home, Edit2, Save, X, CheckCircle2, Sparkles } from 'lucide-react';

type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  farmName?: string;
  location: string;
  createdAt: string;
};

type RegisterFormData = {
  name: string;
  email: string;
  phone: string;
  location: string;
  farmName?: string;
};

// Simple mock auth service
const authService = {
  getCurrentUser: (): User | null => {
    try {
      const raw = localStorage.getItem('dharaa_user');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return {
        id: parsed.id || '1',
        name: parsed.name || parsed.phone || 'Farmer',
        email: parsed.email || 'farmer@example.com',
        phone: parsed.phone || '+91 9876543210',
        farmName: parsed.farmName || 'My Farm',
        location: parsed.location || 'Unknown',
        createdAt: parsed.createdAt || new Date().toISOString(),
      };
    } catch (e) {
      return null;
    }
  },
  logout: () => {
    try { localStorage.removeItem('dharaa_user'); } catch (e) {}
    try { window.dispatchEvent(new Event('dharaa_user_changed')); } catch (e) {}
    return true;
  },
  updateProfile: async (id: string, data: RegisterFormData) => {
    return new Promise<{ success: boolean; message: string; user?: User }>((resolve) => {
      setTimeout(() => {
        const updated: User = {
          id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          farmName: data.farmName,
          location: data.location,
          createdAt: new Date().toISOString(),
        };
        try { localStorage.setItem('dharaa_user', JSON.stringify(updated)); } catch (e) {}
        try { window.dispatchEvent(new Event('dharaa_user_changed')); } catch (e) {}
        resolve({ success: true, message: 'Profile updated successfully', user: updated });
      }, 800);
    });
  },
};

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<RegisterFormData>();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) { navigate('/login'); return; }
    setUser(currentUser);
    reset({ name: currentUser.name, email: currentUser.email, phone: currentUser.phone, farmName: currentUser.farmName, location: currentUser.location });
  }, [navigate, reset]);

  const handleLogout = () => { authService.logout(); navigate('/login'); };

  const onSubmit = async (data: RegisterFormData) => {
    if (!user) return;
    setIsLoading(true); setError(''); setSuccess('');
    try {
      const res = await authService.updateProfile(user.id, data);
      if (res.success && res.user) { setUser(res.user); setSuccess(res.message); setIsEditing(false); }
      else setError(res.message || 'Update failed');
    } catch (e) { setError('An error occurred while updating profile'); }
    finally { setIsLoading(false); }
  };

  const handleCancelEdit = () => {
    if (user) reset({ name: user.name, email: user.email, phone: user.phone, farmName: user.farmName, location: user.location });
    setIsEditing(false); setError('');
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto" />
        <p className="mt-4 text-gray-600">Loading your profile...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6">
          <Card className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white border-0 shadow-xl overflow-hidden relative animate-fadeIn">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
            <CardHeader className="relative">
              <CardTitle className="text-white text-2xl flex items-center gap-2">Welcome back, {user.name}! <span className="animate-pulse-soft">👋</span></CardTitle>
              <CardDescription className="text-green-50">Manage your profile and stay connected with DharaaAI</CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-gray-800"><UserIcon className="h-5 w-5 text-green-600" /> Profile Information</CardTitle>
                  <CardDescription className="mt-1">{isEditing ? 'Update your profile details' : 'View your account details'}</CardDescription>
                </div>
                {!isEditing && (<Button onClick={() => setIsEditing(true)} variant="outline" className="border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 transition-all duration-200"><Edit2 className="mr-2 h-4 w-4" /> Edit Profile</Button>)}
              </div>
            </CardHeader>

            <CardContent>
              {!isEditing ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-3 group">
                      <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-3 rounded-xl group-hover:scale-110 transition-transform duration-200"><UserIcon className="h-5 w-5 text-green-600" /></div>
                      <div>
                        <p className="text-sm text-muted-foreground">Full Name</p>
                        <p className="mt-1 text-gray-800">{user.name}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 group">
                      <div className="bg-gradient-to-br from-blue-100 to-cyan-100 p-3 rounded-xl group-hover:scale-110 transition-transform duration-200"><Mail className="h-5 w-5 text-blue-600" /></div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="mt-1 text-gray-800">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 group">
                      <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-3 rounded-xl group-hover:scale-110 transition-transform duration-200"><Phone className="h-5 w-5 text-purple-600" /></div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone Number</p>
                        <p className="mt-1 text-gray-800">{user.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 group">
                      <div className="bg-gradient-to-br from-orange-100 to-amber-100 p-3 rounded-xl group-hover:scale-110 transition-transform duration-200"><MapPin className="h-5 w-5 text-orange-600" /></div>
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="mt-1 text-gray-800">{user.location}</p>
                      </div>
                    </div>

                    {user.farmName && (
                      <div className="flex items-start gap-3 md:col-span-2 group">
                        <div className="bg-gradient-to-br from-green-100 to-teal-100 p-3 rounded-xl group-hover:scale-110 transition-transform duration-200"><Home className="h-5 w-5 text-green-600" /></div>
                        <div>
                          <p className="text-sm text-muted-foreground">Farm Name</p>
                          <p className="mt-1 text-gray-800">{user.farmName}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator className="bg-gray-200" />

                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-gray-50 p-4 rounded-lg">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <p>Member since: {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name" className="text-gray-700">Full Name *</Label>
                      <Input id="edit-name" className="border-gray-200 focus:border-green-500 focus:ring-green-500 transition-all duration-200" {...register('name', { required: 'Name is required' })} disabled={isLoading} />
                      {errors.name && (<p className="text-red-500 text-sm flex items-center gap-1"><span className="text-xs">⚠</span> {errors.name.message}</p>)}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-email" className="text-gray-700">Email *</Label>
                      <Input id="edit-email" type="email" className="border-gray-200 focus:border-green-500 focus:ring-green-500 transition-all duration-200" {...register('email', { required: 'Email is required', pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email address' } })} disabled={isLoading} />
                      {errors.email && (<p className="text-red-500 text-sm flex items-center gap-1"><span className="text-xs">⚠</span> {errors.email.message}</p>)}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-phone" className="text-gray-700">Phone Number *</Label>
                      <Input id="edit-phone" type="tel" className="border-gray-200 focus:border-green-500 focus:ring-green-500 transition-all duration-200" {...register('phone', { required: 'Phone number is required', pattern: { value: /^[+]?[(]?[0-9]{1,4}[)]?[-\\s.]?[(]?[0-9]{1,4}[)]?[-\\s.]?[0-9]{1,9}$/, message: 'Invalid phone number' } })} disabled={isLoading} />
                      {errors.phone && (<p className="text-red-500 text-sm flex items-center gap-1"><span className="text-xs">⚠</span> {errors.phone.message}</p>)}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-location" className="text-gray-700">Location *</Label>
                      <Input id="edit-location" className="border-gray-200 focus:border-green-500 focus:ring-green-500 transition-all duration-200" {...register('location', { required: 'Location is required' })} disabled={isLoading} />
                      {errors.location && (<p className="text-red-500 text-sm flex items-center gap-1"><span className="text-xs">⚠</span> {errors.location.message}</p>)}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="edit-farmName" className="text-gray-700">Farm Name (Optional)</Label>
                      <Input id="edit-farmName" className="border-gray-200 focus:border-green-500 focus:ring-green-500 transition-all duration-200" {...register('farmName')} disabled={isLoading} />
                    </div>
                  </div>

                  {error && (<Alert variant="destructive" className="border-red-200 bg-red-50 animate-fadeIn"><AlertDescription className="text-red-800">{error}</AlertDescription></Alert>)}

                  {success && (<Alert className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 animate-fadeIn"><CheckCircle2 className="h-4 w-4 text-green-600" /><AlertDescription className="text-green-800 ml-2">{success}</AlertDescription></Alert>)}

                  <div className="flex gap-2 pt-2">
                    <Button type="submit" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300" disabled={isLoading}>
                      {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>) : (<><Save className="mr-2 h-4 w-4" /> Save Changes</>)}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleCancelEdit} disabled={isLoading} className="border-gray-200 hover:bg-gray-50 transition-all duration-200"><X className="mr-2 h-4 w-4" /> Cancel</Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
