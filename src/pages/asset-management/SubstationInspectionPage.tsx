
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { SubstationInspection, InspectionItem, InspectionCategory } from "@/lib/types";
import { useData } from "@/contexts/DataContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InspectionChecklistItem } from "@/components/vit/InspectionChecklistItem";
import { ChevronLeft } from "lucide-react";

const formSchema = z.object({
  substationNo: z.string().min(3, { message: "Substation number is required" }),
  substationName: z.string().optional(),
  region: z.string().min(1, { message: "Region is required" }),
  district: z.string().min(1, { message: "District is required" }),
  date: z.string().min(1, { message: "Date is required" }),
  type: z.enum(["routine", "preventive", "corrective"]),
  isEmergency: z.boolean().default(false),
});

export default function SubstationInspectionPage() {
  const navigate = useNavigate();
  const { regions, districts, saveInspection } = useData();
  const [activeTab, setActiveTab] = useState("basic-info");
  const [selectedRegion, setSelectedRegion] = useState("");
  
  const inspectionCategories: InspectionCategory[] = [
    {
      name: "Transformers",
      items: [
        { name: "Oil Level", status: "good", remarks: "" },
        { name: "Silica Gel", status: "good", remarks: "" },
        { name: "Oil Leaks", status: "good", remarks: "" },
        { name: "Valves", status: "good", remarks: "" },
        { name: "Temperature", status: "good", remarks: "" },
        { name: "Bushings", status: "good", remarks: "" },
        { name: "Fans and Pumps", status: "good", remarks: "" },
      ]
    },
    {
      name: "Switchgear",
      items: [
        { name: "Insulation", status: "good", remarks: "" },
        { name: "Contact Resistance", status: "good", remarks: "" },
        { name: "Circuit Breakers", status: "good", remarks: "" },
        { name: "Relays", status: "good", remarks: "" },
        { name: "Fuses", status: "good", remarks: "" },
      ]
    },
    {
      name: "Control Systems",
      items: [
        { name: "Batteries", status: "good", remarks: "" },
        { name: "Chargers", status: "good", remarks: "" },
        { name: "SCADA/RTU", status: "good", remarks: "" },
        { name: "Alarms", status: "good", remarks: "" },
        { name: "Control Panels", status: "good", remarks: "" },
      ]
    },
    {
      name: "Yard Equipment",
      items: [
        { name: "Insulators", status: "good", remarks: "" },
        { name: "Connectors", status: "good", remarks: "" },
        { name: "Foundations", status: "good", remarks: "" },
        { name: "Grounding", status: "good", remarks: "" },
        { name: "Security Fence", status: "good", remarks: "" },
        { name: "Vegetation Growth", status: "good", remarks: "" },
      ]
    }
  ];
  
  const [categories, setCategories] = useState<InspectionCategory[]>(inspectionCategories);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      substationNo: "",
      substationName: "",
      region: "",
      district: "",
      date: new Date().toISOString().split('T')[0],
      type: "routine",
      isEmergency: false,
    },
  });
  
  // Update districts when region changes
  useEffect(() => {
    if (selectedRegion) {
      // Reset district if region changes
      form.setValue("district", "");
    }
  }, [selectedRegion, form]);
  
  const filteredDistricts = districts.filter(
    (district) => district.regionId === selectedRegion
  );
  
  const handleUpdateItemStatus = (categoryIndex: number, itemIndex: number, newStatus: "good" | "bad") => {
    const updatedCategories = [...categories];
    updatedCategories[categoryIndex].items[itemIndex].status = newStatus;
    setCategories(updatedCategories);
  };
  
  const handleUpdateItemRemarks = (categoryIndex: number, itemIndex: number, remarks: string) => {
    const updatedCategories = [...categories];
    updatedCategories[categoryIndex].items[itemIndex].remarks = remarks;
    setCategories(updatedCategories);
  };
  
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Validate that at least one item is checked
    const hasInspectedItems = categories.some(category => 
      category.items.some(item => item.status === "bad" || item.remarks)
    );
    
    if (!hasInspectedItems) {
      toast.error("Please complete at least one inspection item");
      return;
    }
    
    try {
      // Create the inspection object
      const inspection: SubstationInspection = {
        id: uuidv4(),
        substationNo: values.substationNo,
        substationName: values.substationName || values.substationNo,
        region: values.region,
        district: values.district,
        date: values.date,
        type: values.type,
        isEmergency: values.isEmergency,
        items: categories,
        createdAt: new Date().toISOString(),
        createdBy: "Current User", // This should come from user context
      };
      
      // Save the inspection
      saveInspection(inspection);
      
      toast.success("Inspection saved successfully");
      navigate("/asset-management/inspection-management");
    } catch (error) {
      console.error("Error saving inspection:", error);
      toast.error("Failed to save inspection");
    }
  };
  
  return (
    <Layout>
      <div className="container py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/asset-management/inspection-management")} 
          className="mb-4"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Inspections
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">New Substation Inspection</h1>
            <p className="text-muted-foreground mt-1">
              Record an inspection of substation equipment
            </p>
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="basic-info" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic-info">Basic Information</TabsTrigger>
                <TabsTrigger value="inspection-items">Inspection Items</TabsTrigger>
              </TabsList>
              
              {/* Basic Information Tab */}
              <TabsContent value="basic-info" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Substation Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="substationNo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Substation Number*</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter substation number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="substationName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Substation Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter substation name (optional)" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                      
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="region"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Region*</FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                field.onChange(value);
                                setSelectedRegion(value);
                              }} 
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a region" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {regions.map((region) => (
                                  <SelectItem key={region.id} value={region.id}>
                                    {region.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="district"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>District*</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a district" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {filteredDistricts.map((district) => (
                                  <SelectItem key={district.id} value={district.id}>
                                    {district.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                      
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date*</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Inspection Type*</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select inspection type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="routine">Routine</SelectItem>
                                <SelectItem value="preventive">Preventive Maintenance</SelectItem>
                                <SelectItem value="corrective">Corrective Maintenance</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                      
                    <FormField
                      control={form.control}
                      name="isEmergency"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Emergency Inspection</FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Check if this is an emergency or unplanned inspection
                            </p>
                          </div>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
                
                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="button"
                    onClick={() => setActiveTab("inspection-items")}
                  >
                    Continue to Inspection Items
                  </Button>
                </div>
              </TabsContent>
              
              {/* Inspection Items Tab */}
              <TabsContent value="inspection-items" className="space-y-6 mt-6">
                {categories.map((category, categoryIndex) => (
                  <Card key={categoryIndex}>
                    <CardHeader>
                      <CardTitle>{category.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {category.items.map((item, itemIndex) => (
                        <InspectionChecklistItem
                          key={itemIndex}
                          item={item}
                          onStatusChange={(status) => handleUpdateItemStatus(categoryIndex, itemIndex, status)}
                          onRemarksChange={(remarks) => handleUpdateItemRemarks(categoryIndex, itemIndex, remarks)}
                        />
                      ))}
                    </CardContent>
                  </Card>
                ))}
                
                <div className="flex justify-between">
                  <Button
                    type="button" 
                    variant="outline"
                    onClick={() => setActiveTab("basic-info")}
                  >
                    Back to Basic Information
                  </Button>
                  <Button type="submit">Submit Inspection</Button>
                </div>
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      </div>
    </Layout>
  );
}
