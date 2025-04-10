
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { AssetInfoCard } from "@/components/vit/AssetInfoCard";
import { VITInspectionForm } from "@/components/vit/VITInspectionForm";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";

export default function VITInspectionPage() {
  const { assetId } = useParams<{ assetId: string }>();
  const navigate = useNavigate();
  const { vitAssets } = useData();
  const [asset, setAsset] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (assetId) {
      // Find the asset by ID
      const foundAsset = vitAssets.find(a => a.id === assetId);
      if (foundAsset) {
        setAsset(foundAsset);
        setIsLoading(false);
      } else {
        toast.error("Asset not found");
        navigate("/asset-management/vit-inspection");
      }
    }
  }, [assetId, vitAssets, navigate]);
  
  const handleSubmit = () => {
    toast.success("Inspection saved successfully");
    navigate("/asset-management/vit-inspection-management");
  };
  
  const handleCancel = () => {
    navigate("/asset-management/vit-inspection");
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <p>Loading asset data...</p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/asset-management/vit-inspection")}
          className="mb-4"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to VIT Inspection
        </Button>
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">VIT Inspection</h1>
          <p className="text-muted-foreground mt-1">
            Create a new inspection record for the selected VIT asset
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <AssetInfoCard asset={asset} />
          </div>
          
          <div className="lg:col-span-2 bg-white rounded-lg border shadow-sm p-6">
            <VITInspectionForm
              assetId={asset.id}
              onFormSubmit={handleSubmit}
              onFormCancel={handleCancel}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}
