
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
import { LoadMonitoringData } from '@/lib/asset-types';

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
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  // Base Data
  const [regionsData] = useState<Region[]>(regions);
  const [districtsData] = useState<District[]>(districts);
  
  // VIT Data
  const [vitAssetsData, setVitAssetsData] = useState<VITAsset[]>(vitAssets);
  const [vitInspectionsData, setVitInspectionsData] = useState<VITInspectionChecklist[]>(vitInspections);
  
  // Substation Inspection Data
  const [savedInspectionsData, setSavedInspectionsData] = useState<SubstationInspection[]>([]);
  
  // Load Monitoring Data
  const [loadMonitoringData, setLoadMonitoringData] = useState<LoadMonitoringData[]>([]);
  
  // Faults Data
  const [op5FaultsData, setOp5FaultsData] = useState<OP5Fault[]>(op5Faults);
  const [controlSystemOutagesData, setControlSystemOutagesData] = useState<ControlSystemOutage[]>(controlSystemOutages);
  
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
  const saveInspection = useCallback((inspection: SubstationInspection) => {
    setSavedInspectionsData(prev => [...prev, inspection]);
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
  const saveLoadMonitoringRecord = useCallback((record: LoadMonitoringData) => {
    setLoadMonitoringData(prev => [...prev, record]);
  }, []);
  
  const updateLoadMonitoringRecord = useCallback((id: string, updatedRecord: Partial<LoadMonitoringData>) => {
    setLoadMonitoringData(prev => 
      prev.map(record => 
        record.id === id 
          ? { ...record, ...updatedRecord } 
          : record
      )
    );
  }, []);
  
  const deleteLoadMonitoringRecord = useCallback((id: string) => {
    setLoadMonitoringData(prev => prev.filter(record => record.id !== id));
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
      status: 'pending',
      createdBy: user?.name || 'Anonymous',
      createdAt: new Date().toISOString()
    };
    
    setOp5FaultsData(prev => [...prev, newFault]);
  }, [user]);
  
  const saveControlSystemOutage = useCallback((outage: Omit<ControlSystemOutage, 'id' | 'status'>) => {
    const newOutage: ControlSystemOutage = {
      id: uuidv4(),
      ...outage,
      status: 'pending',
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
    getLoadMonitoringRecordById
  };
  
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
