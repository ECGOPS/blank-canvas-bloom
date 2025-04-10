
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LoadMonitoringData } from "@/lib/asset-types";
import { formatDate } from "@/utils/calculations";
import { toast } from "@/components/ui/sonner";
import { ChevronLeft, Download, FileText, Pencil, Trash2 } from "lucide-react";
import { exportLoadMonitoringToPDF, exportLoadMonitoringToCsv } from "@/utils/pdfExport";
import { useData } from "@/contexts/DataContext";

export default function LoadMonitoringDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { loadMonitoringRecords, deleteLoadMonitoringRecord } = useData();
  const [record, setRecord] = useState<LoadMonitoringData | null>(null);
  
  useEffect(() => {
    if (id && loadMonitoringRecords) {
      const foundRecord = loadMonitoringRecords.find(r => r.id === id);
      if (foundRecord) {
        setRecord(foundRecord);
      } else {
        toast.error("Load monitoring record not found");
        navigate("/asset-management/load-monitoring-management");
      }
    }
  }, [id, loadMonitoringRecords, navigate]);
  
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this load monitoring record?")) {
      if (id) {
        deleteLoadMonitoringRecord(id);
        toast.success("Load monitoring record deleted successfully");
        navigate("/asset-management/load-monitoring-management");
      }
    }
  };
  
  const handleEdit = () => {
    navigate(`/asset-management/edit-load-monitoring/${id}`);
  };
  
  const handleExportPDF = async () => {
    if (record) {
      const fileName = await exportLoadMonitoringToPDF(record);
      toast.success(`Exported PDF: ${fileName}`);
    }
  };
  
  const handleExportCSV = () => {
    if (record) {
      exportLoadMonitoringToCsv(record);
      toast.success("Exported CSV successfully");
    }
  };
  
  if (!record) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <Card>
            <CardContent className="pt-6">
              <p>Loading record details...</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate("/asset-management/load-monitoring-management")}
            className="mb-4"
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Load Monitoring
          </Button>
          
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight">
              Load Monitoring: {record.substationNumber}
            </h1>
            
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={handleEdit}
                className="flex items-center gap-2"
              >
                <Pencil size={16} />
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={handleExportPDF}
                className="flex items-center gap-2"
              >
                <FileText size={16} />
                Export PDF
              </Button>
              <Button
                variant="outline"
                onClick={handleExportCSV}
                className="flex items-center gap-2"
              >
                <Download size={16} />
                Export CSV
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="flex items-center gap-2"
              >
                <Trash2 size={16} />
                Delete
              </Button>
            </div>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Date, time and location of the load monitoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date</p>
                <p className="text-lg">{formatDate(record.date)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Time</p>
                <p className="text-lg">{record.time}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Region</p>
                <p className="text-lg">{record.region}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">District</p>
                <p className="text-lg">{record.district}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Substation Name</p>
                <p className="text-lg">{record.substationName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Substation Number</p>
                <p className="text-lg">{record.substationNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Location</p>
                <p className="text-lg">{record.location}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rating (Amps)</p>
                <p className="text-lg">{record.rating} A</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Peak Load Status</p>
                <p className="text-lg capitalize">{record.peakLoadStatus}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Basic Calculations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rated Load:</span>
                  <span className="font-medium">{record.ratedLoad?.toFixed(2)} A</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bulk Load - Red Phase:</span>
                  <span className="font-medium">{record.redPhaseBulkLoad?.toFixed(2)} A</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bulk Load - Yellow Phase:</span>
                  <span className="font-medium">{record.yellowPhaseBulkLoad?.toFixed(2)} A</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bulk Load - Blue Phase:</span>
                  <span className="font-medium">{record.bluePhaseBulkLoad?.toFixed(2)} A</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Average Current:</span>
                  <span className="font-medium">{record.averageCurrent?.toFixed(2)} A</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Advanced Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Percentage Load on Transformer:</span>
                  <span className="font-medium">{record.percentageLoad?.toFixed(2)}%</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">10% Full Load on Neutral:</span>
                  <span className="font-medium">{record.tenPercentFullLoadNeutral?.toFixed(2)} A</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Calculated Neutral (Imbalance):</span>
                  <span className="font-medium">{record.calculatedNeutral?.toFixed(2)} A</span>
                </div>
                
                {/* Visual load indicator */}
                <div className="mt-4 pt-4">
                  <p className="text-sm font-medium mb-2">Load Status Indicator:</p>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className={`h-4 rounded-full ${
                        (record.percentageLoad || 0) < 50 
                          ? "bg-green-500" 
                          : (record.percentageLoad || 0) < 80 
                            ? "bg-yellow-500" 
                            : "bg-red-500"
                      }`}
                      style={{ width: `${Math.min(100, record.percentageLoad || 0)}%` }}
                    >
                    </div>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {record.feederLegs && record.feederLegs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Feeder Information</CardTitle>
              <CardDescription>
                Current readings for each feeder leg
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border p-2 text-left">Leg</th>
                      <th className="border p-2 text-left">Red Phase (A)</th>
                      <th className="border p-2 text-left">Yellow Phase (A)</th>
                      <th className="border p-2 text-left">Blue Phase (A)</th>
                      <th className="border p-2 text-left">Neutral (A)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {record.feederLegs.map((leg, index) => (
                      <tr key={leg.id} className={index % 2 === 0 ? "bg-white" : "bg-muted/30"}>
                        <td className="border p-2">Leg {index + 1}</td>
                        <td className="border p-2">{leg.redPhaseCurrent} A</td>
                        <td className="border p-2">{leg.yellowPhaseCurrent} A</td>
                        <td className="border p-2">{leg.bluePhaseCurrent} A</td>
                        <td className="border p-2">{leg.neutralCurrent} A</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
