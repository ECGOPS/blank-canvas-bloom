
// Update the YesNoOption type to include "N/A"
export type YesNoOption = "Yes" | "No" | "N/A";
export type GoodBadOption = "good" | "bad" | "Normal";

export interface Region {
  id: string;
  name: string;
}

export interface District {
  id: string;
  regionId: string;
  name: string;
  population: {
    rural: number;
    urban: number;
    metro: number;
  };
}

export type VoltageLevel = "11KV" | "33KV" | "66KV";
export type VITStatus = "Operational" | "Under Maintenance" | "Faulty" | "Decommissioned";

export interface VITAsset {
  id: string;
  regionId: string;
  districtId: string;
  voltageLevel: VoltageLevel;
  typeOfUnit: string;
  serialNumber: string;
  location: string;
  gpsCoordinates: string;
  status: VITStatus;
  protection: string;
  photoUrl: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface VITInspectionChecklist {
  id: string;
  vitAssetId: string;
  inspectionDate: string;
  inspectedBy: string;
  rodentTermiteEncroachment: YesNoOption;
  cleanDustFree: YesNoOption;
  protectionButtonEnabled: YesNoOption;
  recloserButtonEnabled: YesNoOption;
  groundEarthButtonEnabled: YesNoOption;
  acPowerOn: YesNoOption;
  batteryPowerLow: YesNoOption;
  handleLockOn: YesNoOption;
  remoteButtonEnabled: YesNoOption;
  gasLevelLow: YesNoOption;
  earthingArrangementAdequate: YesNoOption;
  noFusesBlown: YesNoOption;
  noDamageToBushings: YesNoOption;
  noDamageToHVConnections: YesNoOption;
  insulatorsClean: YesNoOption;
  paintworkAdequate: YesNoOption;
  ptFuseLinkIntact: YesNoOption;
  noCorrosion: YesNoOption;
  silicaGelCondition: GoodBadOption;
  correctLabelling: YesNoOption;
  remarks: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InspectionItem {
  id: string;
  name: string;
  status: "good" | "bad";
  remarks: string;
}

export interface InspectionCategory {
  id: string;
  name: string;
  category: string;
  items: InspectionItem[];
}

export interface SubstationInspection {
  id: string;
  substationNo: string;
  substationName?: string;
  region: string;
  district: string;
  date: string;
  type: "routine" | "preventive" | "corrective";
  isEmergency: boolean;
  items: InspectionCategory[];
  createdAt: string;
  createdBy?: string;
}

// User related types
export type UserRole = "district_engineer" | "regional_engineer" | "global_engineer" | null;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  region?: string;
  district?: string;
  createdAt: string;
}

// Fault related types
export type FaultType = "Planned" | "Unplanned" | "Emergency" | "Load Shedding";

export interface OP5Fault {
  id: string;
  regionId: string;
  districtId: string;
  occurrenceDate: string;
  restorationDate?: string;
  faultType: FaultType;
  faultLocation: string;
  status: "active" | "resolved";
  outrageDuration?: number;
  mttr?: number;
  affectedPopulation: {
    rural: number;
    urban: number;
    metro: number;
  };
  reliabilityIndices?: {
    saidi: number;
    saifi: number;
    caidi: number;
  };
}

export interface ControlSystemOutage {
  id: string;
  regionId: string;
  districtId: string;
  occurrenceDate: string;
  restorationDate?: string;
  faultType: FaultType;
  status: "active" | "resolved";
  reason: string;
  areaAffected: string;
  loadMW: number;
  unservedEnergyMWh?: number;
  affectedPopulation: {
    rural: number;
    urban: number;
    metro: number;
  };
}

// Props interfaces
export interface StatsOverviewProps {
  op5Faults: OP5Fault[];
  controlOutages: ControlSystemOutage[];
}

export interface FilterBarProps {
  setFilterRegion: (regionId: string) => void;
  setFilterDistrict: (districtId: string) => void;
  setFilterStatus: (status: "all" | "active" | "resolved") => void;
  filterStatus: "all" | "active" | "resolved";
  onRefresh: () => void;
  isRefreshing: boolean;
}

export interface YesNoStatusProps {
  label: string;
  status: YesNoOption;
}

export interface InspectionRecordProps {
  inspection: VITInspectionChecklist;
  onDelete: (id: string) => void;
}

export interface ChecklistItemProps {
  item: InspectionItem;
  onStatusChange: (status: any) => void;
  onRemarksChange: (remarks: any) => void;
}
