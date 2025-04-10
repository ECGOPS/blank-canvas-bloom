
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { LoadMonitoringData } from "@/lib/asset-types";
import { formatDate } from "@/utils/calculations";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Export, FileText, MoreVertical, PlusCircle, Search, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { exportLoadMonitoringToPDF, exportLoadMonitoringToCsv } from "@/utils/pdfExport";

export default function LoadMonitoringManagementPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loadMonitoringRecords, deleteLoadMonitoringRecord } = useData();
  const [searchTerm, setSearchTerm] = useState("");

  // Filter records based on search term
  const filteredRecords = loadMonitoringRecords?.filter(record => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      record.substationName?.toLowerCase().includes(searchLower) ||
      record.substationNumber?.toLowerCase().includes(searchLower) ||
      record.region?.toLowerCase().includes(searchLower) ||
      record.district?.toLowerCase().includes(searchLower) ||
      record.location?.toLowerCase().includes(searchLower)
    );
  }) || [];

  // Handle viewing details of a record
  const handleViewDetails = (id: string) => {
    navigate(`/asset-management/load-monitoring-details/${id}`);
  };
  
  // Handle deleting a record
  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this load monitoring record?")) {
      deleteLoadMonitoringRecord(id);
      toast.success("Load monitoring record deleted successfully");
    }
  };
  
  // Handle exporting a record to PDF
  const handleExportPDF = async (record: LoadMonitoringData) => {
    const fileName = await exportLoadMonitoringToPDF(record);
    toast.success(`Exported PDF: ${fileName}`);
  };
  
  // Handle exporting a record to CSV
  const handleExportCSV = (record: LoadMonitoringData) => {
    exportLoadMonitoringToCsv(record);
    toast.success("Exported CSV successfully");
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Load Monitoring Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage and analyze transformer load monitoring records
            </p>
          </div>
          
          <Button onClick={() => navigate("/asset-management/load-monitoring")}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Monitoring
          </Button>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Records</CardTitle>
            <CardDescription>
              View and manage load monitoring records for all substations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by substation, region, district..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            {filteredRecords.length === 0 ? (
              <div className="text-center py-8 bg-muted/30 rounded-lg">
                <p className="text-muted-foreground mb-2">No load monitoring records found</p>
                <Button onClick={() => navigate("/asset-management/load-monitoring")}>
                  Record New Load Data
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Substation</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Load %</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((record) => (
                      <TableRow key={record.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewDetails(record.id)}>
                        <TableCell>{formatDate(record.date)}</TableCell>
                        <TableCell>{record.time}</TableCell>
                        <TableCell>{record.substationNumber}</TableCell>
                        <TableCell>{record.location}</TableCell>
                        <TableCell>{record.rating} A</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  (record.percentageLoad || 0) < 50 
                                    ? "bg-green-500" 
                                    : (record.percentageLoad || 0) < 80 
                                      ? "bg-yellow-500" 
                                      : "bg-red-500"
                                }`}
                                style={{ width: `${Math.min(100, record.percentageLoad || 0)}%` }}
                              />
                            </div>
                            <span>{record.percentageLoad?.toFixed(1)}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(record.id);
                              }}>
                                <FileText className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                handleExportPDF(record);
                              }}>
                                <Export className="mr-2 h-4 w-4" />
                                Export PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                handleExportCSV(record);
                              }}>
                                <Export className="mr-2 h-4 w-4" />
                                Export CSV
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(record.id);
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
