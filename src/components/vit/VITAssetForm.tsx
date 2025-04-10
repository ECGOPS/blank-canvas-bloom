import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { VITAsset, VoltageLevel, VITStatus } from '@/lib/types';

export function VITAssetForm({ assetData, onFormSubmit, onFormCancel }) {
  const { addVITAsset, updateVITAsset, regions, districts } = useData();
  const navigate = useNavigate();
  const isEditMode = !!assetData;
  
  const [formData, setFormData] = useState({
    id: assetData?.id || uuidv4(),
    regionId: assetData?.regionId || "",
    districtId: assetData?.districtId || "",
    voltageLevel: assetData?.voltageLevel || ("11KV" as VoltageLevel),
    typeOfUnit: assetData?.typeOfUnit || "",
    serialNumber: assetData?.serialNumber || "",
    location: assetData?.location || "",
    gpsCoordinates: assetData?.gpsCoordinates || "",
    status: assetData?.status || ("Operational" as VITStatus),
    protection: assetData?.protection || "",
    photoUrl: assetData?.photoUrl || "placeholder.svg",
    createdAt: assetData?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [errors, setErrors] = useState({});

  // Update available districts when region changes
  useEffect(() => {
    if (formData.regionId) {
      const districtsInRegion = districts.filter(d => d.regionId === formData.regionId);
      setAvailableDistricts(districtsInRegion);
      
      // If current district is not in this region, reset it
      if (formData.districtId && !districtsInRegion.find(d => d.id === formData.districtId)) {
        setFormData(prev => ({ ...prev, districtId: "" }));
      }
    } else {
      setAvailableDistricts([]);
      setFormData(prev => ({ ...prev, districtId: "" }));
    }
  }, [formData.regionId, districts]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.regionId) newErrors.regionId = "Region is required";
    if (!formData.districtId) newErrors.districtId = "District is required";
    if (!formData.voltageLevel) newErrors.voltageLevel = "Voltage level is required";
    if (!formData.typeOfUnit) newErrors.typeOfUnit = "Type of unit is required";
    if (!formData.serialNumber) newErrors.serialNumber = "Serial number is required";
    if (!formData.location) newErrors.location = "Location is required";
    if (!formData.status) newErrors.status = "Status is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    try {
      if (isEditMode) {
        updateVITAsset(formData);
        toast.success("Asset updated successfully");
      } else {
        addVITAsset(formData);
        toast.success("Asset created successfully");
      }
      
      if (onFormSubmit) {
        onFormSubmit(formData);
      }
    } catch (error) {
      console.error("Error saving asset:", error);
      toast.error("Error saving asset. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="regionId">Region <span className="text-red-500">*</span></Label>
          <Select 
            value={formData.regionId} 
            onValueChange={(value) => handleSelectChange("regionId", value)}
          >
            <SelectTrigger id="regionId" className={errors.regionId ? "border-red-500" : ""}>
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              {regions.map(region => (
                <SelectItem key={region.id} value={region.id}>
                  {region.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.regionId && <p className="text-red-500 text-xs">{errors.regionId}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="districtId">District <span className="text-red-500">*</span></Label>
          <Select 
            value={formData.districtId} 
            onValueChange={(value) => handleSelectChange("districtId", value)}
            disabled={!formData.regionId}
          >
            <SelectTrigger id="districtId" className={errors.districtId ? "border-red-500" : ""}>
              <SelectValue placeholder="Select district" />
            </SelectTrigger>
            <SelectContent>
              {availableDistricts.map(district => (
                <SelectItem key={district.id} value={district.id}>
                  {district.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.districtId && <p className="text-red-500 text-xs">{errors.districtId}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="voltageLevel">Voltage Level <span className="text-red-500">*</span></Label>
          <Select 
            value={formData.voltageLevel} 
            onValueChange={(value) => handleSelectChange("voltageLevel", value)}
          >
            <SelectTrigger id="voltageLevel" className={errors.voltageLevel ? "border-red-500" : ""}>
              <SelectValue placeholder="Select voltage level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="11KV">11KV</SelectItem>
              <SelectItem value="33KV">33KV</SelectItem>
              <SelectItem value="66KV">66KV</SelectItem>
            </SelectContent>
          </Select>
          {errors.voltageLevel && <p className="text-red-500 text-xs">{errors.voltageLevel}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="typeOfUnit">Type of Unit <span className="text-red-500">*</span></Label>
          <Input
            id="typeOfUnit"
            name="typeOfUnit"
            value={formData.typeOfUnit}
            onChange={handleChange}
            className={errors.typeOfUnit ? "border-red-500" : ""}
          />
          {errors.typeOfUnit && <p className="text-red-500 text-xs">{errors.typeOfUnit}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="serialNumber">Serial Number <span className="text-red-500">*</span></Label>
          <Input
            id="serialNumber"
            name="serialNumber"
            value={formData.serialNumber}
            onChange={handleChange}
            className={errors.serialNumber ? "border-red-500" : ""}
          />
          {errors.serialNumber && <p className="text-red-500 text-xs">{errors.serialNumber}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
          <Input
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className={errors.location ? "border-red-500" : ""}
          />
          {errors.location && <p className="text-red-500 text-xs">{errors.location}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="gpsCoordinates">GPS Coordinates</Label>
          <Input
            id="gpsCoordinates"
            name="gpsCoordinates"
            value={formData.gpsCoordinates}
            onChange={handleChange}
            placeholder="e.g. 5.6037, -0.1870"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="status">Status <span className="text-red-500">*</span></Label>
          <Select 
            value={formData.status} 
            onValueChange={(value) => handleSelectChange("status", value)}
          >
            <SelectTrigger id="status" className={errors.status ? "border-red-500" : ""}>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Operational">Operational</SelectItem>
              <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
              <SelectItem value="Faulty">Faulty</SelectItem>
              <SelectItem value="Decommissioned">Decommissioned</SelectItem>
            </SelectContent>
          </Select>
          {errors.status && <p className="text-red-500 text-xs">{errors.status}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="protection">Protection</Label>
          <Input
            id="protection"
            name="protection"
            value={formData.protection}
            onChange={handleChange}
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onFormCancel}
        >
          Cancel
        </Button>
        <Button type="submit">
          {isEditMode ? "Update Asset" : "Create Asset"}
        </Button>
      </div>
    </form>
  );
}
