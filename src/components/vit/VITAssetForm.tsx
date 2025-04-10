import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { VITAsset, VoltageLevel, VITStatus } from "@/lib/types";

export default function VITAssetForm() {
  const { user } = useAuth();
  const { regions, districts, addVITAsset } = useData();
  const navigate = useNavigate();
  const [regionId, setRegionId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [formData, setFormData] = useState<Partial<VITAsset>>({
    voltageLevel: "11KV",
    status: "Operational",
  });

  // Initialize region and district based on user role
  useEffect(() => {
    if (user) {
      if (user.role === "district_engineer" || user.role === "regional_engineer") {
        const userRegion = regions.find(r => r.name === user.region);
        if (userRegion) {
          setRegionId(userRegion.id);
          setFormData(prev => ({ ...prev, regionId: userRegion.id }));
          
          if (user.role === "district_engineer" && user.district) {
            const userDistrict = districts.find(d => d.name === user.district);
            if (userDistrict) {
              setDistrictId(userDistrict.id);
              setFormData(prev => ({ ...prev, districtId: userDistrict.id }));
            }
          }
        }
      }
    }
  }, [user, regions, districts]);

  // Filter regions and districts based on user role
  const filteredRegions = user?.role === "global_engineer"
    ? regions
    : regions.filter(r => user?.region ? r.name === user.region : true);
  
  const filteredDistricts = regionId
    ? districts.filter(d => {
        const region = regions.find(r => r.id === regionId);
        return region?.districts.some(rd => rd.id === d.id) && (
          user?.role === "district_engineer" 
            ? user.district === d.name 
            : true
        );
      })
    : [];

  // Handle region change
  const handleRegionChange = (value: string) => {
    setRegionId(value);
    setFormData(prev => ({ ...prev, regionId: value }));
    setDistrictId("");
    setFormData(prev => ({ ...prev, districtId: "" }));
  };

  // Handle district change
  const handleDistrictChange = (value: string) => {
    setDistrictId(value);
    setFormData(prev => ({ ...prev, districtId: value }));
  };

  // Handle generic form input changes
  const handleInputChange = (field: keyof VITAsset, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.regionId || !formData.districtId || !formData.voltageLevel || !formData.typeOfUnit || !formData.serialNumber || !formData.location || !formData.gpsCoordinates || !formData.status || !formData.protection) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const assetData: Omit<VITAsset, "id" | "createdAt" | "updatedAt"> = {
      regionId: formData.regionId,
      districtId: formData.districtId,
      voltageLevel: formData.voltageLevel as VoltageLevel,
      typeOfUnit: formData.typeOfUnit,
      serialNumber: formData.serialNumber,
      location: formData.location,
      gpsCoordinates: formData.gpsCoordinates,
      status: formData.status as VITStatus,
      protection: formData.protection,
      photoUrl: formData.photoUrl,
      createdBy: user?.name || "Anonymous"
    };

    addVITAsset(assetData);
    navigate("/vit-assets");
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New VIT Asset</h1>
          <p className="text-muted-foreground mt-1">
            Fill in the details to register a new VIT asset
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>VIT Asset Details</CardTitle>
          <CardDescription>Enter the basic information about the VIT asset</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Select
                  value={regionId}
                  onValueChange={handleRegionChange}
                  disabled={user?.role === "district_engineer" || user?.role === "regional_engineer"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredRegions.map((region) => (
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
                  value={districtId}
                  onValueChange={handleDistrictChange}
                  disabled={user?.role === "district_engineer" || !regionId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredDistricts.map((district) => (
                      <SelectItem key={district.id} value={district.id}>
                        {district.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="voltageLevel">Voltage Level</Label>
                <Select
                  value={formData.voltageLevel}
                  onValueChange={(value) => handleInputChange("voltageLevel", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select voltage level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="11KV">11KV</SelectItem>
                    <SelectItem value="33KV">33KV</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="typeOfUnit">Type of Unit</Label>
                <Input
                  type="text"
                  id="typeOfUnit"
                  value={formData.typeOfUnit || ""}
                  onChange={(e) => handleInputChange("typeOfUnit", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serialNumber">Serial Number</Label>
                <Input
                  type="text"
                  id="serialNumber"
                  value={formData.serialNumber || ""}
                  onChange={(e) => handleInputChange("serialNumber", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  type="text"
                  id="location"
                  value={formData.location || ""}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gpsCoordinates">GPS Coordinates</Label>
                <Input
                  type="text"
                  id="gpsCoordinates"
                  value={formData.gpsCoordinates || ""}
                  onChange={(e) => handleInputChange("gpsCoordinates", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Operational">Operational</SelectItem>
                    <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
                    <SelectItem value="Faulty">Faulty</SelectItem>
                    <SelectItem value="Decommissioned">Decommissioned</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="protection">Protection</Label>
                <Input
                  type="text"
                  id="protection"
                  value={formData.protection || ""}
                  onChange={(e) => handleInputChange("protection", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="photoUrl">Photo URL (Optional)</Label>
                <Input
                  type="text"
                  id="photoUrl"
                  value={formData.photoUrl || ""}
                  onChange={(e) => handleInputChange("photoUrl", e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit">Add Asset</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
