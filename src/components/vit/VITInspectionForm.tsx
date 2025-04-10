import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { VITInspectionChecklist, YesNoOption, GoodBadOption } from '@/lib/types';

export interface VITInspectionFormProps {
  assetId: string;
  inspectionData?: VITInspectionChecklist;
  onFormSubmit: () => void;
  onFormCancel: () => void;
}

export function VITInspectionForm({ assetId, inspectionData, onFormSubmit, onFormCancel }: VITInspectionFormProps) {
  const { addVITInspection, updateVITInspection, vitAssets } = useData();
  const isEditMode = !!inspectionData;
  
  // Default user name for inspection
  const defaultInspectorName = "Inspector";

  // Default empty form values
  const defaultValues = {
    inspectionDate: new Date().toISOString().split('T')[0],
    inspectedBy: defaultInspectorName,
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
    silicaGelCondition: 'Good' as GoodBadOption,
    correctLabelling: 'Yes' as YesNoOption,
    remarks: '',
  };

  // If in edit mode, use the inspection data as form values
  const formValues = isEditMode
    ? { ...inspectionData, inspectionDate: new Date(inspectionData.inspectionDate).toISOString().split('T')[0] }
    : { ...defaultValues, vitAssetId: assetId };

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: formValues
  });

  const onSubmit = (data: any) => {
    try {
      if (isEditMode && inspectionData) {
        // Update existing inspection
        const updatedInspection: VITInspectionChecklist = {
          ...inspectionData,
          ...data,
          updatedAt: new Date().toISOString()
        };
        updateVITInspection(updatedInspection);
        toast.success("Inspection updated successfully");
      } else {
        // Create new inspection
        const newInspection: VITInspectionChecklist = {
          id: uuidv4(),
          vitAssetId: assetId,
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        addVITInspection(newInspection);
        toast.success("Inspection created successfully");
      }
      
      onFormSubmit();
    } catch (error) {
      console.error("Error saving inspection:", error);
      toast.error("Error saving inspection. Please try again.");
    }
  };

  const yesNoOptions = [
    { value: "Yes", label: "Yes" },
    { value: "No", label: "No" },
    { value: "N/A", label: "N/A" }
  ];

  const silicaGelOptions = [
    { value: "good", label: "Good" },
    { value: "bad", label: "Bad" },
    { value: "Normal", label: "Normal" }
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Inspection Date
          </label>
          <Input
            type="date"
            {...register("inspectionDate", { required: "Date is required" })}
            className={errors.inspectionDate ? "border-red-500" : ""}
          />
          {errors.inspectionDate && (
            <p className="text-red-500 text-xs mt-1">{errors.inspectionDate.message?.toString()}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Inspected By
          </label>
          <Input
            {...register("inspectedBy", { required: "Inspector name is required" })}
            placeholder="Enter inspector name"
            className={errors.inspectedBy ? "border-red-500" : ""}
          />
          {errors.inspectedBy && (
            <p className="text-red-500 text-xs mt-1">{errors.inspectedBy.message?.toString()}</p>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-medium">Inspection Checklist</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              label="Rodent/Termite Encroachment"
              name="rodentTermiteEncroachment"
              register={register}
              options={yesNoOptions}
              defaultValue={formValues.rodentTermiteEncroachment}
              error={errors.rodentTermiteEncroachment}
            />
            
            <SelectField
              label="Clean/Dust Free"
              name="cleanDustFree"
              register={register}
              options={yesNoOptions}
              defaultValue={formValues.cleanDustFree}
              error={errors.cleanDustFree}
            />
            
            <SelectField
              label="Protection Button Enabled"
              name="protectionButtonEnabled"
              register={register}
              options={yesNoOptions}
              defaultValue={formValues.protectionButtonEnabled}
              error={errors.protectionButtonEnabled}
            />
            
            <SelectField
              label="Recloser Button Enabled"
              name="recloserButtonEnabled"
              register={register}
              options={yesNoOptions}
              defaultValue={formValues.recloserButtonEnabled}
              error={errors.recloserButtonEnabled}
            />
            
            <SelectField
              label="Ground/Earth Button Enabled"
              name="groundEarthButtonEnabled"
              register={register}
              options={yesNoOptions}
              defaultValue={formValues.groundEarthButtonEnabled}
              error={errors.groundEarthButtonEnabled}
            />
            
            <SelectField
              label="AC Power On"
              name="acPowerOn"
              register={register}
              options={yesNoOptions}
              defaultValue={formValues.acPowerOn}
              error={errors.acPowerOn}
            />
            
            <SelectField
              label="Battery Power Low"
              name="batteryPowerLow"
              register={register}
              options={yesNoOptions}
              defaultValue={formValues.batteryPowerLow}
              error={errors.batteryPowerLow}
            />
            
            <SelectField
              label="Handle Lock On"
              name="handleLockOn"
              register={register}
              options={yesNoOptions}
              defaultValue={formValues.handleLockOn}
              error={errors.handleLockOn}
            />
            
            <SelectField
              label="Remote Button Enabled"
              name="remoteButtonEnabled"
              register={register}
              options={yesNoOptions}
              defaultValue={formValues.remoteButtonEnabled}
              error={errors.remoteButtonEnabled}
            />
            
            <SelectField
              label="Gas Level Low"
              name="gasLevelLow"
              register={register}
              options={yesNoOptions}
              defaultValue={formValues.gasLevelLow}
              error={errors.gasLevelLow}
            />
            
            <SelectField
              label="Earthing Arrangement Adequate"
              name="earthingArrangementAdequate"
              register={register}
              options={yesNoOptions}
              defaultValue={formValues.earthingArrangementAdequate}
              error={errors.earthingArrangementAdequate}
            />
            
            <SelectField
              label="No Fuses Blown"
              name="noFusesBlown"
              register={register}
              options={yesNoOptions}
              defaultValue={formValues.noFusesBlown}
              error={errors.noFusesBlown}
            />
            
            <SelectField
              label="No Damage to Bushings"
              name="noDamageToBushings"
              register={register}
              options={yesNoOptions}
              defaultValue={formValues.noDamageToBushings}
              error={errors.noDamageToBushings}
            />
            
            <SelectField
              label="No Damage to HV Connections"
              name="noDamageToHVConnections"
              register={register}
              options={yesNoOptions}
              defaultValue={formValues.noDamageToHVConnections}
              error={errors.noDamageToHVConnections}
            />
            
            <SelectField
              label="Insulators Clean"
              name="insulatorsClean"
              register={register}
              options={yesNoOptions}
              defaultValue={formValues.insulatorsClean}
              error={errors.insulatorsClean}
            />
            
            <SelectField
              label="Paintwork Adequate"
              name="paintworkAdequate"
              register={register}
              options={yesNoOptions}
              defaultValue={formValues.paintworkAdequate}
              error={errors.paintworkAdequate}
            />
            
            <SelectField
              label="PT Fuse Link Intact"
              name="ptFuseLinkIntact"
              register={register}
              options={yesNoOptions}
              defaultValue={formValues.ptFuseLinkIntact}
              error={errors.ptFuseLinkIntact}
            />
            
            <SelectField
              label="No Corrosion"
              name="noCorrosion"
              register={register}
              options={yesNoOptions}
              defaultValue={formValues.noCorrosion}
              error={errors.noCorrosion}
            />
            
            <SelectField
              label="Silica Gel Condition"
              name="silicaGelCondition"
              register={register}
              options={silicaGelOptions}
              defaultValue={formValues.silicaGelCondition}
              error={errors.silicaGelCondition}
            />
            
            <SelectField
              label="Correct Labelling"
              name="correctLabelling"
              register={register}
              options={yesNoOptions}
              defaultValue={formValues.correctLabelling}
              error={errors.correctLabelling}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Remarks/Observations
          </label>
          <Textarea
            {...register("remarks")}
            placeholder="Enter any additional remarks or observations"
            className="h-32"
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
          {isEditMode ? "Update Inspection" : "Submit Inspection"}
        </Button>
      </div>
    </form>
  );
}

interface SelectFieldProps {
  label: string;
  name: string;
  register: any;
  options: { value: string; label: string }[];
  defaultValue: string;
  error?: any;
}

function SelectField({ label, name, register, options, defaultValue, error }: SelectFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">
        {label}
      </label>
      <select
        {...register(name)}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        defaultValue={defaultValue}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-red-500 text-xs mt-1">{error.message?.toString()}</p>
      )}
    </div>
  );
}
