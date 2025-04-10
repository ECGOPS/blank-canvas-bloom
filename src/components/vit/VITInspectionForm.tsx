
import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { v4 as uuidv4 } from 'uuid';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { YesNoOption, VITInspectionChecklist } from '@/lib/types';
import { toast } from '@/components/ui/sonner';

// Define the props for the VITInspectionForm
export interface VITInspectionFormProps {
  assetId: string;
  existingInspection?: VITInspectionChecklist;
  onFormSubmit: () => void;
  onFormCancel: () => void;
}

// Define the available options for Yes/No fields
const optionChoices: YesNoOption[] = ['Yes', 'No', 'N/A'];

// Define the available options for silica gel condition
const silicaGelOptions = ['Normal', 'Changed', 'Discolored', 'N/A'];

// Helper function to create a select field for Yes/No/NA options
const YesNoSelectField = ({ 
  label, value, onChange 
}: { 
  label: string; 
  value: YesNoOption; 
  onChange: (value: YesNoOption) => void; 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 mb-4">
      <label className="text-sm font-medium">{label}</label>
      <div className="md:col-span-2">
        <Select value={value} onValueChange={(val) => onChange(val as YesNoOption)}>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {optionChoices.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export function VITInspectionForm({ 
  assetId,
  existingInspection,
  onFormSubmit,
  onFormCancel
}: VITInspectionFormProps) {
  const { addVITInspection, updateVITInspection } = useData();
  
  // Initialize form state with existing inspection data or defaults
  const [formData, setFormData] = useState<Omit<VITInspectionChecklist, 'id'> & { id?: string }>({
    id: existingInspection?.id,
    vitAssetId: assetId,
    inspectionDate: existingInspection?.inspectionDate || new Date().toISOString().split('T')[0],
    inspectedBy: existingInspection?.inspectedBy || '',
    rodentTermiteEncroachment: existingInspection?.rodentTermiteEncroachment || 'N/A',
    cleanDustFree: existingInspection?.cleanDustFree || 'N/A',
    protectionButtonEnabled: existingInspection?.protectionButtonEnabled || 'N/A',
    recloserButtonEnabled: existingInspection?.recloserButtonEnabled || 'N/A',
    groundEarthButtonEnabled: existingInspection?.groundEarthButtonEnabled || 'N/A',
    acPowerOn: existingInspection?.acPowerOn || 'N/A',
    batteryPowerLow: existingInspection?.batteryPowerLow || 'N/A',
    handleLockOn: existingInspection?.handleLockOn || 'N/A',
    remoteButtonEnabled: existingInspection?.remoteButtonEnabled || 'N/A',
    gasLevelLow: existingInspection?.gasLevelLow || 'N/A',
    earthingArrangementAdequate: existingInspection?.earthingArrangementAdequate || 'N/A',
    noFusesBlown: existingInspection?.noFusesBlown || 'N/A',
    noDamageToBushings: existingInspection?.noDamageToBushings || 'N/A',
    noDamageToHVConnections: existingInspection?.noDamageToHVConnections || 'N/A',
    insulatorsClean: existingInspection?.insulatorsClean || 'N/A',
    paintworkAdequate: existingInspection?.paintworkAdequate || 'N/A',
    ptFuseLinkIntact: existingInspection?.ptFuseLinkIntact || 'N/A',
    noCorrosion: existingInspection?.noCorrosion || 'N/A',
    silicaGelCondition: existingInspection?.silicaGelCondition || 'Normal',
    correctLabelling: existingInspection?.correctLabelling || 'N/A',
    remarks: existingInspection?.remarks || '',
    createdAt: existingInspection?.createdAt || new Date().toISOString(),
  });
  
  // Update a single field in the form data
  const updateField = <K extends keyof typeof formData>(field: K, value: typeof formData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Add validation here if needed
    if (!formData.inspectedBy) {
      toast.error("Please enter the inspector's name");
      return;
    }
    
    if (existingInspection) {
      // Update existing inspection
      updateVITInspection({
        ...formData,
        id: existingInspection.id
      } as VITInspectionChecklist);
    } else {
      // Create new inspection
      addVITInspection({
        ...formData,
        id: uuidv4(),
      } as VITInspectionChecklist);
    }
    
    // Notify parent component of submission
    onFormSubmit();
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium" htmlFor="inspectionDate">
              Inspection Date
            </label>
            <Input
              id="inspectionDate"
              type="date"
              value={formData.inspectionDate}
              onChange={(e) => updateField('inspectionDate', e.target.value)}
              className="mt-1"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="inspectedBy">
              Inspected By
            </label>
            <Input
              id="inspectedBy"
              type="text"
              value={formData.inspectedBy}
              onChange={(e) => updateField('inspectedBy', e.target.value)}
              className="mt-1"
              required
            />
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Safety & External Condition</h3>
          
          <YesNoSelectField
            label="Rodent/Termite Encroachment"
            value={formData.rodentTermiteEncroachment}
            onChange={(value) => updateField('rodentTermiteEncroachment', value)}
          />
          
          <YesNoSelectField
            label="Clean/Dust Free"
            value={formData.cleanDustFree}
            onChange={(value) => updateField('cleanDustFree', value)}
          />
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Control & Protection</h3>
          
          <YesNoSelectField
            label="Protection Button Enabled"
            value={formData.protectionButtonEnabled}
            onChange={(value) => updateField('protectionButtonEnabled', value)}
          />
          
          <YesNoSelectField
            label="Recloser Button Enabled"
            value={formData.recloserButtonEnabled}
            onChange={(value) => updateField('recloserButtonEnabled', value)}
          />
          
          <YesNoSelectField
            label="Ground/Earth Button Enabled"
            value={formData.groundEarthButtonEnabled}
            onChange={(value) => updateField('groundEarthButtonEnabled', value)}
          />
          
          <YesNoSelectField
            label="Remote Button Enabled"
            value={formData.remoteButtonEnabled}
            onChange={(value) => updateField('remoteButtonEnabled', value)}
          />
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Power & Operation</h3>
          
          <YesNoSelectField
            label="AC Power On"
            value={formData.acPowerOn}
            onChange={(value) => updateField('acPowerOn', value)}
          />
          
          <YesNoSelectField
            label="Battery Power Low"
            value={formData.batteryPowerLow}
            onChange={(value) => updateField('batteryPowerLow', value)}
          />
          
          <YesNoSelectField
            label="Handle Lock On"
            value={formData.handleLockOn}
            onChange={(value) => updateField('handleLockOn', value)}
          />
          
          <YesNoSelectField
            label="Gas Level Low"
            value={formData.gasLevelLow}
            onChange={(value) => updateField('gasLevelLow', value)}
          />
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Electrical & Structural Integrity</h3>
          
          <YesNoSelectField
            label="Earthing Arrangement Adequate"
            value={formData.earthingArrangementAdequate}
            onChange={(value) => updateField('earthingArrangementAdequate', value)}
          />
          
          <YesNoSelectField
            label="No Fuses Blown"
            value={formData.noFusesBlown}
            onChange={(value) => updateField('noFusesBlown', value)}
          />
          
          <YesNoSelectField
            label="No Damage to Bushings"
            value={formData.noDamageToBushings}
            onChange={(value) => updateField('noDamageToBushings', value)}
          />
          
          <YesNoSelectField
            label="No Damage to HV Connections"
            value={formData.noDamageToHVConnections}
            onChange={(value) => updateField('noDamageToHVConnections', value)}
          />
          
          <YesNoSelectField
            label="Insulators Clean"
            value={formData.insulatorsClean}
            onChange={(value) => updateField('insulatorsClean', value)}
          />
          
          <YesNoSelectField
            label="Paintwork Adequate"
            value={formData.paintworkAdequate}
            onChange={(value) => updateField('paintworkAdequate', value)}
          />
          
          <YesNoSelectField
            label="PT Fuse Link Intact"
            value={formData.ptFuseLinkIntact}
            onChange={(value) => updateField('ptFuseLinkIntact', value)}
          />
          
          <YesNoSelectField
            label="No Corrosion"
            value={formData.noCorrosion}
            onChange={(value) => updateField('noCorrosion', value)}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 mb-4">
            <label className="text-sm font-medium">Silica Gel Condition</label>
            <div className="md:col-span-2">
              <Select 
                value={formData.silicaGelCondition} 
                onValueChange={(val) => updateField('silicaGelCondition', val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {silicaGelOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <YesNoSelectField
            label="Correct Labelling"
            value={formData.correctLabelling}
            onChange={(value) => updateField('correctLabelling', value)}
          />
        </div>
        
        <Separator />
        
        <div>
          <label className="text-sm font-medium" htmlFor="remarks">
            Remarks / Additional Observations
          </label>
          <Textarea
            id="remarks"
            value={formData.remarks}
            onChange={(e) => updateField('remarks', e.target.value)}
            className="mt-1"
            rows={4}
          />
        </div>
        
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onFormCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {existingInspection ? 'Update Inspection' : 'Submit Inspection'}
          </Button>
        </div>
      </div>
    </form>
  );
}
