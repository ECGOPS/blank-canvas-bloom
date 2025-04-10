
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { v4 as uuidv4 } from 'uuid';
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
import { toast } from '@/components/ui/sonner';
import { VITAsset, VoltageLevel, VITProtection, VITStatus } from '@/lib/types';

export interface VITAssetFormProps {
  onSuccess?: () => void;
}

export default function VITAssetForm({ onSuccess }: VITAssetFormProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { regions, districts, addVITAsset } = useData();
  
  // Initialize form state with proper types
  const [formData, setFormData] = useState<{
    regionId: string;
    districtId: string;
    voltageLevel: VoltageLevel;
    typeOfUnit: string;
    serialNumber: string;
    location: string;
    gpsCoordinates: string;
    protection: VITProtection;
    status: VITStatus;
  }>({
    regionId: '',
    districtId: '',
    voltageLevel: '11kV' as VoltageLevel, // Set a valid default value
    typeOfUnit: '',
    serialNumber: '',
    location: '',
    gpsCoordinates: '',
    protection: 'None' as VITProtection,
    status: 'Operational' as VITStatus, // Set a valid default value
  });
  
  // Handle input change
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Filter districts based on selected region
  const filteredDistricts = formData.regionId 
    ? districts.filter(d => d.regionId === formData.regionId)
    : [];
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.regionId || !formData.districtId || !formData.voltageLevel || 
        !formData.typeOfUnit || !formData.serialNumber || !formData.location) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    try {
      // Create VIT Asset with all needed fields
      const newAsset: VITAsset = {
        id: uuidv4(),
        ...formData,
        createdBy: user?.name || 'Unknown',
        createdAt: new Date().toISOString(),
      };
      
      // Add asset to the data context
      addVITAsset(newAsset);
      
      toast.success("VIT Asset added successfully");
      
      // Call success callback or navigate away
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/asset-management/vit-assets');
      }
    } catch (error) {
      console.error("Error adding VIT asset:", error);
      toast.error("Failed to add VIT asset");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="regionId">Region</Label>
          <Select
            value={formData.regionId}
            onValueChange={(value) => handleChange('regionId', value)}
          >
            <SelectTrigger id="regionId">
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

        <div>
          <Label htmlFor="districtId">District</Label>
          <Select
            value={formData.districtId}
            onValueChange={(value) => handleChange('districtId', value)}
            disabled={!formData.regionId}
          >
            <SelectTrigger id="districtId">
              <SelectValue placeholder={formData.regionId ? "Select District" : "Select Region First"} />
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

        <div>
          <Label htmlFor="voltageLevel">Voltage Level</Label>
          <Select
            value={formData.voltageLevel}
            onValueChange={(value) => handleChange('voltageLevel', value as VoltageLevel)}
          >
            <SelectTrigger id="voltageLevel">
              <SelectValue placeholder="Select Voltage Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="11kV">11kV</SelectItem>
              <SelectItem value="33kV">33kV</SelectItem>
              <SelectItem value="34.5kV">34.5kV</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="typeOfUnit">Type of Unit</Label>
          <Input
            id="typeOfUnit"
            value={formData.typeOfUnit}
            onChange={(e) => handleChange('typeOfUnit', e.target.value)}
            placeholder="e.g. RMU, VCB, etc."
          />
        </div>

        <div>
          <Label htmlFor="serialNumber">Serial Number</Label>
          <Input
            id="serialNumber"
            value={formData.serialNumber}
            onChange={(e) => handleChange('serialNumber', e.target.value)}
            placeholder="Enter serial number"
          />
        </div>

        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            placeholder="Enter location"
          />
        </div>

        <div>
          <Label htmlFor="gpsCoordinates">GPS Coordinates</Label>
          <Input
            id="gpsCoordinates"
            value={formData.gpsCoordinates}
            onChange={(e) => handleChange('gpsCoordinates', e.target.value)}
            placeholder="Latitude, Longitude"
          />
        </div>

        <div>
          <Label htmlFor="protection">Protection</Label>
          <Select
            value={formData.protection}
            onValueChange={(value) => handleChange('protection', value as VITProtection)}
          >
            <SelectTrigger id="protection">
              <SelectValue placeholder="Select Protection Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="None">None</SelectItem>
              <SelectItem value="Fuse">Fuse</SelectItem>
              <SelectItem value="Circuit Breaker">Circuit Breaker</SelectItem>
              <SelectItem value="Relay">Relay</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleChange('status', value as VITStatus)}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Operational">Operational</SelectItem>
              <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
              <SelectItem value="Faulty">Faulty</SelectItem>
              <SelectItem value="Decommissioned">Decommissioned</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" className="w-full">Add VIT Asset</Button>
    </form>
  );
}
