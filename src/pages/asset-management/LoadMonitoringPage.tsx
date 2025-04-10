
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { v4 as uuidv4 } from "uuid";
import { LoadMonitoringData, FeederLeg } from "@/lib/asset-types";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";

export default function LoadMonitoringPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { regions, districts, getDistrictsByRegionId, saveLoadMonitoringRecord } = useData();
  
  // State for form data
  const [formData, setFormData] = useState<Partial<LoadMonitoringData>>({
    regionId: "",
    region: user?.region || "",
    districtId: "",
    district: user?.district || "",
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0].slice(0, 5),
    substationName: "",
    substationNumber: "",
    location: "",
    rating: 0,
    peakLoadStatus: "day",
    feederLegs: [
      { id: uuidv4(), redPhaseCurrent: 0, yellowPhaseCurrent: 0, bluePhaseCurrent: 0, neutralCurrent: 0 }
    ]
  });
  
  // State for available districts based on selected region
  const [availableDistricts, setAvailableDistricts] = useState<any[]>([]);
  
  // Current tab state
  const [currentTab, setCurrentTab] = useState("basic-info");
  
  // Update available districts when region changes
  useEffect(() => {
    if (formData.regionId) {
      const regionDistricts = getDistrictsByRegionId(formData.regionId);
      setAvailableDistricts(regionDistricts);
      
      // If user's district is not in this region, clear district selection
      if (regionDistricts.findIndex(d => d.id === formData.districtId) === -1) {
        setFormData(prev => ({ ...prev, districtId: "", district: "" }));
      }
    } else {
      setAvailableDistricts([]);
    }
  }, [formData.regionId, getDistrictsByRegionId]);
  
  // Handle generic form input changes
  const handleInputChange = (field: keyof LoadMonitoringData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle region selection
  const handleRegionChange = (regionId: string) => {
    const selectedRegion = regions.find(r => r.id === regionId);
    setFormData(prev => ({
      ...prev,
      regionId,
      region: selectedRegion?.name || "",
    }));
  };
  
  // Handle district selection
  const handleDistrictChange = (districtId: string) => {
    const selectedDistrict = availableDistricts.find(d => d.id === districtId);
    setFormData(prev => ({
      ...prev,
      districtId,
      district: selectedDistrict?.name || "",
    }));
  };
  
  // Handle feeder leg changes
  const handleFeederLegChange = (index: number, field: keyof FeederLeg, value: number) => {
    setFormData(prev => {
      const updatedLegs = [...(prev.feederLegs || [])];
      updatedLegs[index] = { 
        ...updatedLegs[index], 
        [field]: value 
      };
      return { ...prev, feederLegs: updatedLegs };
    });
  };
  
  // Add a new feeder leg
  const addFeederLeg = () => {
    setFormData(prev => ({
      ...prev,
      feederLegs: [
        ...(prev.feederLegs || []), 
        { id: uuidv4(), redPhaseCurrent: 0, yellowPhaseCurrent: 0, bluePhaseCurrent: 0, neutralCurrent: 0 }
      ]
    }));
  };
  
  // Remove a feeder leg
  const removeFeederLeg = (index: number) => {
    setFormData(prev => {
      const updatedLegs = [...(prev.feederLegs || [])];
      updatedLegs.splice(index, 1);
      return { ...prev, feederLegs: updatedLegs };
    });
  };
  
  // Calculate load metrics based on current form data
  const calculateLoadMetrics = () => {
    const feederLegs = formData.feederLegs || [];
    const rating = formData.rating || 0;
    
    // Calculate bulk load for each phase
    const redPhaseBulkLoad = feederLegs.reduce((sum, leg) => sum + leg.redPhaseCurrent, 0);
    const yellowPhaseBulkLoad = feederLegs.reduce((sum, leg) => sum + leg.yellowPhaseCurrent, 0);
    const bluePhaseBulkLoad = feederLegs.reduce((sum, leg) => sum + leg.bluePhaseCurrent, 0);
    
    // Calculate average current
    const averageCurrent = (redPhaseBulkLoad + yellowPhaseBulkLoad + bluePhaseBulkLoad) / 3;
    
    // Calculate percentage load
    const percentageLoad = rating > 0 ? (averageCurrent / rating) * 100 : 0;
    
    // Calculate ratedLoad
    const ratedLoad = rating * 1.732 * 11;
    
    // 10% of full load neutral
    const tenPercentFullLoadNeutral = (rating * 0.1);
    
    // Calculated neutral
    const calculatedNeutral = Math.sqrt(
      Math.pow(redPhaseBulkLoad, 2) + 
      Math.pow(yellowPhaseBulkLoad, 2) + 
      Math.pow(bluePhaseBulkLoad, 2) - 
      (redPhaseBulkLoad * yellowPhaseBulkLoad) -
      (redPhaseBulkLoad * bluePhaseBulkLoad) -
      (yellowPhaseBulkLoad * bluePhaseBulkLoad)
    );
    
    return {
      redPhaseBulkLoad,
      yellowPhaseBulkLoad,
      bluePhaseBulkLoad,
      averageCurrent,
      percentageLoad,
      ratedLoad,
      tenPercentFullLoadNeutral,
      calculatedNeutral
    };
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.regionId || !formData.districtId || !formData.date || !formData.time || 
        !formData.substationNumber || !formData.rating) {
      toast.error("Please fill all required fields");
      return;
    }
    
    // Calculate load metrics
    const metrics = calculateLoadMetrics();
    
    // Create new record with calculated metrics
    const newRecord: LoadMonitoringData = {
      id: uuidv4(),
      ...formData as LoadMonitoringData,
      ...metrics,
      createdBy: user?.name || "Anonymous",
      createdAt: new Date().toISOString()
    };
    
    // Save record
    saveLoadMonitoringRecord(newRecord);
    
    // Show success message
    toast.success("Load monitoring data saved successfully");
    
    // Navigate to management page
    navigate("/asset-management/load-monitoring-management");
  };
  
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <Button
          variant="outline"
          onClick={() => navigate("/asset-management/load-monitoring-management")}
          className="mb-6"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Load Monitoring
        </Button>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">New Load Monitoring</h1>
          <p className="text-muted-foreground mt-1">
            Record transformer load data for analysis and monitoring
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic-info">Basic Information</TabsTrigger>
              <TabsTrigger value="feeder-legs">Feeder Legs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic-info" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Substation Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="region">Region</Label>
                      <Select 
                        value={formData.regionId} 
                        onValueChange={handleRegionChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select region" />
                        </SelectTrigger>
                        <SelectContent>
                          {regions.map(region => (
                            <SelectItem key={region.id} value={region.id}>
                              {region.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="district">District</Label>
                      <Select 
                        value={formData.districtId} 
                        onValueChange={handleDistrictChange}
                        disabled={!formData.regionId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select district" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableDistricts.map(district => (
                            <SelectItem key={district.id} value={district.id}>
                              {district.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input 
                        id="date" 
                        type="date" 
                        value={formData.date} 
                        onChange={(e) => handleInputChange('date', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="time">Time</Label>
                      <Input 
                        id="time" 
                        type="time" 
                        value={formData.time} 
                        onChange={(e) => handleInputChange('time', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="substationNumber">Substation Number</Label>
                      <Input 
                        id="substationNumber" 
                        value={formData.substationNumber} 
                        onChange={(e) => handleInputChange('substationNumber', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="substationName">Substation Name (Optional)</Label>
                      <Input 
                        id="substationName" 
                        value={formData.substationName} 
                        onChange={(e) => handleInputChange('substationName', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input 
                        id="location" 
                        value={formData.location} 
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="rating">Transformer Rating (Amperes)</Label>
                      <Input 
                        id="rating" 
                        type="number" 
                        value={formData.rating || ''} 
                        onChange={(e) => handleInputChange('rating', Number(e.target.value))}
                        min="0"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="peakLoadStatus">Peak Load Status</Label>
                    <Select 
                      value={formData.peakLoadStatus} 
                      onValueChange={(value) => handleInputChange('peakLoadStatus', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select peak load status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">Day</SelectItem>
                        <SelectItem value="night">Night</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex justify-end mt-4">
                    <Button 
                      type="button" 
                      onClick={() => setCurrentTab("feeder-legs")}
                    >
                      Next: Feeder Legs
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="feeder-legs" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Feeder Legs Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(formData.feederLegs || []).map((leg, index) => (
                      <div key={leg.id} className="border rounded-md p-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">Feeder Leg #{index + 1}</h3>
                          {index > 0 && (
                            <Button 
                              type="button" 
                              variant="destructive" 
                              size="sm"
                              onClick={() => removeFeederLeg(index)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`red-phase-${index}`}>Red Phase Current (A)</Label>
                            <Input 
                              id={`red-phase-${index}`}
                              type="number"
                              value={leg.redPhaseCurrent || ''}
                              onChange={(e) => handleFeederLegChange(index, 'redPhaseCurrent', Number(e.target.value))}
                              min="0"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`yellow-phase-${index}`}>Yellow Phase Current (A)</Label>
                            <Input 
                              id={`yellow-phase-${index}`}
                              type="number"
                              value={leg.yellowPhaseCurrent || ''}
                              onChange={(e) => handleFeederLegChange(index, 'yellowPhaseCurrent', Number(e.target.value))}
                              min="0"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`blue-phase-${index}`}>Blue Phase Current (A)</Label>
                            <Input 
                              id={`blue-phase-${index}`}
                              type="number"
                              value={leg.bluePhaseCurrent || ''}
                              onChange={(e) => handleFeederLegChange(index, 'bluePhaseCurrent', Number(e.target.value))}
                              min="0"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`neutral-${index}`}>Neutral Current (A)</Label>
                            <Input 
                              id={`neutral-${index}`}
                              type="number"
                              value={leg.neutralCurrent || ''}
                              onChange={(e) => handleFeederLegChange(index, 'neutralCurrent', Number(e.target.value))}
                              min="0"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full"
                      onClick={addFeederLeg}
                    >
                      Add Feeder Leg
                    </Button>
                    
                    <div className="flex justify-between mt-6">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setCurrentTab("basic-info")}
                      >
                        Back: Basic Information
                      </Button>
                      
                      <Button type="submit">
                        Save Load Monitoring Data
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </div>
    </Layout>
  );
}
