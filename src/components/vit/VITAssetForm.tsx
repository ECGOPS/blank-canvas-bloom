
import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { VITAsset } from '@/lib/types';

interface VITAssetFormProps {
  asset?: VITAsset;
  onSubmit: () => void;
  onCancel: () => void;
}

const VITAssetForm: React.FC<VITAssetFormProps> = ({ asset, onSubmit, onCancel }) => {
  const { regions, districts, addVITAsset, updateVITAsset } = useData();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<Partial<VITAsset>>({
    regionId: user?.region || '',
    districtId: user?.district || '',
    voltageLevel: '',
    typeOfUnit: '',
    serialNumber: '',
    location: '',
    gpsCoordinates: '',
    status: 'active',
    protection: '',
  });
  
  const [availableDistricts, setAvailableDistricts] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // If editing, load the asset data
  useEffect(() => {
    if (asset) {
      setFormData({
        ...asset
      });
    }
  }, [asset]);
  
  // Filter districts based on selected region
  useEffect(() => {
    if (formData.regionId) {
      const regionDistricts = districts.filter(district => district.regionId === formData.regionId);
      setAvailableDistricts(regionDistricts);
      
      // If the current district doesn't belong to the new region, reset it
      if (formData.districtId) {
        const districtExists = regionDistricts.some(district => district.id === formData.districtId);
        if (!districtExists && regionDistricts.length > 0) {
          setFormData(prev => ({
            ...prev,
            districtId: regionDistricts[0].id
          }));
        }
      }
    } else {
      setAvailableDistricts([]);
    }
  }, [formData.regionId, districts]);
  
  const handleInputChange = (field: keyof VITAsset, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
    
    // Clear any error for this field
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: ''
      });
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.regionId) newErrors.regionId = 'Region is required';
    if (!formData.districtId) newErrors.districtId = 'District is required';
    if (!formData.voltageLevel) newErrors.voltageLevel = 'Voltage level is required';
    if (!formData.typeOfUnit) newErrors.typeOfUnit = 'Type of unit is required';
    if (!formData.serialNumber) newErrors.serialNumber = 'Serial number is required';
    if (!formData.location) newErrors.location = 'Location is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill all required fields');
      return;
    }
    
    try {
      if (asset) {
        // Update existing asset
        updateVITAsset(formData as VITAsset);
        toast.success('VIT asset updated successfully');
      } else {
        // Add new asset
        const newAsset: VITAsset = {
          ...formData as VITAsset,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          createdBy: user?.name || 'Anonymous',
        };
        addVITAsset(newAsset);
        toast.success('VIT asset added successfully');
      }
      
      onSubmit();
    } catch (error) {
      console.error('Error saving VIT asset:', error);
      toast.error('Failed to save VIT asset');
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="regionId">Region</Label>
          <Select
            value={formData.regionId}
            onValueChange={(value) => handleInputChange('regionId', value)}
          >
            <SelectTrigger id="regionId" className={errors.regionId ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select a region" />
            </SelectTrigger>
            <SelectContent>
              {regions.map((region) => (
                <SelectItem key={region.id} value={region.id}>
                  {region.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.regionId && <p className="text-sm text-red-500">{errors.regionId}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="districtId">District</Label>
          <Select
            value={formData.districtId}
            onValueChange={(value) => handleInputChange('districtId', value)}
            disabled={!formData.regionId || availableDistricts.length === 0}
          >
            <SelectTrigger id="districtId" className={errors.districtId ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select a district" />
            </SelectTrigger>
            <SelectContent>
              {availableDistricts.map((district) => (
                <SelectItem key={district.id} value={district.id}>
                  {district.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.districtId && <p className="text-sm text-red-500">{errors.districtId}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="voltageLevel">Voltage Level</Label>
          <Select
            value={formData.voltageLevel}
            onValueChange={(value) => handleInputChange('voltageLevel', value)}
          >
            <SelectTrigger id="voltageLevel" className={errors.voltageLevel ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select voltage level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="11kV">11kV</SelectItem>
              <SelectItem value="33kV">33kV</SelectItem>
              <SelectItem value="34.5kV">34.5kV</SelectItem>
            </SelectContent>
          </Select>
          {errors.voltageLevel && <p className="text-sm text-red-500">{errors.voltageLevel}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="typeOfUnit">Type of Unit</Label>
          <Select
            value={formData.typeOfUnit}
            onValueChange={(value) => handleInputChange('typeOfUnit', value)}
          >
            <SelectTrigger id="typeOfUnit" className={errors.typeOfUnit ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select type of unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="VIT">VIT</SelectItem>
              <SelectItem value="Recloser">Recloser</SelectItem>
              <SelectItem value="Autorecloser">Autorecloser</SelectItem>
              <SelectItem value="Sectionalizer">Sectionalizer</SelectItem>
            </SelectContent>
          </Select>
          {errors.typeOfUnit && <p className="text-sm text-red-500">{errors.typeOfUnit}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="serialNumber">Serial Number</Label>
          <Input
            id="serialNumber"
            value={formData.serialNumber}
            onChange={(e) => handleInputChange('serialNumber', e.target.value)}
            className={errors.serialNumber ? 'border-red-500' : ''}
          />
          {errors.serialNumber && <p className="text-sm text-red-500">{errors.serialNumber}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className={errors.location ? 'border-red-500' : ''}
          />
          {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="gpsCoordinates">GPS Coordinates</Label>
          <Input
            id="gpsCoordinates"
            value={formData.gpsCoordinates}
            onChange={(e) => handleInputChange('gpsCoordinates', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleInputChange('status', value)}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="faulty">Faulty</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="protection">Protection</Label>
          <Input
            id="protection"
            value={formData.protection}
            onChange={(e) => handleInputChange('protection', e.target.value)}
          />
        </div>
        
        <div className="flex justify-end space-x-4 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {asset ? 'Update Asset' : 'Save Asset'}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default VITAssetForm;
