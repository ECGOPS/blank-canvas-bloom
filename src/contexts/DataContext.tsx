
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import regionsData from '../data/regions.json';
import districtsData from '../data/districts.json';
import vitAssetsData from '../data/vit-assets.json';
import vitInspectionsData from '../data/vit-inspections.json';
import { VITAsset, VITInspectionChecklist, SubstationInspection } from '@/lib/types';
import { LoadMonitoringData } from '@/lib/asset-types';

interface DataContextType {
  regions: { id: string; name: string }[];
  districts: { id: string; name: string; regionId: string }[];
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
});

// Create a provider component
export const DataProvider = ({ children }: { children: ReactNode }) => {
  // State for regions and districts
  const [regions] = useState(regionsData);
  const [districts] = useState(districtsData);
  
  // State for VIT assets and inspections
  const [vitAssets, setVITAssets] = useState<VITAsset[]>([]);
  const [vitInspections, setVITInspections] = useState<VITInspectionChecklist[]>([]);
  
  // State for substation inspections
  const [substationInspections, setSubstationInspections] = useState<SubstationInspection[]>([]);

  // State for load monitoring data
  const [loadMonitoringData, setLoadMonitoringData] = useState<LoadMonitoringData[]>([]);

  // Load data from local storage on component mount
  useEffect(() => {
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
      deleteLoadMonitoring
    }}>
      {children}
    </DataContext.Provider>
  );
};

// Custom hook to use the context
export const useData = () => useContext(DataContext);
