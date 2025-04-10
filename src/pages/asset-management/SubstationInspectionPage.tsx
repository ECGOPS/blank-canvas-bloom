import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';
import { ChevronLeft, Save, XCircle, CheckCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { SubstationInspection, InspectionCategory, InspectionItem } from '@/lib/types';
import { exportSubstationInspectionToCsv, exportSubstationInspectionToPDF } from '@/utils/pdfExport';

const formSchema = z.object({
  substationNo: z.string().min(2, {
    message: "Substation number must be at least 2 characters.",
  }),
  substationName: z.string().optional(),
  region: z.string().min(2, {
    message: "Region is required",
  }),
  district: z.string().min(2, {
    message: "District is required",
  }),
  date: z.string(),
  type: z.enum(["routine", "preventive", "corrective"]),
  isEmergency: z.boolean().default(false),
  items: z.array(
    z.object({
      name: z.string(),
      status: z.enum(["good", "bad"]),
      remarks: z.string().optional(),
    })
  ).optional(),
})

export default function SubstationInspectionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { regions, districts, substationInspections, addSubstationInspection, updateSubstationInspection } = useData();

  const [inspection, setInspection] = useState<SubstationInspection | null>(null);
  const [categories, setCategories] = useState<InspectionCategory[]>([
    {
      id: "category-1",
      name: "Transformers",
      category: "Transformers",
      items: [
        { id: "item-1", name: "Oil Level", status: "good", remarks: "" },
        { id: "item-2", name: "Bushings Condition", status: "good", remarks: "" },
      ],
    },
    {
      id: "category-2",
      name: "Switchgear",
      category: "Switchgear",
      items: [
        { id: "item-3", name: "Breaker Operation", status: "good", remarks: "" },
        { id: "item-4", name: "Insulation", status: "good", remarks: "" },
      ],
    },
  ]);
  const [isNew, setIsNew] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      substationNo: '',
      substationName: '',
      region: '',
      district: '',
      date: new Date().toISOString().split('T')[0],
      type: "routine",
      isEmergency: false,
      items: []
    },
  })

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      const foundInspection = substationInspections.find(insp => insp.id === id);
      if (foundInspection) {
        setInspection(foundInspection);
        form.reset(foundInspection);
        setCategories(foundInspection.items);
        setIsNew(false);
      } else {
        setIsNew(true);
      }
      setIsLoading(false);
    } else {
      setIsNew(true);
      setIsLoading(false);
    }
  }, [id, substationInspections, form]);

  const handleStatusChange = (categoryIndex: number, itemIndex: number, status: "good" | "bad") => {
    setCategories(prevCategories => {
      const newCategories = [...prevCategories];
      newCategories[categoryIndex].items[itemIndex].status = status;
      return newCategories;
    });
  };

  const handleRemarksChange = (categoryIndex: number, itemIndex: number, remarks: string) => {
    setCategories(prevCategories => {
      const newCategories = [...prevCategories];
      newCategories[categoryIndex].items[itemIndex].remarks = remarks;
      return newCategories;
    });
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    try {
      const inspectionData: SubstationInspection = {
        id: id || Date.now().toString(),
        ...values,
        items: categories,
        createdAt: new Date().toISOString(),
        createdBy: "test"
      };

      if (isNew) {
        addSubstationInspection(inspectionData);
        toast.success("Substation inspection created successfully");
      } else {
        updateSubstationInspection(inspectionData);
        toast.success("Substation inspection updated successfully");
      }

      navigate("/asset-management/substation-inspection-management");
    } catch (error) {
      toast.error("Error saving inspection. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <p>Loading inspection data...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/asset-management/substation-inspection-management")}
          className="mb-4"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Inspections
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">
            {isNew ? "New Substation Inspection" : "Edit Substation Inspection"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isNew ? "Create a new inspection record" : "Update inspection details"}
          </p>
        </div>

        <Card className="bg-white rounded-lg border shadow-sm">
          <CardHeader>
            <CardTitle>Substation Details</CardTitle>
            <CardDescription>Enter the substation details</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="substationNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Substation Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Substation Number" {...field} />
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
                          <Input placeholder="Substation Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Region</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a region" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {regions.map((region) => (
                              <SelectItem key={region.id} value={region.name}>{region.name}</SelectItem>
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
                        <FormLabel>District</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a district" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {districts.map((district) => (
                              <SelectItem key={district.id} value={district.name}>{district.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
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
                        <FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="routine">Routine</SelectItem>
                            <SelectItem value="preventive">Preventive</SelectItem>
                            <SelectItem value="corrective">Corrective</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='flex items-center space-x-2'>
                  <FormField
                    control={form.control}
                    name="isEmergency"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            {...field}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          Emergency
                        </FormLabel>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  {categories.map((category, categoryIndex) => (
                    <div key={categoryIndex} className="mb-6">
                      <h3 className="text-lg font-medium mb-2">{category.name}</h3>
                      <div className="bg-white rounded-md p-4 border">
                        <div className="space-y-4">
                          {category.items.map((item, itemIndex) => (
                            <ChecklistItem
                              key={itemIndex}
                              item={item}
                              onStatusChange={(status) => handleStatusChange(categoryIndex, itemIndex, status)}
                              onRemarksChange={(remarks) => handleRemarksChange(categoryIndex, itemIndex, remarks)}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button type="submit">
                  {isNew ? "Create Inspection" : "Update Inspection"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

interface ChecklistItemProps {
  item: InspectionItem;
  onStatusChange: (status: any) => void;
  onRemarksChange: (remarks: any) => void;
}

function ChecklistItem({ item, onStatusChange, onRemarksChange }: ChecklistItemProps) {
  return (
    <div className="grid grid-cols-3 gap-4 items-center">
      <div>{item.name}</div>
      <Select defaultValue={item.status} onValueChange={onStatusChange}>
        <SelectTrigger>
          <SelectValue placeholder={item.status} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="good">Good</SelectItem>
          <SelectItem value="bad">Bad</SelectItem>
        </SelectContent>
      </Select>
      <Textarea
        placeholder="Remarks"
        defaultValue={item.remarks}
        onBlur={(e) => onRemarksChange(e.target.value)}
      />
    </div>
  );
}
