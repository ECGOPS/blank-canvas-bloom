import React, { useState, useEffect } from "react";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { OP5Fault, Region, District, FaultType } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";
import { useNavigate } from "react-router-dom";

interface OP5FormProps {
  className?: string;
}

export function OP5Form({ className }: OP5FormProps) {
  const { regions, districts, addOP5Fault } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<OP5Fault>>({
    occurrenceDate: new Date().toISOString().split("T")[0],
    restorationDate: new Date().toISOString().split("T")[0],
    affectedPopulation: { rural: 0, urban: 0, metro: 0 },
    reliabilityIndices: { saidi: 0, saifi: 0, caidi: 0 },
  });
  const [regionId, setRegionId] = useState("");
  const [districtId, setDistrictId] = useState("");

  // Initialize region and district based on user role
  useEffect(() => {
    if (user) {
      if (
        user.role === "district_engineer" ||
        user.role === "regional_engineer"
      ) {
        const userRegion = regions.find((r) => r.name === user.region);
        if (userRegion) {
          setRegionId(userRegion.id);
          setFormData((prev) => ({ ...prev, regionId: userRegion.id }));

          if (user.role === "district_engineer" && user.district) {
            const userDistrict = districts.find((d) => d.name === user.district);
            if (userDistrict) {
              setDistrictId(userDistrict.id);
              setFormData((prev) => ({ ...prev, districtId: userDistrict.id }));
            }
          }
        }
      }
    }
  }, [user, regions, districts]);

  // Filter regions and districts based on user role
  const filteredRegions =
    user?.role === "global_engineer"
      ? regions
      : regions.filter((r) => (user?.region ? r.name === user.region : true));

  const filteredDistricts = regionId
    ? districts.filter((d) => {
        const region = regions.find((r) => r.id === regionId);
        return (
          region?.districts.some((rd) => rd.id === d.id) &&
          (user?.role === "district_engineer"
            ? user.district === d.name
            : true)
        );
      })
    : [];

  // Handle region change
  const handleRegionChange = (value: string) => {
    setRegionId(value);
    setFormData((prev) => ({ ...prev, regionId: value }));
    setDistrictId("");
    setFormData((prev) => ({ ...prev, districtId: "" }));
  };

  // Handle district change
  const handleDistrictChange = (value: string) => {
    setDistrictId(value);
    setFormData((prev) => ({ ...prev, districtId: value }));
  };

  const handleInputChange = (
    field: keyof OP5Fault,
    value: string | number | undefined
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePopulationChange = (
    field: keyof typeof formData.affectedPopulation,
    value: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      affectedPopulation: {
        ...prev.affectedPopulation,
        [field]: value,
      },
    }));
  };

  const handleReliabilityIndicesChange = (
    field: keyof typeof formData.reliabilityIndices,
    value: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      reliabilityIndices: {
        ...prev.reliabilityIndices,
        [field]: value,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.regionId ||
      !formData.districtId ||
      !formData.occurrenceDate ||
      !formData.faultType ||
      !formData.faultLocation
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    const faultData: Omit<OP5Fault, "id" | "status"> = {
      regionId: formData.regionId,
      districtId: formData.districtId,
      occurrenceDate: formData.occurrenceDate,
      faultType: formData.faultType as FaultType,
      faultLocation: formData.faultLocation,
      restorationDate: formData.restorationDate,
      affectedPopulation: {
        rural: formData.affectedPopulation?.rural || 0,
        urban: formData.affectedPopulation?.urban || 0,
        metro: formData.affectedPopulation?.metro || 0,
      },
      outrageDuration: Number(formData.outrageDuration) || 0,
      mttr: Number(formData.mttr) || 0,
      reliabilityIndices: {
        saidi: Number(formData.reliabilityIndices?.saidi) || 0,
        saifi: Number(formData.reliabilityIndices?.saifi) || 0,
        caidi: Number(formData.reliabilityIndices?.caidi) || 0,
      },
      createdBy: user?.name || "Anonymous",
      createdAt: new Date().toISOString(),
    };

    addOP5Fault(faultData);
    navigate("/faults");
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>Report OP5 Fault</CardTitle>
        <CardDescription>Submit a new OP5 fault report</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="region">Region</Label>
              <Select
                value={regionId}
                onValueChange={handleRegionChange}
                disabled={
                  user?.role === "district_engineer" ||
                  user?.role === "regional_engineer"
                }
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

            <div>
              <Label htmlFor="district">District</Label>
              <Select
                value={districtId}
                onValueChange={handleDistrictChange}
                disabled={
                  user?.role === "district_engineer" || !regionId
                }
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

            <div>
              <Label htmlFor="occurrenceDate">Occurrence Date</Label>
              <Input
                type="date"
                id="occurrenceDate"
                value={formData.occurrenceDate || ""}
                onChange={(e) =>
                  handleInputChange("occurrenceDate", e.target.value)
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="restorationDate">Restoration Date</Label>
              <Input
                type="date"
                id="restorationDate"
                value={formData.restorationDate || ""}
                onChange={(e) =>
                  handleInputChange("restorationDate", e.target.value)
                }
              />
            </div>
          </div>

          <div>
            <Label htmlFor="faultType">Fault Type</Label>
            <Select
              value={formData.faultType || ""}
              onValueChange={(value) => handleInputChange("faultType", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select fault type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Planned">Planned</SelectItem>
                <SelectItem value="Unplanned">Unplanned</SelectItem>
                <SelectItem value="Emergency">Emergency</SelectItem>
                <SelectItem value="Load Shedding">Load Shedding</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="faultLocation">Fault Location</Label>
            <Input
              type="text"
              id="faultLocation"
              value={formData.faultLocation || ""}
              onChange={(e) =>
                handleInputChange("faultLocation", e.target.value)
              }
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="rural">Rural Population Affected</Label>
              <Input
                type="number"
                id="rural"
                value={formData.affectedPopulation?.rural || 0}
                onChange={(e) =>
                  handlePopulationChange("rural", Number(e.target.value))
                }
              />
            </div>

            <div>
              <Label htmlFor="urban">Urban Population Affected</Label>
              <Input
                type="number"
                id="urban"
                value={formData.affectedPopulation?.urban || 0}
                onChange={(e) =>
                  handlePopulationChange("urban", Number(e.target.value))
                }
              />
            </div>

            <div>
              <Label htmlFor="metro">Metro Population Affected</Label>
              <Input
                type="number"
                id="metro"
                value={formData.affectedPopulation?.metro || 0}
                onChange={(e) =>
                  handlePopulationChange("metro", Number(e.target.value))
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="outrageDuration">Outrage Duration (minutes)</Label>
              <Input
                type="number"
                id="outrageDuration"
                value={formData.outrageDuration || 0}
                onChange={(e) =>
                  handleInputChange("outrageDuration", Number(e.target.value))
                }
              />
            </div>

            <div>
              <Label htmlFor="mttr">MTTR (minutes)</Label>
              <Input
                type="number"
                id="mttr"
                value={formData.mttr || 0}
                onChange={(e) => handleInputChange("mttr", Number(e.target.value))}
              />
            </div>

            <div>
              <Label htmlFor="saidi">SAIDI</Label>
              <Input
                type="number"
                id="saidi"
                value={formData.reliabilityIndices?.saidi || 0}
                onChange={(e) =>
                  handleReliabilityIndicesChange("saidi", Number(e.target.value))
                }
              />
            </div>

            <div>
              <Label htmlFor="saifi">SAIFI</Label>
              <Input
                type="number"
                id="saifi"
                value={formData.reliabilityIndices?.saifi || 0}
                onChange={(e) =>
                  handleReliabilityIndicesChange("saifi", Number(e.target.value))
                }
              />
            </div>

            <div>
              <Label htmlFor="caidi">CAIDI</Label>
              <Input
                type="number"
                id="caidi"
                value={formData.reliabilityIndices?.caidi || 0}
                onChange={(e) =>
                  handleReliabilityIndicesChange("caidi", Number(e.target.value))
                }
              />
            </div>
          </div>

          <Button type="submit">Submit</Button>
        </form>
      </CardContent>
    </Card>
  );
}
