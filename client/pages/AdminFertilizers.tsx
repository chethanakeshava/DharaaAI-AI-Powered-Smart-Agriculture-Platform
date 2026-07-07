import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Fertilizer } from '@shared/api';
import {
  Droplets,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';

interface FertilizerFormData extends Fertilizer {}

export default function AdminFertilizers() {
  const { user: currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [fertilizers, setFertilizers] = useState<Fertilizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFert, setEditingFert] = useState<Fertilizer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors }, setValue, control } = useForm<FertilizerFormData>();

  useEffect(() => {
    fetchFertilizers();
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

  const onSubmit = async (data: FertilizerFormData) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('dharaa_auth_token');

      if (editingFert) {
        // Update existing fertilizer
        const response = await fetch(`/api/admin/fertilizers/${editingFert.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) throw new Error('Failed to update fertilizer');
        toast.success('Fertilizer updated successfully');
      } else {
        // Create new fertilizer
        const response = await fetch('/api/admin/fertilizers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) throw new Error('Failed to add fertilizer');
        toast.success('Fertilizer added successfully');
      }

      setIsFormOpen(false);
      setEditingFert(null);
      reset();
      fetchFertilizers();
    } catch (err: any) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchFertilizers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('dharaa_auth_token');
      const response = await fetch('/api/admin/fertilizers', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch fertilizers');
      const data = await response.json();
      setFertilizers(data.fertilizers || []);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load fertilizers');
      toast.error('Failed to load fertilizers');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (fert: Fertilizer) => {
    setEditingFert(fert);
    Object.keys(fert).forEach((key) => {
      setValue(key as keyof FertilizerFormData, fert[key as keyof Fertilizer]);
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (fertId: string) => {
    if (!confirm('Are you sure you want to delete this fertilizer?')) return;

    try {
      const token = localStorage.getItem('dharaa_auth_token');
      const response = await fetch(`/api/admin/fertilizers/${fertId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete fertilizer');
      toast.success('Fertilizer deleted successfully');
      fetchFertilizers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete fertilizer');
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingFert(null);
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
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
              <Droplets className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">Fertilizer Management</h1>
              <p className="text-muted-foreground">Add, update, and manage fertilizer recommendations</p>
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

        {/* Add New Fertilizer Button */}
        <div className="mb-6">
          <Button
            onClick={() => {
              setEditingFert(null);
              reset();
              setIsFormOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Fertilizer
          </Button>
        </div>

        {/* Form */}
        {isFormOpen && (
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle>{editingFert ? 'Edit Fertilizer' : 'Add New Fertilizer'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Row 1: Name and Soil pH */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Fertilizer Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Urea, DAP, NPK"
                      {...register('name', { required: 'Fertilizer name is required' })}
                    />
                    {errors.name && <p className="text-destructive text-sm">⚠ {errors.name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="soilPH">Suitable Soil pH *</Label>
                    <Input
                      id="soilPH"
                      placeholder="e.g., Neutral, Acidic, Alkaline"
                      {...register('soilPH', { required: 'Soil pH is required' })}
                    />
                    {errors.soilPH && <p className="text-destructive text-sm">⚠ {errors.soilPH.message}</p>}
                  </div>
                </div>

                {/* Row 2: Recommended Use */}
                <div className="space-y-2">
                  <Label htmlFor="recommendedUse">Recommended Use *</Label>
                  <textarea
                    id="recommendedUse"
                    placeholder="e.g., To increase nitrogen content"
                    className="w-full min-h-20 px-3 py-2 border border-input rounded-md bg-background text-foreground"
                    {...register('recommendedUse', { required: 'Recommended use is required' })}
                  />
                  {errors.recommendedUse && <p className="text-destructive text-sm">⚠ {errors.recommendedUse.message}</p>}
                </div>

                {/* Row 3: NPK Status */}
                <div className="space-y-3 p-4 bg-background rounded-lg border">
                  <p className="font-medium text-foreground">NPK Status (select which nutrients this fertilizer provides)</p>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="npkStatusN">Nitrogen (N)</Label>
                      <Select
                        defaultValue={editingFert?.npkStatus?.n || 'null'}
                        onValueChange={(value) => 
                          setValue('npkStatus.n', value === 'null' ? null : (value as 'Low' | 'Medium'))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="null">None</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="npkStatusP">Phosphorus (P)</Label>
                      <Select
                        defaultValue={editingFert?.npkStatus?.p || 'null'}
                        onValueChange={(value) => 
                          setValue('npkStatus.p', value === 'null' ? null : (value as 'Low' | 'Medium'))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="null">None</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="npkStatusK">Potassium (K)</Label>
                      <Select
                        defaultValue={editingFert?.npkStatus?.k || 'null'}
                        onValueChange={(value) => 
                          setValue('npkStatus.k', value === 'null' ? null : (value as 'Low' | 'Medium'))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="null">None</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Row 4: Price and Availability */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price per Unit (Optional)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 500"
                      {...register('price', { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="availability">Availability (Optional)</Label>
                    <Input
                      id="availability"
                      placeholder="e.g., In Stock, Limited Supply"
                      {...register('availability')}
                    />
                  </div>
                </div>

                {/* Row 5: Benefits */}
                <div className="space-y-2">
                  <Label htmlFor="benefits">Benefits (Optional - comma separated)</Label>
                  <textarea
                    id="benefits"
                    placeholder="e.g., Quick nitrogen availability, Increases vegetative growth"
                    className="w-full min-h-20 px-3 py-2 border border-input rounded-md bg-background text-foreground"
                    onChange={(e) => {
                      const benefits = e.target.value.split(',').map(b => b.trim()).filter(b => b);
                      setValue('benefits', benefits);
                    }}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end">
                  <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : editingFert ? 'Update Fertilizer' : 'Add Fertilizer'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Fertilizers List */}
        {loading ? (
          <Card>
            <CardContent className="pt-8">
              <p className="text-center text-muted-foreground">Loading fertilizers...</p>
            </CardContent>
          </Card>
        ) : fertilizers.length === 0 ? (
          <Card>
            <CardContent className="pt-8">
              <p className="text-center text-muted-foreground">No fertilizers found. Add your first fertilizer to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {fertilizers.map((fert) => (
              <Card key={fert.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <h3 className="text-lg font-semibold text-foreground">{fert.name}</h3>
                      <p className="text-sm text-muted-foreground">{fert.recommendedUse}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mt-2 pt-2 border-t">
                        <div>
                          <p className="text-muted-foreground">Soil pH</p>
                          <p className="font-medium">{fert.soilPH}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">NPK Status</p>
                          <p className="font-medium">
                            {[fert.npkStatus.n, fert.npkStatus.p, fert.npkStatus.k]
                              .filter(Boolean)
                              .join(' | ') || 'N/A'}
                          </p>
                        </div>
                        {fert.price && (
                          <div>
                            <p className="text-muted-foreground">Price</p>
                            <p className="font-medium">₹{fert.price}</p>
                          </div>
                        )}
                        {fert.availability && (
                          <div>
                            <p className="text-muted-foreground">Availability</p>
                            <p className="font-medium">{fert.availability}</p>
                          </div>
                        )}
                      </div>
                      {fert.benefits && fert.benefits.length > 0 && (
                        <div className="mt-2 pt-2 border-t">
                          <p className="text-sm text-muted-foreground mb-1">Benefits:</p>
                          <ul className="text-sm space-y-1">
                            {fert.benefits.map((benefit, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-primary">•</span>
                                <span>{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 md:flex-col">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(fert)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(fert.id)}
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
