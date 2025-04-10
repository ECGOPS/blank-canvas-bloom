import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { ChevronLeft } from "lucide-react";
import { VITInspectionChecklist } from "@/lib/types";
import { VITInspectionForm } from "@/components/vit/VITInspectionForm";

export default function EditInspectionPage() {
  const { id: inspectionId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { vitInspections, updateVITInspection, vitAssets, regions, districts } = useData();
  
  const [inspection, setInspection] = useState<VITInspectionChecklist | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (inspectionId) {
      setLoading(true);
      const foundInspection = vitInspections.find(i => i.id === inspectionId);
      if (foundInspection) {
        setInspection(foundInspection);
        setLoading(false);
      } else {
        toast.error("Inspection not found");
        navigate("/asset-management/vit-inspection-management");
      }
    }
  }, [inspectionId, vitInspections, navigate]);

  const handleFormSubmit = () => {
    toast.success("Inspection updated successfully");
    navigate(`/asset-management/vit-inspection-management`);
  };

  const handleFormCancel = () => {
    navigate(`/asset-management/vit-inspection-management`);
  };

  if (loading || !inspection) {
    return (
      <Layout>
        <div className="container py-8">
          <p>Loading inspection data...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/asset-management/vit-inspection-management")}
          className="mb-4"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Inspections
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Edit VIT Inspection</h1>
          <p className="text-muted-foreground mt-1">
            Update the inspection details
          </p>
        </div>

        <div className="bg-white rounded-lg border shadow-sm p-6">
          {inspection && (
            <VITInspectionForm
              assetId={inspection.vitAssetId || ""}
              inspectionData={inspection}
              onFormSubmit={handleFormSubmit}
              onFormCancel={handleFormCancel}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}
