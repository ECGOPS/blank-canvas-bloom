import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Region, District, ControlSystemOutage, FaultType } from "@/lib/types";

const formSchema = z.object({
  regionId: z.string().min(1, {
    message: "You must select a region.",
  }),
  districtId: z.string().min(1, {
    message: "You must select a district.",
  }),
  occurrenceDate: z.string().min(1, {
    message: "Please select the outage date.",
  }),
  restorationDate: z.string().optional(),
  faultType: z.string().min(1, {
    message: "Please select the fault type.",
  }),
  reason: z.string().optional(),
  controlPanelIndications: z.string().optional(),
  areaAffected: z.string().optional(),
  loadMW: z.string().refine(value => !isNaN(Number(value)), {
    message: "Load must be a number.",
  }),
  unservedEnergyMWh: z.string().refine(value => !isNaN(Number(value)), {
    message: "Unserved energy must be a number.",
  }),
  customersAffected: z.object({
    rural: z.string().refine(value => !isNaN(Number(value)), {
      message: "Rural must be a number.",
    }),
    urban: z.string().refine(value => !isNaN(Number(value)), {
      message: "Urban must be a number.",
    }),
    metro: z.string().refine(value => !isNaN(Number(value)), {
      message: "Metro must be a number.",
    }),
  }),
});

export function ControlSystemOutageForm() {
  const { user } = useAuth();
  const { regions, districts, addControlOutage } = useData();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [regionId, setRegionId] = useState("");
  const [districtId, setDistrictId] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      regionId: "",
      districtId: "",
      occurrenceDate: new Date().toISOString().split('T')[0],
      restorationDate: "",
      faultType: "Unplanned",
      reason: "",
      controlPanelIndications: "",
      areaAffected: "",
      loadMW: "0",
      unservedEnergyMWh: "0",
      customersAffected: {
        rural: "0",
        urban: "0",
        metro: "0",
      },
    },
  });

  // Initialize region and district based on user role
  useEffect(() => {
    if (user) {
      if (user.role === "district_engineer" || user.role === "regional_engineer") {
        const userRegion = regions.find(r => r.name === user.region);
        if (userRegion) {
          setRegionId(userRegion.id);
          form.setValue("regionId", userRegion.id);
          
          if (user.role === "district_engineer" && user.district) {
            const userDistrict = districts.find(d => d.name === user.district);
            if (userDistrict) {
              setDistrictId(userDistrict.id);
              form.setValue("districtId", userDistrict.id);
            }
          }
        }
      }
    }
  }, [user, regions, districts, form]);

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
    form.setValue("regionId", value);
    setDistrictId("");
    form.setValue("districtId", "");
  };

  // Handle district change
  const handleDistrictChange = (value: string) => {
    setDistrictId(value);
    form.setValue("districtId", value);
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    const outageData: Omit<ControlSystemOutage, "id" | "status"> = {
      regionId: values.regionId,
      districtId: values.districtId,
      occurrenceDate: values.occurrenceDate,
      faultType: values.faultType as FaultType,
      restorationDate: values.restorationDate || "",
      customersAffected: {
        rural: Number(values.customersAffected.rural) || 0,
        urban: Number(values.customersAffected.urban) || 0,
        metro: Number(values.customersAffected.metro) || 0
      },
      reason: values.reason || "",
      controlPanelIndications: values.controlPanelIndications || "",
      areaAffected: values.areaAffected || "",
      loadMW: Number(values.loadMW) || 0,
      unservedEnergyMWh: Number(values.unservedEnergyMWh) || 0,
      createdBy: user?.name || "Anonymous",
      createdAt: new Date().toISOString()
    };
    
    addControlOutage(outageData);
    navigate("/fault-reporting");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Control System Outage</CardTitle>
        <CardDescription>
          Submit a new control system outage report
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="regionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Region</FormLabel>
                    <Select
                      onValueChange={handleRegionChange}
                      defaultValue={field.value}
                      disabled={user?.role === "district_engineer" || user?.role === "regional_engineer"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a region" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredRegions.map((region) => (
                          <SelectItem key={region.id} value={region.id}>
                            {region.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Please select the region where the outage occurred.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="districtId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>District</FormLabel>
                    <Select
                      onValueChange={handleDistrictChange}
                      defaultValue={field.value}
                      disabled={user?.role === "district_engineer" || !regionId}
                    >
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
                    <FormDescription>
                      Please select the district where the outage occurred.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="occurrenceDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Outage Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormDescription>
                    Please enter the date when the outage occurred.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="restorationDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Restoration Date (Optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormDescription>
                    Please enter the date when the system was restored.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="faultType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fault Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a fault type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Planned">Planned</SelectItem>
                      <SelectItem value="Unplanned">Unplanned</SelectItem>
                      <SelectItem value="Emergency">Emergency</SelectItem>
                      <SelectItem value="Load Shedding">Load Shedding</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Please select the type of fault.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason (Optional)</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormDescription>
                    Please provide the reason for the outage.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="controlPanelIndications"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Control Panel Indications (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Control panel indications"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Please provide any relevant control panel indications.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="areaAffected"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Area Affected (Optional)</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormDescription>
                    Please specify the area affected by the outage.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="loadMW"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Load (MW)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0.0" {...field} />
                    </FormControl>
                    <FormDescription>
                      Please enter the load in megawatts.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unservedEnergyMWh"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unserved Energy (MWh)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0.0" {...field} />
                    </FormControl>
                    <FormDescription>
                      Please enter the unserved energy in megawatt-hours.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <p className="text-sm font-medium">Customers Affected</p>
            <FormDescription>
              Please enter the number of customers affected in each area.
            </FormDescription>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="customersAffected.rural"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rural</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customersAffected.urban"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Urban</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customersAffected.metro"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Metro</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit">Submit Report</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
