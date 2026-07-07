import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin } from 'lucide-react';

interface LocationPickerProps {
  value: string;
  onChange: (location: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}

export function LocationPicker({
  value,
  onChange,
  placeholder = 'Enter your location',
  disabled = false,
  required = false,
}: LocationPickerProps) {
  const [searchInput, setSearchInput] = useState(value);

  useEffect(() => {
    setSearchInput(value);
  }, [value]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchInput(val);
    onChange(val);
  };

  return (
    <div className="space-y-2">
      <Label className="text-foreground font-medium flex items-center gap-2">
        <MapPin className="h-4 w-4" />
        Location {required && '*'}
      </Label>

      <Input
        value={searchInput}
        onChange={handleSearchChange}
        placeholder={placeholder}
        disabled={disabled}
        className="border-input focus:border-ring focus:ring-ring transition-all duration-200"
      />
    </div>
  );
}
