
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useData } from "@/contexts/DataContext";
import { ChevronLeft, Download, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { format } from "date-fns";
import { exportLoadMonitoringToPDF } from "@/utils/pdfExport";

export default function LoadMonitoringDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { loadMonitoringData, regions, districts, deleteLoadMonitoring } = useData();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const foundData = loadMonitoringData.find(d => d.id === id);
      if (foundData) {
        setData(foundData);
        setLoading(false);
      } else {
        toast.error("Load monitoring record not found");
        navigate("/asset-management/load-monitoring-management");
      }
    }
  }, [id, loadMonitoringData, navigate]);

  const getRegionName = (regionId: string) => {
    const region = regions.find(r => r.id === regionId);
    return region ? region.name : "Unknown";
  };

  const getDistrictName = (districtId: string) => {
    const district = districts.find(d => d.id === districtId);
    return district ? district.name : "Unknown";
  };

  const handleEdit = () => {
    navigate(`/asset-management/edit-load-monitoring/${id}`);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this load monitoring record?")) {
      deleteLoadMonitoring(id!);
      toast.success("Load monitoring record deleted successfully");
      navigate("/asset-management/load-monitoring-management");
    }
  };

  const handleExportPdf = () => {
    if (data) {
      exportLoadMonitoringToPDF(data);
      toast.success("PDF export started");
    }
  };

  if (loading || !data) {
    return (
      <Layout>
        <div className="container py-8">
          <p className="text-center">Loading load monitoring details...</p>
        </div>
      </Layout>
    );
  }

  // Format date for display
  const formattedDate = format(new Date(data.date), 'MMMM d, yyyy');
  
  // Calculate load percentage class
  let loadClass = "text-green-600";
  if (data.percentageLoad > 90) {
    loadClass = "text-red-600";
  } else if (data.percentageLoad > 75) {
    loadClass = "text-yellow-600";
  }

  return (
    <Layout>
      <div className="container py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/asset-management/load-monitoring-management")} 
          className="mb-4"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Load Monitoring
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Load Monitoring Details</h1>
            <p className="text-muted-foreground mt-1">
              View detailed transformer load metrics
            </p>
          </div>
          
          <div className="flex space-x-3 mt-4 md:mt-0">
            <Button 
              variant="outline"
              onClick={handleExportPdf}
            >
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button 
              variant="secondary"
              onClick={handleEdit}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date</p>
                  <p className="text-base">{formattedDate}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Time</p>
                  <p className="text-base">{data.time}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Region</p>
                  <p className="text-base">{getRegionName(data.region)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">District</p>
                  <p className="text-base">{getDistrictName(data.district)}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Created By</p>
                <p className="text-base">{data.createdBy || "Unknown"}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Created At</p>
                <p className="text-base">{data.createdAt ? format(new Date(data.createdAt), 'PPP p') : "Unknown"}</p>
              </div>
            </CardContent>
          </Card>
          
          {/* Substation Information */}
          <Card>
            <CardHeader>
              <CardTitle>Substation Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Substation Name</p>
                <p className="text-base">{data.substationName}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Substation Number</p>
                <p className="text-base">{data.substationNumber}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Location</p>
                <p className="text-base">{data.location}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Rating</p>
                  <p className="text-base">{data.rating} A</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Peak Load Status</p>
                  <p className="text-base capitalize">{data.peakLoadStatus}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Load Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Load Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center justify-center py-6">
                <span className={`text-4xl font-bold ${loadClass}`}>
                  {data.percentageLoad.toFixed(1)}%
                </span>
                <span className="text-sm text-muted-foreground mt-1">Transformer Load</span>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-sm font-medium text-red-500">{data.redPhaseBulkLoad.toFixed(1)} A</p>
                  <p className="text-xs text-muted-foreground">Red Phase</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-yellow-500">{data.yellowPhaseBulkLoad.toFixed(1)} A</p>
                  <p className="text-xs text-muted-foreground">Yellow Phase</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-500">{data.bluePhaseBulkLoad.toFixed(1)} A</p>
                  <p className="text-xs text-muted-foreground">Blue Phase</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Current</p>
                <p className="text-base">{data.averageCurrent.toFixed(2)} A</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Calculated Neutral</p>
                <p className="text-base">{data.calculatedNeutral.toFixed(2)} A</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Feeder Legs */}
        {data.feederLegs && data.feederLegs.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Feeder Legs</CardTitle>
              <CardDescription>
                Current readings for each feeder leg
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.feederLegs.map((leg, index) => (
                  <div key={leg.id} className="border rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-3">Leg {index + 1}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Red Phase:</span>
                        <span className="font-medium">{leg.redPhaseCurrent.toFixed(2)} A</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Yellow Phase:</span>
                        <span className="font-medium">{leg.yellowPhaseCurrent.toFixed(2)} A</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Blue Phase:</span>
                        <span className="font-medium">{leg.bluePhaseCurrent.toFixed(2)} A</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Neutral:</span>
                        <span className="font-medium">{leg.neutralCurrent.toFixed(2)} A</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Detailed Calculations */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Calculations</CardTitle>
            <CardDescription>
              Complete metrics and calculations for this load monitoring record
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rated Load:</span>
                  <span className="font-medium">{data.ratedLoad.toFixed(2)} A</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bulk Load - Red Phase:</span>
                  <span className="font-medium">{data.redPhaseBulkLoad.toFixed(2)} A</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bulk Load - Yellow Phase:</span>
                  <span className="font-medium">{data.yellowPhaseBulkLoad.toFixed(2)} A</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bulk Load - Blue Phase:</span>
                  <span className="font-medium">{data.bluePhaseBulkLoad.toFixed(2)} A</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Average Current:</span>
                  <span className="font-medium">{data.averageCurrent.toFixed(2)} A</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Percentage Load:</span>
                  <span className={`font-medium ${loadClass}`}>{data.percentageLoad.toFixed(2)}%</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">10% Full Load on Neutral:</span>
                  <span className="font-medium">{data.tenPercentFullLoadNeutral.toFixed(2)} A</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Calculated Neutral (Imbalance):</span>
                  <span className="font-medium">{data.calculatedNeutral.toFixed(2)} A</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Load Status Assessment:</span>
                  <span className={`font-medium ${loadClass}`}>
                    {data.percentageLoad <= 75 ? "Normal" : data.percentageLoad <= 90 ? "Warning" : "Critical"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
