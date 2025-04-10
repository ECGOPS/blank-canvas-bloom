
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useNavigate } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Eye, Pencil, Trash2, FileDown, FileText, Plus } from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportLoadMonitoringToPDF } from "@/utils/pdfExport";

export default function LoadMonitoringManagementPage() {
  const navigate = useNavigate();
  const { loadMonitoringData, deleteLoadMonitoring } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter data based on search term
  const filteredData = loadMonitoringData?.filter(data => 
    (data.substationName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (data.substationNumber?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (data.region?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (data.district?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  ) || [];

  const handleView = (id: string) => {
    navigate(`/asset-management/load-monitoring-details/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/asset-management/edit-load-monitoring/${id}`);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this load monitoring record?")) {
      deleteLoadMonitoring(id);
      toast.success("Load monitoring record deleted successfully");
    }
  };

  const handleExportPdf = (data) => {
    exportLoadMonitoringToPDF(data);
    toast.success("PDF export started");
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Transformer Load Monitoring</h1>
          <div className="flex space-x-4">
            <Button 
              onClick={() => navigate("/asset-management/load-monitoring")}
              variant="default"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Load Monitoring
            </Button>
          </div>
        </div>
        
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Search Records</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search by substation name, number, region or district..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </CardContent>
        </Card>
        
        <div className="rounded-md border">
          <Table>
            <TableCaption>List of all load monitoring records</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Substation</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Region / District</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Load</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((data) => {
                  const formattedDateTime = `${format(new Date(data.date), 'MMM d, yyyy')} ${data.time}`;
                  
                  // Calculate load percentage class
                  let loadClass = "bg-green-100 text-green-800";
                  if (data.percentageLoad > 90) {
                    loadClass = "bg-red-100 text-red-800";
                  } else if (data.percentageLoad > 75) {
                    loadClass = "bg-yellow-100 text-yellow-800";
                  }
                  
                  return (
                    <TableRow key={data.id}>
                      <TableCell>
                        {formattedDateTime}
                      </TableCell>
                      <TableCell className="font-medium">
                        {data.substationName || "N/A"}
                        <div className="text-xs text-muted-foreground">
                          {data.substationNumber || ""}
                        </div>
                      </TableCell>
                      <TableCell>{data.location || "N/A"}</TableCell>
                      <TableCell>
                        {data.region}
                        <div className="text-xs text-muted-foreground">
                          {data.district}
                        </div>
                      </TableCell>
                      <TableCell>{data.rating} A</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${loadClass}`}>
                          {data.percentageLoad?.toFixed(1) || 0}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-4 w-4"
                              >
                                <circle cx="12" cy="12" r="1" />
                                <circle cx="19" cy="12" r="1" />
                                <circle cx="5" cy="12" r="1" />
                              </svg>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleView(data.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(data.id)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExportPdf(data)}>
                              <FileDown className="mr-2 h-4 w-4" />
                              Export to PDF
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600" 
                              onClick={() => handleDelete(data.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6">
                    {searchTerm ? "No records found matching your search." : "No load monitoring records have been saved yet."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
}
