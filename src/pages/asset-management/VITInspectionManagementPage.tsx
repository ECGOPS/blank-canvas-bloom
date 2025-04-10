
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { Layout } from "@/components/layout/Layout";
import { VITInspectionForm } from "@/components/vit/VITInspectionForm";
import { VITAssetsTable } from "@/components/vit/VITAssetsTable";
import { VITAssetForm } from "@/components/vit/VITAssetForm";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { format } from "date-fns";
import { jsPDF } from "jspdf";
import "jspdf-autotable"; // Import the autotable plugin
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  PlusCircle, Eye, Pencil, Download, FileText, Trash2
} from "lucide-react";
import { VITAsset, VITInspectionChecklist } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Add type declaration for jsPDF with autotable extensions
declare module "jspdf" {
  interface jsPDF {
    lastAutoTable?: {
      finalY?: number;
    };
    autoTable: (options: any) => jsPDF;
  }
}

export default function VITInspectionManagementPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("assets");
  const [isAssetFormOpen, setIsAssetFormOpen] = useState(false);
  const [isInspectionFormOpen, setIsInspectionFormOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<VITAsset | null>(null);
  const [selectedAssetId, setSelectedAssetId] = useState<string>("");
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<VITInspectionChecklist | null>(null);
  const [isEditInspectionOpen, setIsEditInspectionOpen] = useState(false);

  const handleAddAsset = () => {
    setSelectedAsset(null);
    setIsAssetFormOpen(true);
  };

  const handleEditAsset = (asset: VITAsset) => {
    setSelectedAsset(asset);
    setIsAssetFormOpen(true);
  };

  const handleAddInspection = (assetId: string) => {
    setSelectedAssetId(assetId);
    setIsInspectionFormOpen(true);
  };

  const handleCloseAssetForm = () => {
    setIsAssetFormOpen(false);
    setSelectedAsset(null);
  };

  const handleCloseInspectionForm = () => {
    setIsInspectionFormOpen(false);
    setIsEditInspectionOpen(false);
    setSelectedAssetId("");
    setSelectedInspection(null);
  };

  const handleViewDetails = (inspection: VITInspectionChecklist) => {
    setSelectedInspection(inspection);
    setIsDetailsDialogOpen(true);
  };

  const handleEditInspection = (inspection: VITInspectionChecklist) => {
    setSelectedInspection(inspection);
    setSelectedAssetId(inspection.vitAssetId);
    setIsEditInspectionOpen(true);
  };
  
  const handleViewAsset = (assetId: string) => {
    navigate(`/asset-management/vit-inspection-details/${assetId}`);
  };

  return (
    <Layout>
      <div className="container py-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">VIT Inspection Management</h1>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="assets">Assets Management</TabsTrigger>
              <TabsTrigger value="inspections">Inspection Records</TabsTrigger>
            </TabsList>
            
            <TabsContent value="assets" className="space-y-4">
              <VITAssetsTable 
                onAddAsset={handleAddAsset}
                onEditAsset={handleEditAsset}
                onInspect={handleAddInspection}
              />
              
              <Button
                onClick={handleAddAsset}
                className="mt-4"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New VIT Asset
              </Button>
            </TabsContent>
            
            <TabsContent value="inspections" className="space-y-4">
              <InspectionRecordsTable 
                onViewDetails={handleViewDetails} 
                onEditInspection={handleEditInspection}
                onViewAsset={handleViewAsset}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Asset Form Sheet */}
      <Sheet open={isAssetFormOpen} onOpenChange={setIsAssetFormOpen}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{selectedAsset ? "Edit VIT Asset" : "Add New VIT Asset"}</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <VITAssetForm
              asset={selectedAsset ?? undefined}
              onSubmit={handleCloseAssetForm}
              onCancel={handleCloseAssetForm}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Inspection Form Sheet - Used for both Add and Edit */}
      <Sheet open={isInspectionFormOpen || isEditInspectionOpen} onOpenChange={(open) => {
        if (!open) {
          setIsInspectionFormOpen(false);
          setIsEditInspectionOpen(false);
          handleCloseInspectionForm();
        }
      }}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{selectedInspection ? "Edit VIT Inspection" : "Add VIT Inspection"}</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <VITInspectionForm
              assetId={selectedAssetId}
              inspectionData={selectedInspection}
              onSubmit={handleCloseInspectionForm}
              onCancel={handleCloseInspectionForm}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Inspection Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>VIT Inspection Details</DialogTitle>
            <DialogDescription>
              Inspection performed on {selectedInspection ? new Date(selectedInspection.inspectionDate).toLocaleDateString() : ""}
            </DialogDescription>
          </DialogHeader>
          {selectedInspection && <InspectionDetailsView inspection={selectedInspection} />}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

// Internal component for inspection details view
function InspectionDetailsView({ inspection }: { inspection: VITInspectionChecklist }) {
  const { vitAssets, regions, districts } = useData();
  const asset = vitAssets.find(a => a.id === inspection.vitAssetId);
  const region = asset ? regions.find(r => r.id === asset.regionId)?.name || "Unknown" : "Unknown";
  const district = asset ? districts.find(d => d.id === asset.districtId)?.name || "Unknown" : "Unknown";

  const getStatusDisplay = (value: string) => {
    if (value === "Yes") return <span className="text-green-600 font-medium">Yes</span>;
    if (value === "No") return <span className="text-red-600 font-medium">No</span>;
    if (value === "Good") return <span className="text-green-600 font-medium">Good</span>;
    if (value === "Bad") return <span className="text-red-600 font-medium">Bad</span>;
    return value;
  };

  const checklistItems = [
    { label: "Rodent/Termite Encroachment", value: inspection.rodentTermiteEncroachment, isIssue: inspection.rodentTermiteEncroachment === "Yes" },
    { label: "Clean and Dust Free", value: inspection.cleanDustFree, isIssue: inspection.cleanDustFree === "No" },
    { label: "Protection Button Enabled", value: inspection.protectionButtonEnabled, isIssue: inspection.protectionButtonEnabled === "No" },
    { label: "Recloser Button Enabled", value: inspection.recloserButtonEnabled, isIssue: inspection.recloserButtonEnabled === "No" },
    { label: "Ground Earth Button Enabled", value: inspection.groundEarthButtonEnabled, isIssue: inspection.groundEarthButtonEnabled === "No" },
    { label: "AC Power On", value: inspection.acPowerOn, isIssue: inspection.acPowerOn === "No" },
    { label: "Battery Power Low", value: inspection.batteryPowerLow, isIssue: inspection.batteryPowerLow === "Yes" },
    { label: "Handle Lock On", value: inspection.handleLockOn, isIssue: inspection.handleLockOn === "No" },
    { label: "Remote Button Enabled", value: inspection.remoteButtonEnabled, isIssue: inspection.remoteButtonEnabled === "No" },
    { label: "Gas Level Low", value: inspection.gasLevelLow, isIssue: inspection.gasLevelLow === "Yes" },
    { label: "Earthing Arrangement Adequate", value: inspection.earthingArrangementAdequate, isIssue: inspection.earthingArrangementAdequate === "No" },
    { label: "No Fuses Blown", value: inspection.noFusesBlown, isIssue: inspection.noFusesBlown === "No" },
    { label: "No Damage to Bushings", value: inspection.noDamageToBushings, isIssue: inspection.noDamageToBushings === "No" },
    { label: "No Damage to HV Connections", value: inspection.noDamageToHVConnections, isIssue: inspection.noDamageToHVConnections === "No" },
    { label: "Insulators Clean", value: inspection.insulatorsClean, isIssue: inspection.insulatorsClean === "No" },
    { label: "Paintwork Adequate", value: inspection.paintworkAdequate, isIssue: inspection.paintworkAdequate === "No" },
    { label: "PT Fuse Link Intact", value: inspection.ptFuseLinkIntact, isIssue: inspection.ptFuseLinkIntact === "No" },
    { label: "No Corrosion", value: inspection.noCorrosion, isIssue: inspection.noCorrosion === "No" },
    { label: "Silica Gel Condition", value: inspection.silicaGelCondition, isIssue: inspection.silicaGelCondition === "Bad" },
    { label: "Correct Labelling", value: inspection.correctLabelling, isIssue: inspection.correctLabelling === "No" },
  ];

  const issuesCount = checklistItems.filter(item => item.isIssue).length;

  return (
    <div className="space-y-6 py-4">
      {/* Asset Information */}
      <div className="bg-muted/50 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-medium mb-2">Asset Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Serial Number</p>
            <p className="text-base">{asset?.serialNumber || "Unknown"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Type</p>
            <p className="text-base">{asset?.typeOfUnit || "Unknown"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Region</p>
            <p className="text-base">{region}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">District</p>
            <p className="text-base">{district}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Location</p>
            <p className="text-base">{asset?.location || "Unknown"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <p className="text-base">{asset?.status || "Unknown"}</p>
          </div>
        </div>
      </div>

      {/* Inspection Information */}
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-3">Inspection Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Date</p>
            <p className="text-base">{new Date(inspection.inspectionDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Inspector</p>
            <p className="text-base">{inspection.inspectedBy}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Issues Found</p>
            <p className={`text-base ${issuesCount > 0 ? "text-red-600" : "text-green-600"}`}>
              {issuesCount} {issuesCount === 1 ? "issue" : "issues"}
            </p>
          </div>
        </div>
      </div>

      {/* Checklist Items */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inspection Item</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {checklistItems.map((item, index) => (
                <tr key={index} className={item.isIssue ? "bg-red-50" : ""}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{item.label}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{getStatusDisplay(item.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Remarks */}
      {inspection.remarks && (
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Remarks</h3>
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm">{inspection.remarks}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Internal component for inspection records table with standardized actions matching the asset table
function InspectionRecordsTable({ onViewDetails, onEditInspection, onViewAsset }: { 
  onViewDetails: (inspection: VITInspectionChecklist) => void;
  onEditInspection: (inspection: VITInspectionChecklist) => void;
  onViewAsset: (assetId: string) => void;
}) {
  const { vitInspections, vitAssets, regions, districts, deleteVITInspection } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Filter inspections based on search term
  const filteredInspections = searchTerm 
    ? vitInspections.filter(inspection => {
        const asset = vitAssets.find(a => a.id === inspection.vitAssetId);
        if (!asset) return false;
        
        const lowercaseSearch = searchTerm.toLowerCase();
        const region = regions.find(r => r.id === asset.regionId)?.name || "";
        const district = districts.find(d => d.id === asset.districtId)?.name || "";
        
        return (
          asset.serialNumber.toLowerCase().includes(lowercaseSearch) ||
          asset.location.toLowerCase().includes(lowercaseSearch) ||
          region.toLowerCase().includes(lowercaseSearch) ||
          district.toLowerCase().includes(lowercaseSearch) ||
          inspection.inspectedBy.toLowerCase().includes(lowercaseSearch)
        );
      })
    : vitInspections;

  const handleDeleteInspection = (id: string) => {
    if (window.confirm("Are you sure you want to delete this inspection record?")) {
      deleteVITInspection(id);
      toast.success("Inspection record deleted successfully");
    }
  };

  const exportToPDF = (inspection: VITInspectionChecklist) => {
    const asset = vitAssets.find(a => a.id === inspection.vitAssetId);
    if (!asset) {
      toast.error("Asset information not found");
      return;
    }
    
    const region = regions.find(r => r.id === asset.regionId)?.name || "Unknown";
    const district = districts.find(d => d.id === asset.districtId)?.name || "Unknown";
    
    // Create PDF document
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.setTextColor(0, 51, 102);
    doc.text("VIT Inspection Report", 14, 20);
    
    // Add date and inspector info
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Date: ${format(new Date(inspection.inspectionDate), "dd/MM/yyyy")}`, 14, 30);
    doc.text(`Inspector: ${inspection.inspectedBy}`, 14, 36);
    
    // Add asset information
    doc.setFontSize(14);
    doc.setTextColor(0, 51, 102);
    doc.text("Asset Information", 14, 46);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Serial Number: ${asset.serialNumber}`, 14, 54);
    doc.text(`Type of Unit: ${asset.typeOfUnit}`, 14, 60);
    doc.text(`Voltage Level: ${asset.voltageLevel}`, 14, 66);
    doc.text(`Region: ${region}`, 114, 54);
    doc.text(`District: ${district}`, 114, 60);
    doc.text(`Location: ${asset.location}`, 114, 66);
    
    // Add inspection checklist
    doc.setFontSize(14);
    doc.setTextColor(0, 51, 102);
    doc.text("Inspection Checklist", 14, 78);
    
    // Create inspection items table data
    const checklistItems = [
      ["Item", "Status"],
      ["Rodent/Termite Encroachment", inspection.rodentTermiteEncroachment],
      ["Clean and Dust Free", inspection.cleanDustFree],
      ["Protection Button Enabled", inspection.protectionButtonEnabled],
      ["Recloser Button Enabled", inspection.recloserButtonEnabled],
      ["Ground Earth Button Enabled", inspection.groundEarthButtonEnabled],
      ["AC Power On", inspection.acPowerOn],
      ["Battery Power Low", inspection.batteryPowerLow],
      ["Handle Lock On", inspection.handleLockOn],
      ["Remote Button Enabled", inspection.remoteButtonEnabled],
      ["Gas Level Low", inspection.gasLevelLow],
      ["Earthing Arrangement Adequate", inspection.earthingArrangementAdequate],
      ["No Fuses Blown", inspection.noFusesBlown],
      ["No Damage to Bushings", inspection.noDamageToBushings],
      ["No Damage to HV Connections", inspection.noDamageToHVConnections],
      ["Insulators Clean", inspection.insulatorsClean],
      ["Paintwork Adequate", inspection.paintworkAdequate],
      ["PT Fuse Link Intact", inspection.ptFuseLinkIntact],
      ["No Corrosion", inspection.noCorrosion],
      ["Silica Gel Condition", inspection.silicaGelCondition],
      ["Correct Labelling", inspection.correctLabelling]
    ];
    
    doc.autoTable({
      startY: 84,
      head: [checklistItems[0]],
      body: checklistItems.slice(1),
      theme: 'striped',
      headStyles: { fillColor: [0, 51, 102], textColor: [255, 255, 255] },
      styles: { cellPadding: 3, fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 100 },
        1: { cellWidth: 40 }
      }
    });
    
    // Get the final y position after the table
    let finalY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY : 200;
    
    if (inspection.remarks) {
      doc.setFontSize(14);
      doc.setTextColor(0, 51, 102);
      doc.text("Remarks", 14, finalY + 15);
      
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(inspection.remarks, 14, finalY + 25, {
        maxWidth: 180
      });
    }
    
    // Save PDF
    doc.save(`vit-inspection-${asset.serialNumber}-${format(new Date(inspection.inspectionDate), "yyyy-MM-dd")}.pdf`);
    toast.success("PDF report generated successfully");
  };
  
  const handleViewInspectionDetails = (inspection: VITInspectionChecklist) => {
    onViewAsset(inspection.vitAssetId);
  };

  const handleEditInspectionDetails = (inspection: VITInspectionChecklist) => {
    navigate(`/asset-management/edit-vit-inspection/${inspection.id}`);
  };
  
  return (
    <div>
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search inspections by serial number, location, region or district..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-2 border rounded-md w-full"
        />
      </div>

      <div className="rounded-md border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">District</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inspector</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issues</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredInspections.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  {searchTerm ? "No inspections found matching your search" : "No inspection records found"}
                </td>
              </tr>
            ) : (
              filteredInspections.map(inspection => {
                const asset = vitAssets.find(a => a.id === inspection.vitAssetId);
                if (!asset) return null;
                
                const region = regions.find(r => r.id === asset.regionId)?.name || "Unknown";
                const district = districts.find(d => d.id === asset.districtId)?.name || "Unknown";
                
                // Count issues
                const issuesCount = Object.entries(inspection).reduce((count, [key, value]) => {
                  // Check only Yes/No fields for issues (Yes for negative fields, No for positive fields)
                  if (key === 'rodentTermiteEncroachment' && value === 'Yes') return count + 1;
                  if (key === 'batteryPowerLow' && value === 'Yes') return count + 1;
                  if (key === 'gasLevelLow' && value === 'Yes') return count + 1;
                  if (key === 'silicaGelCondition' && value === 'Bad') return count + 1;
                  
                  // All other boolean fields where "No" is an issue
                  if (
                    ['cleanDustFree', 'protectionButtonEnabled', 'recloserButtonEnabled', 
                     'groundEarthButtonEnabled', 'acPowerOn', 'handleLockOn', 'remoteButtonEnabled', 
                     'earthingArrangementAdequate', 'noFusesBlown', 'noDamageToBushings', 
                     'noDamageToHVConnections', 'insulatorsClean', 'paintworkAdequate', 
                     'ptFuseLinkIntact', 'noCorrosion', 'correctLabelling'].includes(key) && 
                     value === 'No'
                  ) {
                    return count + 1;
                  }
                  
                  return count;
                }, 0);
                
                return (
                  <tr key={inspection.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(inspection.inspectionDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {asset.serialNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {region}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {district}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {inspection.inspectedBy}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        issuesCount > 0 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                      }`}>
                        {issuesCount} {issuesCount === 1 ? "issue" : "issues"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
                          <DropdownMenuItem onClick={() => handleViewInspectionDetails(inspection)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditInspectionDetails(inspection)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => exportToPDF(inspection)}>
                            <FileText className="mr-2 h-4 w-4" />
                            Export to PDF
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600" 
                            onClick={() => handleDeleteInspection(inspection.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

