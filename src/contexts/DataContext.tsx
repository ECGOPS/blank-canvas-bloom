import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import regions from '../data/regions.json';
import districts from '../data/districts.json';
import vitAssets from '../data/vit-assets.json';
import vitInspections from '../data/vit-inspections.json';
import op5Faults from '../data/op5-faults.json';
import controlSystemOutages from '../data/control-system-outages.json';
import { useAuth } from './AuthContext';
import { toast } from '@/components/ui/sonner';
import { v4 as uuidv4 } from 'uuid';
import {
  Region, District, VITAsset, VITInspectionChecklist, SubstationInspection,
  InspectionItem, FaultType, OP5Fault, ControlSystemOutage
} from '@/lib/types';
import { supabase } from "@/integrations/supabase/client";
import { LoadMonitoringData, FeederLeg } from '@/lib/asset-types';

interface DistrictPopulation {
  districtId: string;
  rural: number;
  urban: number;
  metro: number;
}

interface DataContextType {
  regions: Region[];
  districts: District[];
  vitAssets: VITAsset[];
  vitInspections: VITInspectionChecklist[];
  savedInspections: SubstationInspection[];
  loadMonitoringRecords: LoadMonitoringData[];
  op5Faults: OP5Fault[];
  controlSystemOutages: ControlSystemOutage[];
  districtPopulations: DistrictPopulation[];
  getDistrictsByRegionId: (regionId: string) => District[];
  saveVITAsset: (asset: VITAsset) => void;
  updateVITAsset: (assetId: string, asset: Partial<VITAsset>) => void;
  deleteVITAsset: (assetId: string) => void;
  saveVITInspection: (inspection: VITInspectionChecklist) => void;
  updateVITInspection: (inspectionId: string, inspection: Partial<VITInspectionChecklist>) => void;
  deleteVITInspection: (inspectionId: string) => void;
  saveInspection: (inspection: SubstationInspection) => void;
  getSavedInspection: (id: string) => SubstationInspection | null;
  updateInspection: (id: string, inspection: Partial<SubstationInspection>) => void;
  deleteInspection: (id: string) => void;
  saveOP5Fault: (fault: Omit<OP5Fault, 'id' | 'status'>) => void;
  saveControlSystemOutage: (outage: Omit<ControlSystemOutage, 'id' | 'status'>) => void;
  saveDistrictPopulation: (population: DistrictPopulation) => void;
  getAssetById: (id: string) => VITAsset | undefined;
  saveLoadMonitoringRecord: (record: LoadMonitoringData) => void;
  updateLoadMonitoringRecord: (id: string, record: Partial<LoadMonitoringData>) => void;
  deleteLoadMonitoringRecord: (id: string) => void;
  getLoadMonitoringRecordById: (id: string) => LoadMonitoringData | null;
  
  // Map old method names to new ones for backward compatibility
  addVITAsset: (asset: Omit<VITAsset, "id" | "createdAt" | "updatedAt" | "createdBy">) => void;
  addVITInspection: (inspection: Omit<VITInspectionChecklist, "id" | "createdBy" | "createdAt">) => void;
  addOP5Fault: (fault: Omit<OP5Fault, "id" | "status" | "createdBy" | "createdAt">) => void;
  addControlOutage: (outage: Omit<ControlSystemOutage, "id" | "status" | "createdBy" | "createdAt">) => void;
  resolveFault: (id: string, type: "op5" | "control") => void;
  deleteFault: (id: string, type: "op5" | "control") => void;
  canEditFault: (fault: OP5Fault | ControlSystemOutage) => boolean;
  updateDistrict: (id: string, updates: Partial<District>) => void;
  getFilteredFaults: (regionId?: string, districtId?: string) => { op5Faults: OP5Fault[], controlOutages: ControlSystemOutage[] };
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  // Base Data
  const [regionsData] = useState<Region[]>(regions as Region[]);
  const [districtsData] = useState<District[]>(districts as District[]);
  
  // VIT Data
  const [vitAssetsData, setVitAssetsData] = useState<VITAsset[]>(vitAssets as VITAsset[]);
  const [vitInspectionsData, setVitInspectionsData] = useState<VITInspectionChecklist[]>(vitInspections as VITInspectionChecklist[]);
  
  // Substation Inspection Data
  const [savedInspectionsData, setSavedInspectionsData] = useState<SubstationInspection[]>([]);
  
  // Load Monitoring Data
  const [loadMonitoringData, setLoadMonitoringData] = useState<LoadMonitoringData[]>([]);
  
  // Faults Data
  const [op5FaultsData, setOp5FaultsData] = useState<OP5Fault[]>(op5Faults as OP5Fault[]);
  const [controlSystemOutagesData, setControlSystemOutagesData] = useState<ControlSystemOutage[]>(controlSystemOutages as ControlSystemOutage[]);
  
  // District Population Data
  const [districtPopulationsData, setDistrictPopulationsData] = useState<DistrictPopulation[]>([]);
  
  // Load data from localStorage on initial load
  useEffect(() => {
    const loadStoredData = () => {
      try {
        // Load VIT assets
        const storedVitAssets = localStorage.getItem('vitAssets');
        if (storedVitAssets) {
          setVitAssetsData(JSON.parse(storedVitAssets));
        }
        
        // Load VIT inspections
        const storedVitInspections = localStorage.getItem('vitInspections');
        if (storedVitInspections) {
          setVitInspectionsData(JSON.parse(storedVitInspections));
        }
        
        // Load saved inspections
        const storedInspections = localStorage.getItem('savedInspections');
        if (storedInspections) {
          setSavedInspectionsData(JSON.parse(storedInspections));
        }
        
        // Load OP5 faults
        const storedOP5Faults = localStorage.getItem('op5Faults');
        if (storedOP5Faults) {
          setOp5FaultsData(JSON.parse(storedOP5Faults));
        }
        
        // Load control system outages
        const storedOutages = localStorage.getItem('controlSystemOutages');
        if (storedOutages) {
          setControlSystemOutagesData(JSON.parse(storedOutages));
        }
        
        // Load district populations
        const storedPopulations = localStorage.getItem('districtPopulations');
        if (storedPopulations) {
          setDistrictPopulationsData(JSON.parse(storedPopulations));
        }
        
        // Load load monitoring records
        const storedLoadMonitoring = localStorage.getItem('loadMonitoringRecords');
        if (storedLoadMonitoring) {
          setLoadMonitoringData(JSON.parse(storedLoadMonitoring));
        }
      } catch (error) {
        console.error('Error loading stored data:', error);
        toast.error('Error loading data from storage');
      }
    };
    
    loadStoredData();
  }, []);
  
  // Update localStorage when data changes
  useEffect(() => {
    localStorage.setItem('vitAssets', JSON.stringify(vitAssetsData));
  }, [vitAssetsData]);
  
  useEffect(() => {
    localStorage.setItem('vitInspections', JSON.stringify(vitInspectionsData));
  }, [vitInspectionsData]);
  
  useEffect(() => {
    localStorage.setItem('savedInspections', JSON.stringify(savedInspectionsData));
  }, [savedInspectionsData]);
  
  useEffect(() => {
    localStorage.setItem('op5Faults', JSON.stringify(op5FaultsData));
  }, [op5FaultsData]);
  
  useEffect(() => {
    localStorage.setItem('controlSystemOutages', JSON.stringify(controlSystemOutagesData));
  }, [controlSystemOutagesData]);
  
  useEffect(() => {
    localStorage.setItem('districtPopulations', JSON.stringify(districtPopulationsData));
  }, [districtPopulationsData]);
  
  useEffect(() => {
    localStorage.setItem('loadMonitoringRecords', JSON.stringify(loadMonitoringData));
  }, [loadMonitoringData]);
  
  const getDistrictsByRegionId = useCallback((regionId: string) => {
    return districtsData.filter(district => district.regionId === regionId);
  }, [districtsData]);
  
  // VIT Asset Methods
  const saveVITAsset = useCallback((asset: VITAsset) => {
    setVitAssetsData(prev => [...prev, asset]);
  }, []);
  
  const updateVITAsset = useCallback((assetId: string, updatedAsset: Partial<VITAsset>) => {
    setVitAssetsData(prev => 
      prev.map(asset => 
        asset.id === assetId 
          ? { ...asset, ...updatedAsset, updatedAt: new Date().toISOString() } 
          : asset
      )
    );
  }, []);
  
  const deleteVITAsset = useCallback((assetId: string) => {
    setVitAssetsData(prev => prev.filter(asset => asset.id !== assetId));
  }, []);
  
  const getAssetById = useCallback((id: string) => {
    return vitAssetsData.find(asset => asset.id === id);
  }, [vitAssetsData]);
  
  // VIT Inspection Methods
  const saveVITInspection = useCallback((inspection: VITInspectionChecklist) => {
    setVitInspectionsData(prev => [...prev, inspection]);
  }, []);
  
  const updateVITInspection = useCallback((inspectionId: string, updatedInspection: Partial<VITInspectionChecklist>) => {
    setVitInspectionsData(prev => 
      prev.map(inspection => 
        inspection.id === inspectionId 
          ? { ...inspection, ...updatedInspection } 
          : inspection
      )
    );
  }, []);
  
  const deleteVITInspection = useCallback((inspectionId: string) => {
    setVitInspectionsData(prev => prev.filter(inspection => inspection.id !== inspectionId));
  }, []);
  
  // Substation Inspection Methods
  const saveInspection = useCallback((inspection: SubstationInspection): string => {
    setSavedInspectionsData(prev => [...prev, inspection]);
    return inspection.id; // Return the ID for reference
  }, []);
  
  const getSavedInspection = useCallback((id: string) => {
    const inspection = savedInspectionsData.find(insp => insp.id === id);
    return inspection || null;
  }, [savedInspectionsData]);
  
  const updateInspection = useCallback((id: string, updatedInspection: Partial<SubstationInspection>) => {
    setSavedInspectionsData(prev => 
      prev.map(inspection => 
        inspection.id === id 
          ? { ...inspection, ...updatedInspection } 
          : inspection
      )
    );
  }, []);
  
  const deleteInspection = useCallback((id: string) => {
    setSavedInspectionsData(prev => prev.filter(inspection => inspection.id !== id));
  }, []);
  
  // Load Monitoring Methods
  const saveLoadMonitoringRecord = useCallback(async (record: LoadMonitoringData) => {
    const { feederLegs, ...fields } = record;
    const insertResult = await supabase.from('load_monitoring').insert({
      id: record.id,
      region_id: record.regionId,
      district_id: record.districtId,
      date: record.date,
      time: record.time,
      substation_number: record.substationNumber,
      substation_name: record.substationName,
      location: record.location,
      rating: record.rating,
      peak_load_status: record.peakLoadStatus,
      red_phase_bulk_load: record.redPhaseBulkLoad,
      yellow_phase_bulk_load: record.yellowPhaseBulkLoad,
      blue_phase_bulk_load: record.bluePhaseBulkLoad,
      average_current: record.averageCurrent,
      percentage_load: record.percentageLoad,
      rated_load: record.ratedLoad,
      ten_percent_full_load_neutral: record.tenPercentFullLoadNeutral,
      calculated_neutral: record.calculatedNeutral,
      created_by: record.createdBy,
      created_at: record.createdAt,
    });
    if (insertResult.error) {
      toast.error("Could not save load monitoring record");
      return;
    }
    const insertedId = record.id; // must match inserted id
    for (const leg of feederLegs) {
      await supabase.from('load_monitoring_feeder_legs').insert({
        load_monitoring_id: insertedId,
        red_phase_current: leg.redPhaseCurrent,
        yellow_phase_current: leg.yellowPhaseCurrent,
        blue_phase_current: leg.bluePhaseCurrent,
        neutral_current: leg.neutralCurrent,
      });
    }
    // Refresh all data
    const fetchLoadMonitoring = async () => {
      const { data, error } = await supabase
        .from('load_monitoring')
        .select(`
          *,
          feeder_legs:load_monitoring_feeder_legs (
            id, red_phase_current, yellow_phase_current, blue_phase_current, neutral_current
          )
        `)
        .order('created_at', { ascending: false });
      if (error) {
        console.error("Failed to load load monitoring records", error);
        toast.error("Could not load load monitoring records from server");
        setLoadMonitoringData([]);
        return;
      }
      // Adapt data to client type
      setLoadMonitoringData((data || []).map((row: any) => ({
        id: row.id,
        regionId: row.region_id,
        districtId: row.district_id,
        date: row.date,
        time: row.time,
        substationNumber: row.substation_number,
        substationName: row.substation_name,
        location: row.location,
        rating: Number(row.rating),
        peakLoadStatus: row.peak_load_status,
        redPhaseBulkLoad: Number(row.red_phase_bulk_load),
        yellowPhaseBulkLoad: Number(row.yellow_phase_bulk_load),
        bluePhaseBulkLoad: Number(row.blue_phase_bulk_load),
        averageCurrent: Number(row.average_current),
        percentageLoad: Number(row.percentage_load),
        ratedLoad: Number(row.rated_load),
        tenPercentFullLoadNeutral: Number(row.ten_percent_full_load_neutral),
        calculatedNeutral: Number(row.calculated_neutral),
        feederLegs: (row.feeder_legs || []).map((leg: any) => ({
          id: leg.id,
          redPhaseCurrent: Number(leg.red_phase_current),
          yellowPhaseCurrent: Number(leg.yellow_phase_current),
          bluePhaseCurrent: Number(leg.blue_phase_current),
          neutralCurrent: Number(leg.neutral_current),
        })),
        createdBy: row.created_by,
        createdAt: row.created_at
      })));
    };
    fetchLoadMonitoring();
  }, []);
  
  const updateLoadMonitoringRecord = useCallback(async (id: string, record: Partial<LoadMonitoringData>) => {
    await supabase
    .from('load_monitoring')
    .update({
      region_id: record.regionId,
      district_id: record.districtId,
      date: record.date,
      time: record.time,
      substation_number: record.substationNumber,
      substation_name: record.substationName,
      location: record.location,
      rating: record.rating,
      peak_load_status: record.peakLoadStatus,
      red_phase_bulk_load: record.redPhaseBulkLoad,
      yellow_phase_bulk_load: record.yellowPhaseBulkLoad,
      blue_phase_bulk_load: record.bluePhaseBulkLoad,
      average_current: record.averageCurrent,
      percentage_load: record.percentageLoad,
      rated_load: record.ratedLoad,
      ten_percent_full_load_neutral: record.tenPercentFullLoadNeutral,
      calculated_neutral: record.calculatedNeutral,
    })
    .eq('id', id);
    
    const fetchLoadMonitoring = async () => {
      const { data, error } = await supabase
        .from('load_monitoring')
        .select(`
          *,
          feeder_legs:load_monitoring_feeder_legs (
            id, red_phase_current, yellow_phase_current, blue_phase_current, neutral_current
          )
        `)
        .order('created_at', { ascending: false });
      if (error) {
        console.error("Failed to load load monitoring records", error);
        toast.error("Could not load load monitoring records from server");
        setLoadMonitoringData([]);
        return;
      }
      // Adapt data to client type
      setLoadMonitoringData((data || []).map((row: any) => ({
        id: row.id,
        regionId: row.region_id,
        districtId: row.district_id,
        date: row.date,
        time: row.time,
        substationNumber: row.substation_number,
        substationName: row.substation_name,
        location: row.location,
        rating: Number(row.rating),
        peakLoadStatus: row.peak_load_status,
        redPhaseBulkLoad: Number(row.red_phase_bulk_load),
        yellowPhaseBulkLoad: Number(row.yellow_phase_bulk_load),
        bluePhaseBulkLoad: Number(row.blue_phase_bulk_load),
        averageCurrent: Number(row.average_current),
        percentageLoad: Number(row.percentage_load),
        ratedLoad: Number(row.rated_load),
        tenPercentFullLoadNeutral: Number(row.ten_percent_full_load_neutral),
        calculatedNeutral: Number(row.calculated_neutral),
        feederLegs: (row.feeder_legs || []).map((leg: any) => ({
          id: leg.id,
          redPhaseCurrent: Number(leg.red_phase_current),
          yellowPhaseCurrent: Number(leg.yellow_phase_current),
          bluePhaseCurrent: Number(leg.blue_phase_current),
          neutralCurrent: Number(leg.neutral_current),
        })),
        createdBy: row.created_by,
        createdAt: row.created_at
      })));
    };
    fetchLoadMonitoring();
  }, []);
  
  const deleteLoadMonitoringRecord = useCallback(async (id: string) => {
    await supabase.from('load_monitoring').delete().eq('id', id);
    const fetchLoadMonitoring = async () => {
      const { data, error } = await supabase
        .from('load_monitoring')
        .select(`
          *,
          feeder_legs:load_monitoring_feeder_legs (
            id, red_phase_current, yellow_phase_current, blue_phase_current, neutral_current
          )
        `)
        .order('created_at', { ascending: false });
      if (error) {
        console.error("Failed to load load monitoring records", error);
        toast.error("Could not load load monitoring records from server");
        setLoadMonitoringData([]);
        return;
      }
      // Adapt data to client type
      setLoadMonitoringData((data || []).map((row: any) => ({
        id: row.id,
        regionId: row.region_id,
        districtId: row.district_id,
        date: row.date,
        time: row.time,
        substationNumber: row.substation_number,
        substationName: row.substation_name,
        location: row.location,
        rating: Number(row.rating),
        peakLoadStatus: row.peak_load_status,
        redPhaseBulkLoad: Number(row.red_phase_bulk_load),
        yellowPhaseBulkLoad: Number(row.yellow_phase_bulk_load),
        bluePhaseBulkLoad: Number(row.blue_phase_bulk_load),
        averageCurrent: Number(row.average_current),
        percentageLoad: Number(row.percentage_load),
        ratedLoad: Number(row.rated_load),
        tenPercentFullLoadNeutral: Number(row.ten_percent_full_load_neutral),
        calculatedNeutral: Number(row.calculated_neutral),
        feederLegs: (row.feeder_legs || []).map((leg: any) => ({
          id: leg.id,
          redPhaseCurrent: Number(leg.red_phase_current),
          yellowPhaseCurrent: Number(leg.yellow_phase_current),
          bluePhaseCurrent: Number(leg.blue_phase_current),
          neutralCurrent: Number(leg.neutral_current),
        })),
        createdBy: row.created_by,
        createdAt: row.created_at
      })));
    };
    fetchLoadMonitoring();
  }, []);
  
  const getLoadMonitoringRecordById = useCallback((id: string) => {
    const record = loadMonitoringData.find(rec => rec.id === id);
    return record || null;
  }, [loadMonitoringData]);
  
  // Fault Reporting Methods
  const saveOP5Fault = useCallback((fault: Omit<OP5Fault, 'id' | 'status'>) => {
    const newFault: OP5Fault = {
      id: uuidv4(),
      ...fault,
      status: 'active', // Change from 'pending' to 'active' to match the allowed status types
      createdBy: user?.name || 'Anonymous',
      createdAt: new Date().toISOString()
    };
    
    setOp5FaultsData(prev => [...prev, newFault]);
  }, [user]);
  
  const saveControlSystemOutage = useCallback((outage: Omit<ControlSystemOutage, 'id' | 'status'>) => {
    const newOutage: ControlSystemOutage = {
      id: uuidv4(),
      ...outage,
      status: 'active', // Change from 'pending' to 'active' to match the allowed status types
      createdBy: user?.name || 'Anonymous',
      createdAt: new Date().toISOString()
    };
    
    setControlSystemOutagesData(prev => [...prev, newOutage]);
  }, [user]);
  
  // District Population Methods
  const saveDistrictPopulation = useCallback((population: DistrictPopulation) => {
    // First, check if there's already population data for this district
    const existingIndex = districtPopulationsData.findIndex(p => p.districtId === population.districtId);
    
    if (existingIndex >= 0) {
      // Update existing population data
      setDistrictPopulationsData(prev => {
        const updatedPopulations = [...prev];
        updatedPopulations[existingIndex] = population;
        return updatedPopulations;
      });
    } else {
      // Add new population data
      setDistrictPopulationsData(prev => [...prev, population]);
    }
  }, [districtPopulationsData]);

  const addVITAsset = useCallback((asset: Omit<VITAsset, "id" | "createdAt" | "updatedAt" | "createdBy">) => {
    const newAsset: VITAsset = {
      id: uuidv4(),
      ...asset,
      createdBy: user?.name || 'Anonymous',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    saveVITAsset(newAsset);
  }, [saveVITAsset, user]);

  const addVITInspection = useCallback((inspection: Omit<VITInspectionChecklist, "id" | "createdBy" | "createdAt">) => {
    const newInspection: VITInspectionChecklist = {
      id: uuidv4(),
      ...inspection,
      createdBy: user?.name || 'Anonymous',
      createdAt: new Date().toISOString()
    };
    saveVITInspection(newInspection);
  }, [saveVITInspection, user]);

  // Fix the addOP5Fault method to handle the type correctly
  const addOP5Fault = useCallback((fault: Omit<OP5Fault, "id" | "status" | "createdBy" | "createdAt">) => {
    const newFault: OP5Fault = {
      id: uuidv4(),
      ...fault,
      status: 'active',
      createdBy: user?.name || 'Anonymous',
      createdAt: new Date().toISOString()
    };
    setOp5FaultsData(prev => [...prev, newFault]);
  }, [user]);

  // Fix the addControlOutage method to handle the type correctly
  const addControlOutage = useCallback((outage: Omit<ControlSystemOutage, "id" | "status" | "createdBy" | "createdAt">) => {
    const newOutage: ControlSystemOutage = {
      id: uuidv4(),
      ...outage,
      status: 'active',
      createdBy: user?.name || 'Anonymous',
      createdAt: new Date().toISOString()
    };
    setControlSystemOutagesData(prev => [...prev, newOutage]);
  }, [user]);

  // Add these methods for compatibility
  const resolveFault = useCallback((id: string, type: "op5" | "control") => {
    if (type === "op5") {
      setOp5FaultsData(prev => 
        prev.map(fault => 
          fault.id === id 
            ? { ...fault, status: 'resolved' } 
            : fault
        )
      );
    } else {
      setControlSystemOutagesData(prev => 
        prev.map(outage => 
          outage.id === id 
            ? { ...outage, status: 'resolved' } 
            : outage
        )
      );
    }
  }, []);

  const deleteFault = useCallback((id: string, type: "op5" | "control") => {
    if (type === "op5") {
      setOp5FaultsData(prev => prev.filter(fault => fault.id !== id));
    } else {
      setControlSystemOutagesData(prev => prev.filter(outage => outage.id !== id));
    }
  }, []);

  const canEditFault = useCallback((fault: OP5Fault | ControlSystemOutage) => {
    if (!user) return false;
    if (user.role === "global_engineer") return true;
    
    if (user.role === "regional_engineer") {
      return fault.regionId === regionsData.find(r => r.name === user.region)?.id;
    }
    
    if (user.role === "district_engineer") {
      return fault.districtId === districtsData.find(d => d.name === user.district)?.id;
    }
    
    return false;
  }, [user, regionsData, districtsData]);

  const updateDistrict = useCallback((id: string, updates: Partial<District>) => {
    // Implementation would update districts
    console.log("Updating district", id, updates);
  }, []);

  const getFilteredFaults = useCallback((regionId?: string, districtId?: string) => {
    let filteredOP5 = [...op5FaultsData];
    let filteredControl = [...controlSystemOutagesData];
    
    if (regionId) {
      filteredOP5 = filteredOP5.filter(fault => fault.regionId === regionId);
      filteredControl = filteredControl.filter(outage => outage.regionId === regionId);
    }
    
    if (districtId) {
      filteredOP5 = filteredOP5.filter(fault => fault.districtId === districtId);
      filteredControl = filteredControl.filter(outage => outage.districtId === districtId);
    }
    
    return { op5Faults: filteredOP5, controlOutages: filteredControl };
  }, [op5FaultsData, controlSystemOutagesData]);
  
  const value = {
    regions: regionsData,
    districts: districtsData,
    vitAssets: vitAssetsData,
    vitInspections: vitInspectionsData,
    savedInspections: savedInspectionsData,
    loadMonitoringRecords: loadMonitoringData,
    op5Faults: op5FaultsData,
    controlSystemOutages: controlSystemOutagesData,
    districtPopulations: districtPopulationsData,
    getDistrictsByRegionId,
    saveVITAsset,
    updateVITAsset,
    deleteVITAsset,
    saveVITInspection,
    updateVITInspection,
    deleteVITInspection,
    saveInspection,
    getSavedInspection,
    updateInspection,
    deleteInspection,
    saveOP5Fault,
    saveControlSystemOutage,
    saveDistrictPopulation,
    getAssetById,
    saveLoadMonitoringRecord,
    updateLoadMonitoringRecord,
    deleteLoadMonitoringRecord,
    getLoadMonitoringRecordById,
    
    // Add compatibility methods
    addVITAsset,
    addVITInspection,
    addOP5Fault,
    addControlOutage,
    resolveFault,
    deleteFault,
    canEditFault,
    updateDistrict,
    getFilteredFaults
  };

  useEffect(() => {
    const fetchLoadMonitoring = async () => {
      const { data, error } = await supabase
        .from('load_monitoring')
        .select(`
          *,
          feeder_legs:load_monitoring_feeder_legs (
            id, red_phase_current, yellow_phase_current, blue_phase_current, neutral_current
          )
        `)
        .order('created_at', { ascending: false });
      if (error) {
        console.error("Failed to load load monitoring records", error);
        toast.error("Could not load load monitoring records from server");
        setLoadMonitoringData([]);
        return;
      }
      // Adapt data to client type
      setLoadMonitoringData((data || []).map((row: any) => ({
        id: row.id,
        regionId: row.region_id,
        districtId: row.district_id,
        date: row.date,
        time: row.time,
        substationNumber: row.substation_number,
        substationName: row.substation_name,
        location: row.location,
        rating: Number(row.rating),
        peakLoadStatus: row.peak_load_status,
        redPhaseBulkLoad: Number(row.red_phase_bulk_load),
        yellowPhaseBulkLoad: Number(row.yellow_phase_bulk_load),
        bluePhaseBulkLoad: Number(row.blue_phase_bulk_load),
        averageCurrent: Number(row.average_current),
        percentageLoad: Number(row.percentage_load),
        ratedLoad: Number(row.rated_load),
        tenPercentFullLoadNeutral: Number(row.ten_percent_full_load_neutral),
        calculatedNeutral: Number(row.calculated_neutral),
        feederLegs: (row.feeder_legs || []).map((leg: any) => ({
          id: leg.id,
          redPhaseCurrent: Number(leg.red_phase_current),
          yellowPhaseCurrent: Number(leg.yellow_phase_current),
          bluePhaseCurrent: Number(leg.blue_phase_current),
          neutralCurrent: Number(leg.neutral_current),
        })),
        createdBy: row.created_by,
        createdAt: row.created_at
      })));
    };
    fetchLoadMonitoring();
  }, []);
  
  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
