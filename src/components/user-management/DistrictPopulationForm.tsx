
import { useState, useEffect } from "react";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";

export function DistrictPopulationForm() {
  const { regions, districts, updateDistrict } = useData();
  const { user } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [ruralPopulation, setRuralPopulation] = useState<number>(0);
  const [urbanPopulation, setUrbanPopulation] = useState<number>(0);
  const [metroPopulation, setMetroPopulation] = useState<number>(0);
  
  // Set initial values based on user role
  useEffect(() => {
    if (user?.role === "district_engineer" && user.region && user.district) {
      const userRegion = regions.find(r => r.name === user.region);
      if (userRegion) {
        setSelectedRegion(userRegion.id);
        
        const userDistrict = districts.find(d => d.name === user.district);
        if (userDistrict) {
          setSelectedDistrict(userDistrict.id);
          setRuralPopulation(userDistrict.population.rural);
          setUrbanPopulation(userDistrict.population.urban);
          setMetroPopulation(userDistrict.population.metro);
        }
      }
    }
  }, [user, regions, districts]);
  
  // Update population fields when district changes
  useEffect(() => {
    if (selectedDistrict) {
      const district = districts.find(d => d.id === selectedDistrict);
      if (district) {
        setRuralPopulation(district.population.rural);
        setUrbanPopulation(district.population.urban);
        setMetroPopulation(district.population.metro);
      }
    } else {
      setRuralPopulation(0);
      setUrbanPopulation(0);
      setMetroPopulation(0);
    }
  }, [selectedDistrict, districts]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDistrict) {
      toast.error("Please select a district");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      updateDistrict(selectedDistrict, {
        population: {
          rural: ruralPopulation,
          urban: urbanPopulation,
          metro: metroPopulation
        }
      });
      
      toast.success("District population updated successfully");
    } catch (error) {
      console.error("Error updating district population:", error);
      toast.error("Failed to update district population");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Filter regions for regional and global engineers
  const filteredRegions = user?.role === "global_engineer" 
    ? regions 
    : regions.filter(r => user?.region ? r.name === user.region : true);
  
  // Filter districts for district engineers
  const filteredDistricts = selectedRegion
    ? districts.filter(d => {
      const region = regions.find(r => r.id === selectedRegion);
      if (!region) return false;
      
      // Safely check if districts property exists and is an array
      const regionDistricts = region.districts || [];
      if (!Array.isArray(regionDistricts)) return false;
      
      // Handle both cases: district IDs as strings or as objects with id property
      return regionDistricts.some(rd => {
        if (typeof rd === 'string') return rd === d.id;
        return rd && typeof rd === 'object' && 'id' in rd && rd.id === d.id;
      }) && (
        user?.role === "district_engineer" 
          ? user.district === d.name 
          : true
      );
    })
    : [];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Update District Population</CardTitle>
        <CardDescription>
          Set population figures for district segmentation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Select 
                value={selectedRegion} 
                onValueChange={setSelectedRegion}
                disabled={user?.role === "district_engineer"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {filteredRegions.map(region => (
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
                value={selectedDistrict} 
                onValueChange={setSelectedDistrict}
                disabled={!selectedRegion || user?.role === "district_engineer"}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedRegion ? "Select district" : "Select region first"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredDistricts.map(district => (
                    <SelectItem key={district.id} value={district.id}>
                      {district.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="ruralPopulation">Rural Population</Label>
              <Input
                id="ruralPopulation"
                type="number"
                min="0"
                value={ruralPopulation}
                onChange={(e) => setRuralPopulation(parseInt(e.target.value) || 0)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="urbanPopulation">Urban Population</Label>
              <Input
                id="urbanPopulation"
                type="number"
                min="0"
                value={urbanPopulation}
                onChange={(e) => setUrbanPopulation(parseInt(e.target.value) || 0)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="metroPopulation">Metro Population</Label>
              <Input
                id="metroPopulation"
                type="number"
                min="0"
                value={metroPopulation}
                onChange={(e) => setMetroPopulation(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Update Population Data"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
