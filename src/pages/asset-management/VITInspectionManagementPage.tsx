import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VITAssetForm } from "@/components/vit/VITAssetForm";
import { VITInspectionForm } from "@/components/vit/VITInspectionForm";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { VITInspectionChecklist } from "@/lib/types";
import { formatDate } from "@/utils/calculations";
import { toast } from "@/components/ui/sonner";
import { InspectionRecord } from "@/components/vit/InspectionRecord";

export default function VITInspectionManagementPage() {
  const { vitInspections, deleteVITInspection } = useData();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isInspectionFormOpen, setIsInspectionFormOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<VITInspectionChecklist | null>(null);

  const filteredInspections = vitInspections?.filter(inspection =>
    inspection.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inspection.vitAssetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inspection.inspectedBy?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleEdit = (inspection: VITInspectionChecklist) => {
    setSelectedInspection(inspection);
    setIsInspectionFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this inspection record?")) {
      deleteVITInspection(id);
      toast.success("Inspection record deleted successfully");
    }
  };

  const handleInspectionFormClose = () => {
    setIsInspectionFormOpen(false);
    setSelectedInspection(null);
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">VIT Inspection Management</h1>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Search Inspections</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search by inspection ID, asset ID, or inspector name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6">
          {filteredInspections.length > 0 ? (
            filteredInspections.map((inspection) => (
              <InspectionRecord
                key={inspection.id}
                inspection={inspection}
                onDelete={handleDelete}
                onEdit={() => handleEdit(inspection)}
              />
            ))
          ) : (
            <div className="text-center py-8">
              {searchTerm ? (
                <p className="text-muted-foreground">No inspections found matching your search.</p>
              ) : (
                <p className="text-muted-foreground">No inspections have been created yet.</p>
              )}
            </div>
          )}
        </div>

        {/* Edit Inspection Form Sheet */}
        <Sheet open={isInspectionFormOpen} onOpenChange={setIsInspectionFormOpen}>
          <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Edit Inspection</SheetTitle>
              <SheetDescription>
                Update the details of this inspection record.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              {selectedInspection && (
                <VITInspectionForm
                  assetId={selectedInspection.vitAssetId}
                  inspectionData={selectedInspection}
                  onFormSubmit={handleInspectionFormClose}
                  onFormCancel={handleInspectionFormClose}
                />
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </Layout>
  );
}
