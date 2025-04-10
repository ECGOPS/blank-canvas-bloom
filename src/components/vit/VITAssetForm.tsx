
import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { v4 as uuidv4 } from 'uuid';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VITAsset, VoltageLevel, VITStatus } from '@/lib/types';
import { toast } from '@/components/ui/sonner';

// Define VITProtection type since it's not exported from lib/types
type VITProtection = 'Fused' | 'Circuit Breaker' | 'Both' | 'None';

export interface VITAssetFormProps {
  existingAsset?: VITAsset;
  onFormSubmit: () => void;
  onFormCancel: () => void;
}

export function VITAssetForm({ existingAsset, onFormSubmit, onFormCancel }: VITAssetFormProps) {
  const { regions, districts, addVITAsset, updateVITAsset } = useData();
  
  // State for form data
  const [formData, setFormData] = useState({
    id: existingAsset?.id || '',
    regionId: existingAsset?.regionId || '',
    districtId: existingAsset?.districtId || '',
    voltageLevel: existingAsset?.voltageLevel || '' as VoltageLevel,
    typeOfUnit: existingAsset?.typeOfUnit || '',
    serialNumber: existingAsset?.serialNumber || '',
    location: existingAsset?.location || '',
    gpsCoordinates: existingAsset?.gpsCoordinates || '',
    protection: existingAsset?.protection || 'None' as VITProtection,
    status: existingAsset?.status || 'Active' as VITStatus,
    createdBy: existingAsset?.createdBy || 'System User',
    createdAt: existingAsset?.createdAt || new Date().toISOString(),
    updatedAt: existingAsset?.updatedAt || new Date().toISOString()
  });
  
  // Filter districts based on selected region
  const [filteredDistricts, setFilteredDistricts] = useState(districts);
  
  useEffect(() => {
    if (formData.regionId) {
      setFilteredDistricts(districts.filter(d => d.regionId === formData.regionId));
    } else {
      setFilteredDistricts([]);
    }
  }, [formData.regionId, districts]);
  
  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Reset district if region changes
    if (name === 'regionId') {
      setFormData(prev => ({ ...prev, districtId: '' }));
    }
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.regionId || !formData.districtId || !formData.voltageLevel || 
        !formData.serialNumber || !formData.location) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (existingAsset) {
      // Update existing asset
      updateVITAsset({
        ...formData,
        updatedAt: new Date().toISOString()
      } as VITAsset);
    } else {
      // Add new asset
      addVITAsset({
        ...formData,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as VITAsset);
    }
    
    onFormSubmit();
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Region Selection */}
          <div>
            <label className="text-sm font-medium">Region</label>
            <Select 
              value={formData.regionId} 
              onValueChange={(value) => handleSelectChange('regionId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Region" />
              </SelectTrigger>
              <SelectContent>
                {regions.map((region) => (
                  <SelectItem key={region.id} value={region.id}>
                    {region.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* District Selection */}
          <div>
            <label className="text-sm font-medium">District</label>
            <Select 
              value={formData.districtId} 
              onValueChange={(value) => handleSelectChange('districtId', value)}
              disabled={!formData.regionId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select District" />
              </SelectTrigger>
              <SelectContent>
                {filteredDistricts.map((district) => (
                  <SelectItem key={district.id} value={district.id}>
                    {district.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Voltage Level */}
          <div>
            <label className="text-sm font-medium">Voltage Level</label>
            <Select 
              value={formData.voltageLevel} 
              onValueChange={(value) => handleSelectChange('voltageLevel', value as VoltageLevel)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Voltage Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="11kV">11kV</SelectItem>
                <SelectItem value="33kV">33kV</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Type of Unit */}
          <div>
            <label className="text-sm font-medium" htmlFor="typeOfUnit">Type of Unit</label>
            <Input
              id="typeOfUnit"
              name="typeOfUnit"
              value={formData.typeOfUnit}
              onChange={handleChange}
              placeholder="e.g., VIT Transformer, Switch"
            />
          </div>
          
          {/* Serial Number */}
          <div>
            <label className="text-sm font-medium" htmlFor="serialNumber">Serial Number</label>
            <Input
              id="serialNumber"
              name="serialNumber"
              value={formData.serialNumber}
              onChange={handleChange}
              placeholder="Serial Number"
              required
            />
          </div>
          
          {/* Location */}
          <div>
            <label className="text-sm font-medium" htmlFor="location">Location</label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Location Description"
              required
            />
          </div>
          
          {/* GPS Coordinates */}
          <div>
            <label className="text-sm font-medium" htmlFor="gpsCoordinates">GPS Coordinates</label>
            <Input
              id="gpsCoordinates"
              name="gpsCoordinates"
              value={formData.gpsCoordinates}
              onChange={handleChange}
              placeholder="Latitude, Longitude"
            />
          </div>
          
          {/* Protection */}
          <div>
            <label className="text-sm font-medium">Protection Type</label>
            <Select 
              value={formData.protection} 
              onValueChange={(value) => handleSelectChange('protection', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Protection Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Fused">Fused</SelectItem>
                <SelectItem value="Circuit Breaker">Circuit Breaker</SelectItem>
                <SelectItem value="Both">Both</SelectItem>
                <SelectItem value="None">None</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Status */}
          <div>
            <label className="text-sm font-medium">Status</label>
            <Select 
              value={formData.status} 
              onValueChange={(value) => handleSelectChange('status', value as VITStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="Decommissioned">Decommissioned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onFormCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {existingAsset ? 'Update Asset' : 'Create Asset'}
          </Button>
        </div>
      </div>
    </form>
  );
}
