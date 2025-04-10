import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import regionsData from '../data/regions.json';
import districtsData from '../data/districts.json';
import vitAssetsData from '../data/vit-assets.json';
import vitInspectionsData from '../data/vit-inspections.json';
import { VITAsset, VITInspectionChecklist, SubstationInspection, OP5Fault, ControlSystemOutage } from '@/lib/types';
import { LoadMonitoringData } from '@/lib/asset-types';

// Extended type definitions to match component usage
interface Region {
  id: string;
  name: string;
  districts: { id: string; name: string }[];
}

interface District {
  id: string;
  name: string;
  regionId: string;
  population: {
    rural: number;
    urban: number;
    metro: number;
  };
}

interface DataContextType {
  regions: Region[];
  districts: District[];
  vitAssets: VITAsset[];
  vitInspections: VITInspectionChecklist[];
  substationInspections: SubstationInspection[];
  loadMonitoringData: LoadMonitoringData[];
  addVITAsset: (asset: VITAsset) => void;
  updateVITAsset: (asset: VITAsset) => void;
  deleteVITAsset: (id: string) => void;
  addVITInspection: (inspection: VITInspectionChecklist) => void;
  updateVITInspection: (inspection: VITInspectionChecklist) => void;
  deleteVITInspection: (id: string) => void;
  addSubstationInspection: (inspection: SubstationInspection) => void;
  updateSubstationInspection: (inspection: SubstationInspection) => void;
  deleteSubstationInspection: (id: string) => void;
  addLoadMonitoring: (data: LoadMonitoringData) => void;
  updateLoadMonitoring: (data: LoadMonitoringData) => void;
  deleteLoadMonitoring: (id: string) => void;
  
  // Additional functions needed by components
  saveInspection: (inspection: SubstationInspection) => void;
  getSavedInspection: (id: string) => SubstationInspection | undefined;
  updateInspection: (inspection: SubstationInspection) => void;
  deleteInspection: (id: string) => void;
  savedInspections: SubstationInspection[];
  updateDistrict: (id: string, data: Partial<{ population: { rural: number; urban: number; metro: number } }>) => void;
  getFilteredFaults: (regionId?: string, districtId?: string) => { op5Faults: OP5Fault[], controlOutages: ControlSystemOutage[] };
  addOP5Fault: (fault: Omit<OP5Fault, "id" | "status">) => void;
  addControlOutage: (outage: Omit<ControlSystemOutage, "id" | "status">) => void;
  resolveFault: (id: string, type: "op5" | "control") => void;
  deleteFault: (id: string, type: "op5" | "control") => void;
  canEditFault: (fault: OP5Fault | ControlSystemOutage) => boolean;
}

// Create the context with a default value
const DataContext = createContext<DataContextType>({
  regions: [],
  districts: [],
  vitAssets: [],
  vitInspections: [],
  substationInspections: [],
  loadMonitoringData: [],
  addVITAsset: () => {},
  updateVITAsset: () => {},
  deleteVITAsset: () => {},
  addVITInspection: () => {},
  updateVITInspection: () => {},
  deleteVITInspection: () => {},
  addSubstationInspection: () => {},
  updateSubstationInspection: () => {},
  deleteSubstationInspection: () => {},
  addLoadMonitoring: () => {},
  updateLoadMonitoring: () => {},
  deleteLoadMonitoring: () => {},
  
  // Additional functions needed by components
  saveInspection: () => {},
  getSavedInspection: () => undefined,
  updateInspection: () => {},
  deleteInspection: () => {},
  savedInspections: [],
  updateDistrict: () => {},
  getFilteredFaults: () => ({ op5Faults: [], controlOutages: [] }),
  addOP5Fault: () => {},
  addControlOutage: () => {},
  resolveFault: () => {},
  deleteFault: () => {},
  canEditFault: () => false,
});

// Create a provider component
export const DataProvider = ({ children }: { children: ReactNode }) => {
  // State for regions and districts with extended types
  const [regions, setRegions] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  
  // State for VIT assets and inspections
  const [vitAssets, setVITAssets] = useState<VITAsset[]>([]);
  const [vitInspections, setVITInspections] = useState<VITInspectionChecklist[]>([]);
  
  // State for substation inspections
  const [substationInspections, setSubstationInspections] = useState<SubstationInspection[]>([]);

  // State for load monitoring data
  const [loadMonitoringData, setLoadMonitoringData] = useState<LoadMonitoringData[]>([]);

  // State for faults
  const [op5Faults, setOP5Faults] = useState<OP5Fault[]>([]);
  const [controlOutages, setControlOutages] = useState<ControlSystemOutage[]>([]);

  // Initialize data on mount
  useEffect(() => {
    // Initialize regions with districts property
    const enhancedRegions = regionsData.map(region => ({
      ...region,
      districts: districtsData.filter(district => district.regionId === region.id)
    }));
    setRegions(enhancedRegions);

    // Initialize districts with population property
    const enhancedDistricts = districtsData.map(district => ({
      ...district,
      population: {
        rural: 0,
        urban: 0,
        metro: 0
      }
    }));
    setDistricts(enhancedDistricts);
    
    // Load VIT assets
    const storedVITAssets = localStorage.getItem('vitAssets');
    if (storedVITAssets) {
      setVITAssets(JSON.parse(storedVITAssets));
    } else {
      setVITAssets(vitAssetsData as VITAsset[]);
    }
    
    // Load VIT inspections
    const storedVITInspections = localStorage.getItem('vitInspections');
    if (storedVITInspections) {
      setVITInspections(JSON.parse(storedVITInspections));
    } else {
      setVITInspections(vitInspectionsData as VITInspectionChecklist[]);
    }
    
    // Load substation inspections
    const storedSubstationInspections = localStorage.getItem('substationInspections');
    if (storedSubstationInspections) {
      setSubstationInspections(JSON.parse(storedSubstationInspections));
    } else {
      setSubstationInspections([]);
    }
    
    // Load load monitoring data
    const storedLoadMonitoringData = localStorage.getItem('loadMonitoringData');
    if (storedLoadMonitoringData) {
      setLoadMonitoringData(JSON.parse(storedLoadMonitoringData));
    } else {
      setLoadMonitoringData([]);
    }

    // Load faults
    const storedOP5Faults = localStorage.getItem('op5Faults');
    if (storedOP5Faults) {
      setOP5Faults(JSON.parse(storedOP5Faults));
    } else {
      setOP5Faults([]);
    }

    const storedControlOutages = localStorage.getItem('controlOutages');
    if (storedControlOutages) {
      setControlOutages(JSON.parse(storedControlOutages));
    } else {
      setControlOutages([]);
    }
  }, []);

  // Save data to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('vitAssets', JSON.stringify(vitAssets));
  }, [vitAssets]);
  
  useEffect(() => {
    localStorage.setItem('vitInspections', JSON.stringify(vitInspections));
  }, [vitInspections]);
  
  useEffect(() => {
    localStorage.setItem('substationInspections', JSON.stringify(substationInspections));
  }, [substationInspections]);
  
  useEffect(() => {
    localStorage.setItem('loadMonitoringData', JSON.stringify(loadMonitoringData));
  }, [loadMonitoringData]);

  useEffect(() => {
    localStorage.setItem('op5Faults', JSON.stringify(op5Faults));
  }, [op5Faults]);

  useEffect(() => {
    localStorage.setItem('controlOutages', JSON.stringify(controlOutages));
  }, [controlOutages]);

  // CRUD operations for VIT assets
  const addVITAsset = (asset: VITAsset) => {
    setVITAssets(prev => [...prev, asset]);
  };
  
  const updateVITAsset = (asset: VITAsset) => {
    setVITAssets(prev => prev.map(a => a.id === asset.id ? asset : a));
  };
  
  const deleteVITAsset = (id: string) => {
    setVITAssets(prev => prev.filter(asset => asset.id !== id));
  };

  // CRUD operations for VIT inspections
  const addVITInspection = (inspection: VITInspectionChecklist) => {
    setVITInspections(prev => [...prev, inspection]);
  };
  
  const updateVITInspection = (inspection: VITInspectionChecklist) => {
    setVITInspections(prev => prev.map(i => i.id === inspection.id ? inspection : i));
  };
  
  const deleteVITInspection = (id: string) => {
    setVITInspections(prev => prev.filter(inspection => inspection.id !== id));
  };

  // CRUD operations for substation inspections
  const addSubstationInspection = (inspection: SubstationInspection) => {
    setSubstationInspections(prev => [...prev, inspection]);
  };
  
  const updateSubstationInspection = (inspection: SubstationInspection) => {
    setSubstationInspections(prev => prev.map(i => i.id === inspection.id ? inspection : i));
  };
  
  const deleteSubstationInspection = (id: string) => {
    setSubstationInspections(prev => prev.filter(inspection => inspection.id !== id));
  };

  // CRUD operations for load monitoring data
  const addLoadMonitoring = (data: LoadMonitoringData) => {
    setLoadMonitoringData(prev => [...prev, data]);
  };
  
  const updateLoadMonitoring = (data: LoadMonitoringData) => {
    setLoadMonitoringData(prev => prev.map(d => d.id === data.id ? data : d));
  };
  
  const deleteLoadMonitoring = (id: string) => {
    setLoadMonitoringData(prev => prev.filter(data => data.id !== id));
  };

  // Additional functions needed by components
  const saveInspection = (inspection: SubstationInspection) => {
    addSubstationInspection(inspection);
  };

  const getSavedInspection = (id: string) => {
    return substationInspections.find(inspection => inspection.id === id);
  };

  const updateInspection = (inspection: SubstationInspection) => {
    updateSubstationInspection(inspection);
  };

  const deleteInspection = (id: string) => {
    deleteSubstationInspection(id);
  };

  const updateDistrict = (id: string, data: Partial<{ population: { rural: number; urban: number; metro: number } }>) => {
    setDistricts(prev => prev.map(district => {
      if (district.id === id) {
        return {
          ...district,
          ...data
        };
      }
      return district;
    }));
  };

  // Fault management functions
  const getFilteredFaults = (regionId?: string, districtId?: string) => {
    let filteredOP5 = op5Faults;
    let filteredControl = controlOutages;
    
    if (regionId) {
      filteredOP5 = filteredOP5.filter(f => f.regionId === regionId);
      filteredControl = filteredControl.filter(f => f.regionId === regionId);
    }
    
    if (districtId) {
      filteredOP5 = filteredOP5.filter(f => f.districtId === districtId);
      filteredControl = filteredControl.filter(f => f.districtId === districtId);
    }
    
    return {
      op5Faults: filteredOP5,
      controlOutages: filteredControl
    };
  };

  const addOP5Fault = (fault: Omit<OP5Fault, "id" | "status">) => {
    const newFault: OP5Fault = {
      ...fault,
      id: `op5_${Date.now()}`,
      status: 'active'
    };
    
    setOP5Faults(prev => [...prev, newFault]);
  };

  const addControlOutage = (outage: Omit<ControlSystemOutage, "id" | "status">) => {
    const newOutage: ControlSystemOutage = {
      ...outage,
      id: `ctrl_${Date.now()}`,
      status: 'active'
    };
    
    setControlOutages(prev => [...prev, newOutage]);
  };

  const resolveFault = (id: string, type: "op5" | "control") => {
    const now = new Date().toISOString();
    
    if (type === "op5") {
      setOP5Faults(prev => prev.map(f => {
        if (f.id === id) {
          return {
            ...f,
            status: 'resolved',
            restorationDate: now
          };
        }
        return f;
      }));
    } else {
      setControlOutages(prev => prev.map(o => {
        if (o.id === id) {
          return {
            ...o,
            status: 'resolved',
            restorationDate: now
          };
        }
        return o;
      }));
    }
  };

  const deleteFault = (id: string, type: "op5" | "control") => {
    if (type === "op5") {
      setOP5Faults(prev => prev.filter(f => f.id !== id));
    } else {
      setControlOutages(prev => prev.filter(o => o.id !== id));
    }
  };

  const canEditFault = (fault: OP5Fault | ControlSystemOutage) => {
    // This is a placeholder implementation
    return true;
  };

  return (
    <DataContext.Provider value={{
      regions,
      districts,
      vitAssets,
      vitInspections,
      substationInspections,
      loadMonitoringData,
      addVITAsset,
      updateVITAsset,
      deleteVITAsset,
      addVITInspection,
      updateVITInspection,
      deleteVITInspection,
      addSubstationInspection,
      updateSubstationInspection,
      deleteSubstationInspection,
      addLoadMonitoring,
      updateLoadMonitoring,
      deleteLoadMonitoring,
      saveInspection,
      getSavedInspection,
      updateInspection,
      deleteInspection,
      savedInspections: substationInspections,
      updateDistrict,
      getFilteredFaults,
      addOP5Fault,
      addControlOutage,
      resolveFault,
      deleteFault,
      canEditFault
    }}>
      {children}
    </DataContext.Provider>
  );
};

// Custom hook to use the context
export const useData = () => useContext(DataContext);
