
import React from 'react';
import { useData } from '@/contexts/DataContext';
import { VITInspectionChecklist, VITAsset } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/utils/calculations';
import { exportVITInspectionToCsv, exportVITAssetToPDF } from '@/utils/pdfExport';
import { Download, Edit, Trash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { YesNoStatus } from '@/components/vit/YesNoStatus';

interface InspectionRecordProps {
  inspection: VITInspectionChecklist;
  onDelete: (id: string) => void;
}

export function InspectionRecord({ inspection, onDelete }: InspectionRecordProps) {
  const { vitAssets } = useData();
  const navigate = useNavigate();
  
  const asset = vitAssets.find(a => a.id === inspection.vitAssetId);
  
  const handleExport = (format: 'csv' | 'pdf') => {
    if (format === 'csv') {
      exportVITInspectionToCsv(inspection);
      toast.success("CSV file exported successfully");
    } else {
      // For PDF export, we need both the asset and inspection
      if (asset) {
        // Export the asset with this inspection
        exportVITAssetToPDF(asset, [inspection]);
        toast.success("PDF report generated successfully");
      } else {
        toast.error("Unable to generate PDF: Asset not found");
      }
    }
  };
  
  const handleDelete = () => {
    onDelete(inspection.id);
    toast.success("Inspection deleted successfully");
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between">
          <CardTitle>Inspection Record</CardTitle>
          <Badge variant="secondary">{formatDate(inspection.inspectionDate)}</Badge>
        </div>
        <CardDescription>
          Inspection ID: {inspection.id.substring(0, 8)}...
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <p>
          <strong>Asset ID:</strong> {inspection.vitAssetId}
        </p>
        <p>
          <strong>Inspected By:</strong> {inspection.inspectedBy}
        </p>
        <YesNoStatus label="Rodent/Termite Encroachment" status={inspection.rodentTermiteEncroachment} />
        <YesNoStatus label="Clean/Dust Free" status={inspection.cleanDustFree} />
        <YesNoStatus label="Protection Button Enabled" status={inspection.protectionButtonEnabled} />
        <YesNoStatus label="Recloser Button Enabled" status={inspection.recloserButtonEnabled} />
        <YesNoStatus label="Ground/Earth Button Enabled" status={inspection.groundEarthButtonEnabled} />
        <YesNoStatus label="AC Power On" status={inspection.acPowerOn} />
        <YesNoStatus label="Battery Power Low" status={inspection.batteryPowerLow} />
        <YesNoStatus label="Handle Lock On" status={inspection.handleLockOn} />
        <YesNoStatus label="Remote Button Enabled" status={inspection.remoteButtonEnabled} />
        <YesNoStatus label="Gas Level Low" status={inspection.gasLevelLow} />
        <YesNoStatus label="Earthing Arrangement Adequate" status={inspection.earthingArrangementAdequate} />
        <YesNoStatus label="No Fuses Blown" status={inspection.noFusesBlown} />
        <YesNoStatus label="No Damage to Bushings" status={inspection.noDamageToBushings} />
        <YesNoStatus label="No Damage to HV Connections" status={inspection.noDamageToHVConnections} />
        <YesNoStatus label="Insulators Clean" status={inspection.insulatorsClean} />
        <YesNoStatus label="Paintwork Adequate" status={inspection.paintworkAdequate} />
        <YesNoStatus label="PT Fuse Link Intact" status={inspection.ptFuseLinkIntact} />
        <YesNoStatus label="No Corrosion" status={inspection.noCorrosion} />
        <p>
          <strong>Silica Gel Condition:</strong> {inspection.silicaGelCondition}
        </p>
        <YesNoStatus label="Correct Labelling" status={inspection.correctLabelling} />
        {inspection.remarks && (
          <p>
            <strong>Remarks:</strong> {inspection.remarks}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => handleExport('csv')}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
        <Button variant="ghost" size="sm" onClick={() => handleExport('pdf')}>
          <Download className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
        <Button variant="outline" size="sm" onClick={() => navigate(`/asset-management/edit-vit-inspection/${inspection.id}`)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={handleDelete}>
          <Trash className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
