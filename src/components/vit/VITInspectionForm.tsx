import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
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
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';
import { VITInspectionChecklist, VITAsset, YesNoOption } from '@/lib/types';

interface VITInspectionFormProps {
  assetId: string;
}

export function VITInspectionForm({ assetId }: VITInspectionFormProps) {
  const navigate = useNavigate();
  const { vitAssets, addVITInspection } = useData();
  const { user } = useAuth();

  // Get the VIT asset details
  const asset = vitAssets.find(a => a.id === assetId);
  
  // Initialize form state
  const [formState, setFormState] = useState({
    inspectionDate: new Date().toISOString().split('T')[0],
    inspectedBy: user?.name || '',
    rodentTermiteEncroachment: 'No' as YesNoOption,
    cleanDustFree: 'Yes' as YesNoOption,
    protectionButtonEnabled: 'Yes' as YesNoOption,
    recloserButtonEnabled: 'Yes' as YesNoOption,
    groundEarthButtonEnabled: 'Yes' as YesNoOption,
    acPowerOn: 'Yes' as YesNoOption,
    batteryPowerLow: 'No' as YesNoOption,
    handleLockOn: 'Yes' as YesNoOption,
    remoteButtonEnabled: 'Yes' as YesNoOption,
    gasLevelLow: 'No' as YesNoOption,
    earthingArrangementAdequate: 'Yes' as YesNoOption,
    noFusesBlown: 'Yes' as YesNoOption,
    noDamageToBushings: 'Yes' as YesNoOption,
    noDamageToHVConnections: 'Yes' as YesNoOption,
    insulatorsClean: 'Yes' as YesNoOption,
    paintworkAdequate: 'Yes' as YesNoOption,
    ptFuseLinkIntact: 'Yes' as YesNoOption,
    noCorrosion: 'Yes' as YesNoOption,
    silicaGelCondition: 'Normal' as 'Normal' | 'Changed' | 'Discolored' | 'N/A',
    correctLabelling: 'Yes' as YesNoOption,
    remarks: '',
  });
  
  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormState(prevState => ({
      ...prevState,
      [id]: value
    }));
  };
  
  // Handle select change
  const handleSelectChange = (id: string, value: string) => {
    setFormState(prevState => ({
      ...prevState,
      [id]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!asset) {
      toast.error("Asset not found!");
      return;
    }
    
    try {
      // Create the inspection with all required fields including id
      const inspection: VITInspectionChecklist = {
        id: uuidv4(), // Generate unique ID
        vitAssetId: assetId,
        inspectionDate: formState.inspectionDate,
        inspectedBy: formState.inspectedBy,
        rodentTermiteEncroachment: formState.rodentTermiteEncroachment,
        cleanDustFree: formState.cleanDustFree,
        protectionButtonEnabled: formState.protectionButtonEnabled,
        recloserButtonEnabled: formState.recloserButtonEnabled,
        groundEarthButtonEnabled: formState.groundEarthButtonEnabled,
        acPowerOn: formState.acPowerOn,
        batteryPowerLow: formState.batteryPowerLow,
        handleLockOn: formState.handleLockOn,
        remoteButtonEnabled: formState.remoteButtonEnabled,
        gasLevelLow: formState.gasLevelLow,
        earthingArrangementAdequate: formState.earthingArrangementAdequate,
        noFusesBlown: formState.noFusesBlown,
        noDamageToBushings: formState.noDamageToBushings,
        noDamageToHVConnections: formState.noDamageToHVConnections,
        insulatorsClean: formState.insulatorsClean,
        paintworkAdequate: formState.paintworkAdequate,
        ptFuseLinkIntact: formState.ptFuseLinkIntact,
        noCorrosion: formState.noCorrosion,
        silicaGelCondition: formState.silicaGelCondition,
        correctLabelling: formState.correctLabelling,
        remarks: formState.remarks,
        createdBy: user?.name || 'Unknown',
        createdAt: new Date().toISOString()
      };
      
      // Add the inspection to the data context
      addVITInspection(inspection);
      
      toast.success("VIT Inspection added successfully!");
      navigate(`/asset-management/vit-inspection-details/${inspection.id}`);
    } catch (error) {
      console.error("Error submitting the inspection:", error);
      toast.error("Failed to add inspection");
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4">
        {/* Inspection Date */}
        <div>
          <Label htmlFor="inspectionDate">Inspection Date</Label>
          <Input
            type="date"
            id="inspectionDate"
            value={formState.inspectionDate}
            onChange={handleChange}
            required
          />
        </div>
        
        {/* Inspected By */}
        <div>
          <Label htmlFor="inspectedBy">Inspected By</Label>
          <Input
            type="text"
            id="inspectedBy"
            value={formState.inspectedBy}
            onChange={handleChange}
            required
          />
        </div>
        
        {/* Rodent/Termite Encroachment */}
        <div>
          <Label htmlFor="rodentTermiteEncroachment">Rodent/Termite Encroachment</Label>
          <Select
            value={formState.rodentTermiteEncroachment}
            onValueChange={(value) => handleSelectChange("rodentTermiteEncroachment", value)}
          >
            <SelectTrigger id="rodentTermiteEncroachment">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Yes">Yes</SelectItem>
              <SelectItem value="No">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Clean/Dust Free */}
        <div>
          <Label htmlFor="cleanDustFree">Clean/Dust Free</Label>
          <Select
            value={formState.cleanDustFree}
            onValueChange={(value) => handleSelectChange("cleanDustFree", value)}
          >
            <SelectTrigger id="cleanDustFree">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Yes">Yes</SelectItem>
              <SelectItem value="No">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Protection Button Enabled */}
        <div>
          <Label htmlFor="protectionButtonEnabled">Protection Button Enabled</Label>
          <Select
            value={formState.protectionButtonEnabled}
            onValueChange={(value) => handleSelectChange("protectionButtonEnabled", value)}
          >
            <SelectTrigger id="protectionButtonEnabled">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Yes">Yes</SelectItem>
              <SelectItem value="No">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Recloser Button Enabled */}
        <div>
          <Label htmlFor="recloserButtonEnabled">Recloser Button Enabled</Label>
          <Select
            value={formState.recloserButtonEnabled}
            onValueChange={(value) => handleSelectChange("recloserButtonEnabled", value)}
          >
            <SelectTrigger id="recloserButtonEnabled">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Yes">Yes</SelectItem>
              <SelectItem value="No">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Ground/Earth Button Enabled */}
        <div>
          <Label htmlFor="groundEarthButtonEnabled">Ground/Earth Button Enabled</Label>
          <Select
            value={formState.groundEarthButtonEnabled}
            onValueChange={(value) => handleSelectChange("groundEarthButtonEnabled", value)}
          >
            <SelectTrigger id="groundEarthButtonEnabled">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Yes">Yes</SelectItem>
              <SelectItem value="No">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* AC Power On */}
        <div>
          <Label htmlFor="acPowerOn">AC Power On</Label>
          <Select
            value={formState.acPowerOn}
            onValueChange={(value) => handleSelectChange("acPowerOn", value)}
          >
            <SelectTrigger id="acPowerOn">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Yes">Yes</SelectItem>
              <SelectItem value="No">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Battery Power Low */}
        <div>
          <Label htmlFor="batteryPowerLow">Battery Power Low</Label>
          <Select
            value={formState.batteryPowerLow}
            onValueChange={(value) => handleSelectChange("batteryPowerLow", value)}
          >
            <SelectTrigger id="batteryPowerLow">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Yes">Yes</SelectItem>
              <SelectItem value="No">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Handle Lock On */}
        <div>
          <Label htmlFor="handleLockOn">Handle Lock On</Label>
          <Select
            value={formState.handleLockOn}
            onValueChange={(value) => handleSelectChange("handleLockOn", value)}
          >
            <SelectTrigger id="handleLockOn">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Yes">Yes</SelectItem>
              <SelectItem value="No">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Remote Button Enabled */}
        <div>
          <Label htmlFor="remoteButtonEnabled">Remote Button Enabled</Label>
          <Select
            value={formState.remoteButtonEnabled}
            onValueChange={(value) => handleSelectChange("remoteButtonEnabled", value)}
          >
            <SelectTrigger id="remoteButtonEnabled">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Yes">Yes</SelectItem>
              <SelectItem value="No">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Gas Level Low */}
        <div>
          <Label htmlFor="gasLevelLow">Gas Level Low</Label>
          <Select
            value={formState.gasLevelLow}
            onValueChange={(value) => handleSelectChange("gasLevelLow", value)}
          >
            <SelectTrigger id="gasLevelLow">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Yes">Yes</SelectItem>
              <SelectItem value="No">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Earthing Arrangement Adequate */}
        <div>
          <Label htmlFor="earthingArrangementAdequate">Earthing Arrangement Adequate</Label>
          <Select
            value={formState.earthingArrangementAdequate}
            onValueChange={(value) => handleSelectChange("earthingArrangementAdequate", value)}
          >
            <SelectTrigger id="earthingArrangementAdequate">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Yes">Yes</SelectItem>
              <SelectItem value="No">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* No Fuses Blown */}
        <div>
          <Label htmlFor="noFusesBlown">No Fuses Blown</Label>
          <Select
            value={formState.noFusesBlown}
            onValueChange={(value) => handleSelectChange("noFusesBlown", value)}
          >
            <SelectTrigger id="noFusesBlown">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Yes">Yes</SelectItem>
              <SelectItem value="No">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* No Damage to Bushings */}
        <div>
          <Label htmlFor="noDamageToBushings">No Damage to Bushings</Label>
          <Select
            value={formState.noDamageToBushings}
            onValueChange={(value) => handleSelectChange("noDamageToBushings", value)}
          >
            <SelectTrigger id="noDamageToBushings">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Yes">Yes</SelectItem>
              <SelectItem value="No">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* No Damage to HV Connections */}
        <div>
          <Label htmlFor="noDamageToHVConnections">No Damage to HV Connections</Label>
          <Select
            value={formState.noDamageToHVConnections}
            onValueChange={(value) => handleSelectChange("noDamageToHVConnections", value)}
          >
            <SelectTrigger id="noDamageToHVConnections">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Yes">Yes</SelectItem>
              <SelectItem value="No">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Insulators Clean */}
        <div>
          <Label htmlFor="insulatorsClean">Insulators Clean</Label>
          <Select
            value={formState.insulatorsClean}
            onValueChange={(value) => handleSelectChange("insulatorsClean", value)}
          >
            <SelectTrigger id="insulatorsClean">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Yes">Yes</SelectItem>
              <SelectItem value="No">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Paintwork Adequate */}
        <div>
          <Label htmlFor="paintworkAdequate">Paintwork Adequate</Label>
          <Select
            value={formState.paintworkAdequate}
            onValueChange={(value) => handleSelectChange("paintworkAdequate", value)}
          >
            <SelectTrigger id="paintworkAdequate">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Yes">Yes</SelectItem>
              <SelectItem value="No">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* PT Fuse Link Intact */}
        <div>
          <Label htmlFor="ptFuseLinkIntact">PT Fuse Link Intact</Label>
          <Select
            value={formState.ptFuseLinkIntact}
            onValueChange={(value) => handleSelectChange("ptFuseLinkIntact", value)}
          >
            <SelectTrigger id="ptFuseLinkIntact">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Yes">Yes</SelectItem>
              <SelectItem value="No">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* No Corrosion */}
        <div>
          <Label htmlFor="noCorrosion">No Corrosion</Label>
          <Select
            value={formState.noCorrosion}
            onValueChange={(value) => handleSelectChange("noCorrosion", value)}
          >
            <SelectTrigger id="noCorrosion">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Yes">Yes</SelectItem>
              <SelectItem value="No">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Silica Gel Condition */}
        <div>
          <Label htmlFor="silicaGelCondition">Silica Gel Condition</Label>
          <Select
            value={formState.silicaGelCondition}
            onValueChange={(value) => handleSelectChange("silicaGelCondition", value)}
          >
            <SelectTrigger id="silicaGelCondition">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Normal">Normal</SelectItem>
              <SelectItem value="Changed">Changed</SelectItem>
              <SelectItem value="Discolored">Discolored</SelectItem>
              <SelectItem value="N/A">N/A</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Correct Labelling */}
        <div>
          <Label htmlFor="correctLabelling">Correct Labelling</Label>
          <Select
            value={formState.correctLabelling}
            onValueChange={(value) => handleSelectChange("correctLabelling", value)}
          >
            <SelectTrigger id="correctLabelling">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Yes">Yes</SelectItem>
              <SelectItem value="No">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Remarks */}
        <div>
          <Label htmlFor="remarks">Remarks</Label>
          <Textarea
            id="remarks"
            placeholder="Enter any remarks"
            value={formState.remarks}
            onChange={handleChange}
          />
        </div>
        
        {/* Submit Button */}
        <Button type="submit">Submit Inspection</Button>
      </div>
    </form>
  );
}
