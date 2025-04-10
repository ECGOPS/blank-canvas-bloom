import { useState, useEffect } from "react";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { AlertTriangle, CheckCircle2, ClipboardList, Loader2 } from "lucide-react";
import { VITInspectionChecklist, VITAsset, YesNoOption, GoodBadOption } from "@/lib/types";

interface VITInspectionFormProps {
  inspectionData?: VITInspectionChecklist;
  assetId?: string;
  onSubmit: () => void;
  onCancel: () => void;
}

export function VITInspectionForm({
  inspectionData,
  assetId,
  onSubmit,
  onCancel,
}: VITInspectionFormProps) {
  const { vitAssets, addVITInspection, updateVITInspection } = useData();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [selectedAssetId, setSelectedAssetId] = useState(assetId || inspectionData?.vitAssetId || "");
  const [inspectionDate, setInspectionDate] = useState(
    inspectionData?.inspectionDate ? new Date(inspectionData.inspectionDate).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)
  );
  const [inspectedBy, setInspectedBy] = useState(
    inspectionData?.inspectedBy || user?.name || ""
  );

  // Checklist items
  const [rodentTermiteEncroachment, setRodentTermiteEncroachment] = useState<YesNoOption | undefined>(
    inspectionData?.rodentTermiteEncroachment
  );
  const [cleanDustFree, setCleanDustFree] = useState<YesNoOption | undefined>(
    inspectionData?.cleanDustFree
  );
  const [protectionButtonEnabled, setProtectionButtonEnabled] = useState<YesNoOption | undefined>(
    inspectionData?.protectionButtonEnabled
  );
  const [recloserButtonEnabled, setRecloserButtonEnabled] = useState<YesNoOption | undefined>(
    inspectionData?.recloserButtonEnabled
  );
  const [groundEarthButtonEnabled, setGroundEarthButtonEnabled] = useState<YesNoOption | undefined>(
    inspectionData?.groundEarthButtonEnabled
  );
  const [acPowerOn, setAcPowerOn] = useState<YesNoOption | undefined>(
    inspectionData?.acPowerOn
  );
  const [batteryPowerLow, setBatteryPowerLow] = useState<YesNoOption | undefined>(
    inspectionData?.batteryPowerLow
  );
  const [handleLockOn, setHandleLockOn] = useState<YesNoOption | undefined>(
    inspectionData?.handleLockOn
  );
  const [remoteButtonEnabled, setRemoteButtonEnabled] = useState<YesNoOption | undefined>(
    inspectionData?.remoteButtonEnabled
  );
  const [gasLevelLow, setGasLevelLow] = useState<YesNoOption | undefined>(
    inspectionData?.gasLevelLow
  );
  const [earthingArrangementAdequate, setEarthingArrangementAdequate] = useState<YesNoOption | undefined>(
    inspectionData?.earthingArrangementAdequate
  );
  const [noFusesBlown, setNoFusesBlown] = useState<YesNoOption | undefined>(
    inspectionData?.noFusesBlown
  );
  const [noDamageToBushings, setNoDamageToBushings] = useState<YesNoOption | undefined>(
    inspectionData?.noDamageToBushings
  );
  const [noDamageToHVConnections, setNoDamageToHVConnections] = useState<YesNoOption | undefined>(
    inspectionData?.noDamageToHVConnections
  );
  const [insulatorsClean, setInsulatorsClean] = useState<YesNoOption | undefined>(
    inspectionData?.insulatorsClean
  );
  const [paintworkAdequate, setPaintworkAdequate] = useState<YesNoOption | undefined>(
    inspectionData?.paintworkAdequate
  );
  const [ptFuseLinkIntact, setPtFuseLinkIntact] = useState<YesNoOption | undefined>(
    inspectionData?.ptFuseLinkIntact
  );
  const [noCorrosion, setNoCorrosion] = useState<YesNoOption | undefined>(
    inspectionData?.noCorrosion
  );
  const [silicaGelCondition, setSilicaGelCondition] = useState<GoodBadOption | undefined>(
    inspectionData?.silicaGelCondition
  );
  const [correctLabelling, setCorrectLabelling] = useState<YesNoOption | undefined>(
    inspectionData?.correctLabelling
  );
  const [remarks, setRemarks] = useState(inspectionData?.remarks || "");

  // Asset details
  const [selectedAsset, setSelectedAsset] = useState<VITAsset | null>(null);

  // When assetId changes, update the selectedAsset
  useEffect(() => {
    if (selectedAssetId) {
      const asset = vitAssets.find(asset => asset.id === selectedAssetId);
      if (asset) {
        setSelectedAsset(asset);
      }
    }
  }, [selectedAssetId, vitAssets]);

  // Calculate issues count
  const calculateIssuesCount = () => {
    let count = 0;
    
    if (rodentTermiteEncroachment === "Yes") count++;
    if (cleanDustFree === "No") count++;
    if (protectionButtonEnabled === "No") count++;
    if (recloserButtonEnabled === "No") count++;
    if (groundEarthButtonEnabled === "No") count++;
    if (acPowerOn === "No") count++;
    if (batteryPowerLow === "Yes") count++;
    if (handleLockOn === "No") count++;
    if (remoteButtonEnabled === "No") count++;
    if (gasLevelLow === "Yes") count++;
    if (earthingArrangementAdequate === "No") count++;
    if (noFusesBlown === "No") count++;
    if (noDamageToBushings === "No") count++;
    if (noDamageToHVConnections === "No") count++;
    if (insulatorsClean === "No") count++;
    if (paintworkAdequate === "No") count++;
    if (ptFuseLinkIntact === "No") count++;
    if (noCorrosion === "No") count++;
    if (silicaGelCondition === "Bad") count++;
    if (correctLabelling === "No") count++;
    
    return count;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAssetId || !inspectionDate || !inspectedBy) {
      alert("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const inspectionFormData = {
        vitAssetId: selectedAssetId,
        inspectionDate: new Date(inspectionDate).toISOString(),
        inspectedBy,
        rodentTermiteEncroachment: rodentTermiteEncroachment || "No",
        cleanDustFree: cleanDustFree || "No",
        protectionButtonEnabled: protectionButtonEnabled || "No",
        recloserButtonEnabled: recloserButtonEnabled || "No",
        groundEarthButtonEnabled: groundEarthButtonEnabled || "No",
        acPowerOn: acPowerOn || "No",
        batteryPowerLow: batteryPowerLow || "No",
        handleLockOn: handleLockOn || "No",
        remoteButtonEnabled: remoteButtonEnabled || "No",
        gasLevelLow: gasLevelLow || "No",
        earthingArrangementAdequate: earthingArrangementAdequate || "No",
        noFusesBlown: noFusesBlown || "No",
        noDamageToBushings: noDamageToBushings || "No",
        noDamageToHVConnections: noDamageToHVConnections || "No",
        insulatorsClean: insulatorsClean || "No",
        paintworkAdequate: paintworkAdequate || "No",
        ptFuseLinkIntact: ptFuseLinkIntact || "No",
        noCorrosion: noCorrosion || "No",
        silicaGelCondition: silicaGelCondition || "Good",
        correctLabelling: correctLabelling || "No",
        remarks,
        createdBy: user?.id || "",
        createdAt: new Date().toISOString()
      };
      
      if (inspectionData?.id) {
        // Update existing inspection
        updateVITInspection(inspectionData.id, inspectionFormData);
      } else {
        // Add new inspection
        addVITInspection(inspectionFormData);
      }
      
      onSubmit();
    } catch (error) {
      console.error("Error submitting inspection:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const issuesCount = calculateIssuesCount();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          {inspectionData ? "Edit VIT Inspection" : "New VIT Inspection"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assetSelect">VIT Asset *</Label>
                <Select
                  value={selectedAssetId}
                  onValueChange={setSelectedAssetId}
                  disabled={!!assetId}
                  required
                >
                  <SelectTrigger id="assetSelect">
                    <SelectValue placeholder="Select VIT asset" />
                  </SelectTrigger>
                  <SelectContent>
                    {vitAssets.map((asset) => (
                      <SelectItem key={asset.id} value={asset.id || "unknown-asset"}>
                        {asset.serialNumber} - {asset.typeOfUnit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="inspectionDate">Inspection Date & Time *</Label>
                <Input
                  id="inspectionDate"
                  type="datetime-local"
                  value={inspectionDate}
                  onChange={(e) => setInspectionDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="inspectedBy">Inspected By *</Label>
              <Input
                id="inspectedBy"
                value={inspectedBy}
                onChange={(e) => setInspectedBy(e.target.value)}
                placeholder="Enter name of inspector"
                required
              />
            </div>

            {selectedAsset && (
              <div className="rounded-md bg-muted/50 p-4 space-y-2 text-sm">
                <div className="font-medium">Asset Details</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div>
                    <span className="font-medium">Type:</span> {selectedAsset.typeOfUnit}
                  </div>
                  <div>
                    <span className="font-medium">Voltage:</span> {selectedAsset.voltageLevel}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span> {selectedAsset.status}
                  </div>
                  <div className="md:col-span-3">
                    <span className="font-medium">Location:</span> {selectedAsset.location}
                  </div>
                </div>
              </div>
            )}

            {issuesCount > 0 && (
              <Alert variant="destructive" className="bg-red-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {issuesCount} {issuesCount === 1 ? "issue" : "issues"} detected with this VIT asset
                </AlertDescription>
              </Alert>
            )}

            <Separator className="my-4" />
            
            <Accordion type="single" collapsible className="w-full" defaultValue="section-1">
              <AccordionItem value="section-1">
                <AccordionTrigger>Cubicle and Protection</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Rodent/termite encroachments of cubicle</Label>
                    <RadioGroup
                      value={rodentTermiteEncroachment}
                      onValueChange={(val) => setRodentTermiteEncroachment(val as YesNoOption)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Yes" id="rodent-yes" />
                        <Label htmlFor="rodent-yes" className="text-red-500 font-medium">Yes (Issue)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="No" id="rodent-no" />
                        <Label htmlFor="rodent-no" className="text-green-500 font-medium">No (OK)</Label>
                      </div>
                    </RadioGroup>
                    {rodentTermiteEncroachment === undefined && (
                      <p className="text-sm text-muted-foreground mt-1">Please select an option</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Clean and dust free compartments</Label>
                    <RadioGroup
                      value={cleanDustFree}
                      onValueChange={(val) => setCleanDustFree(val as YesNoOption)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Yes" id="clean-yes" />
                        <Label htmlFor="clean-yes" className="text-green-500 font-medium">Yes (OK)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="No" id="clean-no" />
                        <Label htmlFor="clean-no" className="text-red-500 font-medium">No (Issue)</Label>
                      </div>
                    </RadioGroup>
                    {cleanDustFree === undefined && (
                      <p className="text-sm text-muted-foreground mt-1">Please select an option</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Is protection button enabled</Label>
                    <RadioGroup
                      value={protectionButtonEnabled}
                      onValueChange={(val) => setProtectionButtonEnabled(val as YesNoOption)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Yes" id="protection-yes" />
                        <Label htmlFor="protection-yes" className="text-green-500 font-medium">Yes (OK)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="No" id="protection-no" />
                        <Label htmlFor="protection-no" className="text-red-500 font-medium">No (Issue)</Label>
                      </div>
                    </RadioGroup>
                    {protectionButtonEnabled === undefined && (
                      <p className="text-sm text-muted-foreground mt-1">Please select an option</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Is recloser button enabled</Label>
                    <RadioGroup
                      value={recloserButtonEnabled}
                      onValueChange={(val) => setRecloserButtonEnabled(val as YesNoOption)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Yes" id="recloser-yes" />
                        <Label htmlFor="recloser-yes" className="text-green-500 font-medium">Yes (OK)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="No" id="recloser-no" />
                        <Label htmlFor="recloser-no" className="text-red-500 font-medium">No (Issue)</Label>
                      </div>
                    </RadioGroup>
                    {recloserButtonEnabled === undefined && (
                      <p className="text-sm text-muted-foreground mt-1">Please select an option</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Is GROUND/EARTH button enabled</Label>
                    <RadioGroup
                      value={groundEarthButtonEnabled}
                      onValueChange={(val) => setGroundEarthButtonEnabled(val as YesNoOption)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Yes" id="ground-yes" />
                        <Label htmlFor="ground-yes" className="text-green-500 font-medium">Yes (OK)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="No" id="ground-no" />
                        <Label htmlFor="ground-no" className="text-red-500 font-medium">No (Issue)</Label>
                      </div>
                    </RadioGroup>
                    {groundEarthButtonEnabled === undefined && (
                      <p className="text-sm text-muted-foreground mt-1">Please select an option</p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="section-2">
                <AccordionTrigger>Power and Controls</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Is AC power ON</Label>
                    <RadioGroup
                      value={acPowerOn}
                      onValueChange={(val) => setAcPowerOn(val as YesNoOption)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Yes" id="acpower-yes" />
                        <Label htmlFor="acpower-yes" className="text-green-500 font-medium">Yes (OK)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="No" id="acpower-no" />
                        <Label htmlFor="acpower-no" className="text-red-500 font-medium">No (Issue)</Label>
                      </div>
                    </RadioGroup>
                    {acPowerOn === undefined && (
                      <p className="text-sm text-muted-foreground mt-1">Please select an option</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Is Battery Power Low</Label>
                    <RadioGroup
                      value={batteryPowerLow}
                      onValueChange={(val) => setBatteryPowerLow(val as YesNoOption)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Yes" id="battery-yes" />
                        <Label htmlFor="battery-yes" className="text-red-500 font-medium">Yes (Issue)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="No" id="battery-no" />
                        <Label htmlFor="battery-no" className="text-green-500 font-medium">No (OK)</Label>
                      </div>
                    </RadioGroup>
                    {batteryPowerLow === undefined && (
                      <p className="text-sm text-muted-foreground mt-1">Please select an option</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Is Handle Lock ON</Label>
                    <RadioGroup
                      value={handleLockOn}
                      onValueChange={(val) => setHandleLockOn(val as YesNoOption)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Yes" id="lock-yes" />
                        <Label htmlFor="lock-yes" className="text-green-500 font-medium">Yes (OK)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="No" id="lock-no" />
                        <Label htmlFor="lock-no" className="text-red-500 font-medium">No (Issue)</Label>
                      </div>
                    </RadioGroup>
                    {handleLockOn === undefined && (
                      <p className="text-sm text-muted-foreground mt-1">Please select an option</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Is remote button enabled</Label>
                    <RadioGroup
                      value={remoteButtonEnabled}
                      onValueChange={(val) => setRemoteButtonEnabled(val as YesNoOption)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Yes" id="remote-yes" />
                        <Label htmlFor="remote-yes" className="text-green-500 font-medium">Yes (OK)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="No" id="remote-no" />
                        <Label htmlFor="remote-no" className="text-red-500 font-medium">No (Issue)</Label>
                      </div>
                    </RadioGroup>
                    {remoteButtonEnabled === undefined && (
                      <p className="text-sm text-muted-foreground mt-1">Please select an option</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Is Gas Level Low</Label>
                    <RadioGroup
                      value={gasLevelLow}
                      onValueChange={(val) => setGasLevelLow(val as YesNoOption)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Yes" id="gas-yes" />
                        <Label htmlFor="gas-yes" className="text-red-500 font-medium">Yes (Issue)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="No" id="gas-no" />
                        <Label htmlFor="gas-no" className="text-green-500 font-medium">No (OK)</Label>
                      </div>
                    </RadioGroup>
                    {gasLevelLow === undefined && (
                      <p className="text-sm text-muted-foreground mt-1">Please select an option</p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="section-3">
                <AccordionTrigger>Physical Condition</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Earthing arrangement adequate</Label>
                    <RadioGroup
                      value={earthingArrangementAdequate}
                      onValueChange={(val) => setEarthingArrangementAdequate(val as YesNoOption)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Yes" id="earthing-yes" />
                        <Label htmlFor="earthing-yes" className="text-green-500 font-medium">Yes (OK)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="No" id="earthing-no" />
                        <Label htmlFor="earthing-no" className="text-red-500 font-medium">No (Issue)</Label>
                      </div>
                    </RadioGroup>
                    {earthingArrangementAdequate === undefined && (
                      <p className="text-sm text-muted-foreground mt-1">Please select an option</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>No fuses blown in control cubicle</Label>
                    <RadioGroup
                      value={noFusesBlown}
                      onValueChange={(val) => setNoFusesBlown(val as YesNoOption)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Yes" id="fuses-yes" />
                        <Label htmlFor="fuses-yes" className="text-green-500 font-medium">Yes (OK)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="No" id="fuses-no" />
                        <Label htmlFor="fuses-no" className="text-red-500 font-medium">No (Issue)</Label>
                      </div>
                    </RadioGroup>
                    {noFusesBlown === undefined && (
                      <p className="text-sm text-muted-foreground mt-1">Please select an option</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>No damage to bushings or insulators</Label>
                    <RadioGroup
                      value={noDamageToBushings}
                      onValueChange={(val) => setNoDamageToBushings(val as YesNoOption)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Yes" id="bushings-yes" />
                        <Label htmlFor="bushings-yes" className="text-green-500 font-medium">Yes (OK)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="No" id="bushings-no" />
                        <Label htmlFor="bushings-no" className="text-red-500 font-medium">No (Issue)</Label>
                      </div>
                    </RadioGroup>
                    {noDamageToBushings === undefined && (
                      <p className="text-sm text-muted-foreground mt-1">Please select an option</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>No damage to H.V. connections</Label>
                    <RadioGroup
                      value={noDamageToHVConnections}
                      onValueChange={(val) => setNoDamageToHVConnections(val as YesNoOption)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Yes" id="hvconn-yes" />
                        <Label htmlFor="hvconn-yes" className="text-green-500 font-medium">Yes (OK)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="No" id="hvconn-no" />
                        <Label htmlFor="hvconn-no" className="text-red-500 font-medium">No (Issue)</Label>
                      </div>
                    </RadioGroup>
                    {noDamageToHVConnections === undefined && (
                      <p className="text-sm text-muted-foreground mt-1">Please select an option</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Insulators clean</Label>
                    <RadioGroup
                      value={insulatorsClean}
                      onValueChange={(val) => setInsulatorsClean(val as YesNoOption)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Yes" id="insulators-yes" />
                        <Label htmlFor="insulators-yes" className="text-green-500 font-medium">Yes (OK)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="No" id="insulators-no" />
                        <Label htmlFor="insulators-no" className="text-red-500 font-medium">No (Issue)</Label>
                      </div>
                    </RadioGroup>
                    {insulatorsClean === undefined && (
                      <p className="text-sm text-muted-foreground mt-1">Please select an option</p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="section-4">
                <AccordionTrigger>Maintenance Status</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Paintwork adequate</Label>
                    <RadioGroup
                      value={paintworkAdequate}
                      onValueChange={(val) => setPaintworkAdequate(val as YesNoOption)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Yes" id="paint-yes" />
                        <Label htmlFor="paint-yes" className="text-green-500 font-medium">Yes (OK)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="No" id="paint-no" />
                        <Label htmlFor="paint-no" className="text-red-500 font-medium">No (Issue)</Label>
                      </div>
                    </RadioGroup>
                    {paintworkAdequate === undefined && (
                      <p className="text-sm text-muted-foreground mt-1">Please select an option</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>PT fuse link intact</Label>
                    <RadioGroup
                      value={ptFuseLinkIntact}
                      onValueChange={(val) => setPtFuseLinkIntact(val as YesNoOption)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Yes" id="ptfuse-yes" />
                        <Label htmlFor="ptfuse-yes" className="text-green-500 font-medium">Yes (OK)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="No" id="ptfuse-no" />
                        <Label htmlFor="ptfuse-no" className="text-red-500 font-medium">No (Issue)</Label>
                      </div>
                    </RadioGroup>
                    {ptFuseLinkIntact === undefined && (
                      <p className="text-sm text-muted-foreground mt-1">Please select an option</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>No corrosion on equipment</Label>
                    <RadioGroup
                      value={noCorrosion}
                      onValueChange={(val) => setNoCorrosion(val as YesNoOption)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Yes" id="corrosion-yes" />
                        <Label htmlFor="corrosion-yes" className="text-green-500 font-medium">Yes (OK)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="No" id="corrosion-no" />
                        <Label htmlFor="corrosion-no" className="text-red-500 font-medium">No (Issue)</Label>
                      </div>
                    </RadioGroup>
                    {noCorrosion === undefined && (
                      <p className="text-sm text-muted-foreground mt-1">Please select an option</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Condition of silica gel</Label>
                    <RadioGroup
                      value={silicaGelCondition}
                      onValueChange={(val) => setSilicaGelCondition(val as GoodBadOption)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Good" id="silica-good" />
                        <Label htmlFor="silica-good" className="text-green-500 font-medium">Good</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Bad" id="silica-bad" />
                        <Label htmlFor="silica-bad" className="text-red-500 font-medium">Bad</Label>
                      </div>
                    </RadioGroup>
                    {silicaGelCondition === undefined && (
                      <p className="text-sm text-muted-foreground mt-1">Please select an option</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Check for correct labelling and warning notices</Label>
                    <RadioGroup
                      value={correctLabelling}
                      onValueChange={(val) => setCorrectLabelling(val as YesNoOption)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Yes" id="label-yes" />
                        <Label htmlFor="label-yes" className="text-green-500 font-medium">Yes (OK)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="No" id="label-no" />
                        <Label htmlFor="label-no" className="text-red-500 font-medium">No (Issue)</Label>
                      </div>
                    </RadioGroup>
                    {correctLabelling === undefined && (
                      <p className="text-sm text-muted-foreground mt-1">Please select an option</p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Separator className="my-4" />

            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter any additional observations or notes"
                rows={4}
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {inspectionData ? "Updating..." : "Submitting..."}
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {inspectionData ? "Update Inspection" : "Submit Inspection"}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
