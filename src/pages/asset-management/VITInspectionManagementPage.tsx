import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { ChevronLeft, Plus, Edit, Trash } from "lucide-react";
import { VITInspectionChecklist, InspectionRecordProps } from "@/lib/types";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function VITInspectionManagementPage() {
  const navigate = useNavigate();
  const { vitInspections, deleteVITInspection } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredInspections, setFilteredInspections] = useState<VITInspectionChecklist[]>([]);

  useEffect(() => {
    // Filter inspections based on search query
    const filtered = vitInspections.filter(inspection => {
      const inspectedBy = inspection.inspectedBy || "";
      return inspectedBy.toLowerCase().includes(searchQuery.toLowerCase());
    });
    setFilteredInspections(filtered);
  }, [searchQuery, vitInspections]);

  const handleAddInspection = () => {
    navigate("/asset-management/vit-inspection");
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this inspection record?")) {
      deleteVITInspection(id);
      toast.success("Inspection record deleted successfully");
    }
  };

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

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">VIT Inspection Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage and view all VIT inspection records
            </p>
          </div>

          <Button onClick={handleAddInspection} className="mt-4 md:mt-0">
            <Plus className="mr-2 h-4 w-4" />
            Add Inspection
          </Button>
        </div>

        <div className="mb-4">
          <Input
            type="search"
            placeholder="Search by inspector name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Date</TableHead>
                <TableHead>Inspector</TableHead>
                <TableHead>Asset ID</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInspections.map((inspection) => (
                <TableRow key={inspection.id}>
                  <TableCell className="font-medium">{inspection.inspectionDate}</TableCell>
                  <TableCell>{inspection.inspectedBy}</TableCell>
                  <TableCell>{inspection.vitAssetId}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigate(`/asset-management/edit-vit-inspection/${inspection.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(inspection.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredInspections.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No inspections found.
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
