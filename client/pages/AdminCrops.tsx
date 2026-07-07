import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Crop } from '@shared/api';
import {
  Leaf,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';

interface CropFormData extends Crop {}

export default function AdminCrops() {
  const { user: currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<CropFormData>();

  useEffect(() => {
    fetchCrops();
  }, []);

  // Check authorization
  if (!isAuthenticated || currentUser?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-6xl mx-auto px-4">
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

  const onSubmit = async (data: CropFormData) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('dharaa_auth_token');
      
      if (editingCrop) {
        // Update existing crop
        const response = await fetch(`/api/admin/crops/${editingCrop.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) throw new Error('Failed to update crop');
        toast.success('Crop updated successfully');
      } else {
        // Create new crop
        const response = await fetch('/api/admin/crops', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) throw new Error('Failed to add crop');
        toast.success('Crop added successfully');
      }

      setIsFormOpen(false);
      setEditingCrop(null);
      reset();
      fetchCrops();
    } catch (err: any) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchCrops = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('dharaa_auth_token');
      const response = await fetch('/api/admin/crops', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch crops');
      const data = await response.json();
      setCrops(data.crops || []);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load crops');
      toast.error('Failed to load crops');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (crop: Crop) => {
    setEditingCrop(crop);
    Object.keys(crop).forEach((key) => {
      setValue(key as keyof CropFormData, crop[key as keyof Crop]);
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (cropId: string) => {
    if (!confirm('Are you sure you want to delete this crop?')) return;

    try {
      const token = localStorage.getItem('dharaa_auth_token');
      const response = await fetch(`/api/admin/crops/${cropId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete crop');
      toast.success('Crop deleted successfully');
      fetchCrops();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete crop');
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingCrop(null);
    reset();
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => navigate('/admin')}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin Dashboard
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">Crop Management</h1>
              <p className="text-muted-foreground">Add, update, and manage crop data</p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Add New Crop Button */}
        <div className="mb-6">
          <Button
            onClick={() => {
              setEditingCrop(null);
              reset();
              setIsFormOpen(true);
            }}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Crop
          </Button>
        </div>

        {/* Form */}
        {isFormOpen && (
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle>{editingCrop ? 'Edit Crop' : 'Add New Crop'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Row 1: Name and Season */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Crop Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Wheat, Rice, Corn"
                      {...register('name', { required: 'Crop name is required' })}
                    />
                    {errors.name && <p className="text-destructive text-sm">⚠ {errors.name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="season">Season *</Label>
                    <Select defaultValue={editingCrop?.season || ''} onValueChange={(value) => setValue('season', value as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select season" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Kharif">Kharif (Monsoon)</SelectItem>
                        <SelectItem value="Rabi">Rabi (Winter)</SelectItem>
                        <SelectItem value="Summer">Summer</SelectItem>
                        <SelectItem value="Year-round">Year-round</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Row 2: NPK Requirements */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nRequirement">Nitrogen (kg/ha) *</Label>
                    <Input
                      id="nRequirement"
                      type="number"
                      placeholder="e.g., 80"
                      {...register('nRequirement', { required: 'Required', valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pRequirement">Phosphorus (kg/ha) *</Label>
                    <Input
                      id="pRequirement"
                      type="number"
                      placeholder="e.g., 40"
                      {...register('pRequirement', { required: 'Required', valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kRequirement">Potassium (kg/ha) *</Label>
                    <Input
                      id="kRequirement"
                      type="number"
                      placeholder="e.g., 40"
                      {...register('kRequirement', { required: 'Required', valueAsNumber: true })}
                    />
                  </div>
                </div>

                {/* Row 3: Soil & Temperature */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="soilType">Soil Type *</Label>
                    <Select defaultValue={editingCrop?.soilType || ''} onValueChange={(value) => setValue('soilType', value as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select soil type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sandy">Sandy</SelectItem>
                        <SelectItem value="Loamy">Loamy</SelectItem>
                        <SelectItem value="Clayey">Clayey</SelectItem>
                        <SelectItem value="Silt">Silt</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="waterRequired">Water Required (mm) *</Label>
                    <Input
                      id="waterRequired"
                      type="number"
                      placeholder="e.g., 600"
                      {...register('waterRequired', { required: 'Required', valueAsNumber: true })}
                    />
                  </div>
                </div>

                {/* Row 4: Temperature Range */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minTemp">Minimum Temperature (°C) *</Label>
                    <Input
                      id="minTemp"
                      type="number"
                      placeholder="e.g., 15"
                      {...register('minTemp', { required: 'Required', valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxTemp">Maximum Temperature (°C) *</Label>
                    <Input
                      id="maxTemp"
                      type="number"
                      placeholder="e.g., 35"
                      {...register('maxTemp', { required: 'Required', valueAsNumber: true })}
                    />
                  </div>
                </div>

                {/* Row 5: Growth & Yield */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="growthPeriod">Growth Period (days) *</Label>
                    <Input
                      id="growthPeriod"
                      type="number"
                      placeholder="e.g., 120"
                      {...register('growthPeriod', { required: 'Required', valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="yieldPotential">Yield Potential (tons/hectare) *</Label>
                    <Input
                      id="yieldPotential"
                      type="number"
                      step="0.1"
                      placeholder="e.g., 5.5"
                      {...register('yieldPotential', { required: 'Required', valueAsNumber: true })}
                    />
                  </div>
                </div>

                {/* Row 6: Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <textarea
                    id="description"
                    placeholder="Add any additional notes about this crop"
                    className="w-full min-h-24 px-3 py-2 border border-input rounded-md bg-background text-foreground"
                    {...register('description')}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end">
                  <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : editingCrop ? 'Update Crop' : 'Add Crop'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Crops List */}
        {loading ? (
          <Card>
            <CardContent className="pt-8">
              <p className="text-center text-muted-foreground">Loading crops...</p>
            </CardContent>
          </Card>
        ) : crops.length === 0 ? (
          <Card>
            <CardContent className="pt-8">
              <p className="text-center text-muted-foreground">No crops found. Add your first crop to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {crops.map((crop) => (
              <Card key={crop.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <h3 className="text-lg font-semibold text-foreground">{crop.name}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Season</p>
                          <p className="font-medium">{crop.season}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Growth Period</p>
                          <p className="font-medium">{crop.growthPeriod} days</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Water Required</p>
                          <p className="font-medium">{crop.waterRequired} mm</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Yield Potential</p>
                          <p className="font-medium">{crop.yieldPotential} t/ha</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mt-2 pt-2 border-t">
                        <div>
                          <p className="text-muted-foreground">N Requirement</p>
                          <p className="font-medium">{crop.nRequirement} kg/ha</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">P Requirement</p>
                          <p className="font-medium">{crop.pRequirement} kg/ha</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">K Requirement</p>
                          <p className="font-medium">{crop.kRequirement} kg/ha</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Temp Range</p>
                          <p className="font-medium">{crop.minTemp}°C - {crop.maxTemp}°C</p>
                        </div>
                      </div>
                      {crop.description && (
                        <p className="text-sm text-muted-foreground mt-2">{crop.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2 md:flex-col">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(crop)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(crop.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
