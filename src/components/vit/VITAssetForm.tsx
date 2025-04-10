
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { VITAsset, VITStatus, VoltageLevel } from '@/lib/types';

export interface VITAssetFormProps {
  asset?: VITAsset;
  onFormSubmit: () => void;
  onFormCancel: () => void;
}

export function VITAssetForm({ asset, onFormSubmit, onFormCancel }: VITAssetFormProps) {
  const { regions, districts, addVITAsset, updateVITAsset } = useData();
  const [selectedRegion, setSelectedRegion] = useState<string>(asset?.regionId || '');
  const isEditMode = !!asset;
  
  // Default values for the form
  const defaultValues = {
    regionId: asset?.regionId || '',
    districtId: asset?.districtId || '',
    voltageLevel: asset?.voltageLevel || ('11KV' as VoltageLevel),
    typeOfUnit: asset?.typeOfUnit || '',
    serialNumber: asset?.serialNumber || '',
    location: asset?.location || '',
    gpsCoordinates: asset?.gpsCoordinates || '',
    status: asset?.status || ('Operational' as VITStatus),
    protection: asset?.protection || '',
  };
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues
  });
  
  const watchedRegion = watch('regionId');
  
  // Update districts when region changes
  useEffect(() => {
    if (watchedRegion && watchedRegion !== selectedRegion) {
      setSelectedRegion(watchedRegion);
      setValue('districtId', ''); // Reset district when region changes
    }
  }, [watchedRegion, selectedRegion, setValue]);
  
  // Get filtered districts based on selected region
  const filteredDistricts = districts.filter(
    district => district.regionId === selectedRegion
  );
  
  const onSubmit = (data: any) => {
    try {
      if (isEditMode && asset) {
        // Update existing asset
        const updatedAsset: VITAsset = {
          ...asset,
          ...data,
          updatedAt: new Date().toISOString()
        };
        updateVITAsset(updatedAsset);
        toast.success("Asset updated successfully");
      } else {
        // Create new asset
        const newAsset: VITAsset = {
          id: uuidv4(),
          ...data,
          photoUrl: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'Current User' // This should come from auth context
        };
        addVITAsset(newAsset);
        toast.success("Asset added successfully");
      }
      
      onFormSubmit();
    } catch (error) {
      console.error("Error saving asset:", error);
      toast.error("Error saving asset");
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Region and District */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Region</label>
          <select
            {...register('regionId', { required: "Region is required" })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            defaultValue={asset?.regionId || ''}
          >
            <option value="">Select Region</option>
            {regions.map(region => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
          {errors.regionId && (
            <p className="text-red-500 text-xs mt-1">{errors.regionId.message?.toString()}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">District</label>
          <select
            {...register('districtId', { required: "District is required" })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            defaultValue={asset?.districtId || ''}
            disabled={!selectedRegion}
          >
            <option value="">Select District</option>
            {filteredDistricts.map(district => (
              <option key={district.id} value={district.id}>
                {district.name}
              </option>
            ))}
          </select>
          {errors.districtId && (
            <p className="text-red-500 text-xs mt-1">{errors.districtId.message?.toString()}</p>
          )}
        </div>
      </div>
      
      {/* Voltage Level and Type of Unit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Voltage Level</label>
          <select
            {...register('voltageLevel', { required: "Voltage level is required" })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            defaultValue={asset?.voltageLevel || '11KV'}
          >
            <option value="11KV">11KV</option>
            <option value="33KV">33KV</option>
            <option value="66KV">66KV</option>
          </select>
          {errors.voltageLevel && (
            <p className="text-red-500 text-xs mt-1">{errors.voltageLevel.message?.toString()}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Type of Unit</label>
          <Input
            {...register('typeOfUnit', { required: "Type of unit is required" })}
            placeholder="e.g., Ring Main Unit, Circuit Breaker"
            defaultValue={asset?.typeOfUnit || ''}
          />
          {errors.typeOfUnit && (
            <p className="text-red-500 text-xs mt-1">{errors.typeOfUnit.message?.toString()}</p>
          )}
        </div>
      </div>
      
      {/* Serial Number and Location */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Serial Number</label>
          <Input
            {...register('serialNumber', { required: "Serial number is required" })}
            placeholder="Enter serial number"
            defaultValue={asset?.serialNumber || ''}
          />
          {errors.serialNumber && (
            <p className="text-red-500 text-xs mt-1">{errors.serialNumber.message?.toString()}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <Input
            {...register('location', { required: "Location is required" })}
            placeholder="Enter location"
            defaultValue={asset?.location || ''}
          />
          {errors.location && (
            <p className="text-red-500 text-xs mt-1">{errors.location.message?.toString()}</p>
          )}
        </div>
      </div>
      
      {/* GPS Coordinates */}
      <div>
        <label className="block text-sm font-medium mb-1">GPS Coordinates</label>
        <Input
          {...register('gpsCoordinates')}
          placeholder="e.g., 5.5557, -0.1969"
          defaultValue={asset?.gpsCoordinates || ''}
        />
      </div>
      
      {/* Status and Protection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            {...register('status', { required: "Status is required" })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            defaultValue={asset?.status || 'Operational'}
          >
            <option value="Operational">Operational</option>
            <option value="Under Maintenance">Under Maintenance</option>
            <option value="Faulty">Faulty</option>
            <option value="Decommissioned">Decommissioned</option>
          </select>
          {errors.status && (
            <p className="text-red-500 text-xs mt-1">{errors.status.message?.toString()}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Protection</label>
          <Input
            {...register('protection')}
            placeholder="e.g., Overcurrent, Earth Fault"
            defaultValue={asset?.protection || ''}
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
          {isEditMode ? "Update Asset" : "Add Asset"}
        </Button>
      </div>
    </form>
  );
}
