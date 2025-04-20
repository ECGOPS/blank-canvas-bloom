// New types to match the Supabase database schema

export interface FeederLeg {
  id: string;
  redPhaseCurrent: number;
  yellowPhaseCurrent: number;
  bluePhaseCurrent: number;
  neutralCurrent: number;
}

export interface LoadMonitoringData {
  id: string;
  regionId: string;
  districtId: string;
  date: string;  // YYYY-MM-DD
  time: string;  // HH:mm
  substationNumber: string;
  substationName?: string;
  location: string;
  rating: number;
  peakLoadStatus: "day" | "night";
  redPhaseBulkLoad?: number;
  yellowPhaseBulkLoad?: number;
  bluePhaseBulkLoad?: number;
  averageCurrent?: number;
  percentageLoad?: number;
  ratedLoad?: number;
  tenPercentFullLoadNeutral?: number;
  calculatedNeutral?: number;
  feederLegs: FeederLeg[];
  createdBy: string;
  createdAt: string;
}

export interface Region {
  id: string;
  name: string;
}
export interface District {
  id: string;
  name: string;
  regionId: string;
}

export interface OP5Fault {
  id: string;
  regionId: string;
  districtId: string;
  occurrenceDate: string;
  restorationDate?: string;
  faultType: string;
  faultLocation: string;
  affectedPopulation: {
    rural: number;
    urban: number;
    metro: number;
  };
  status: "active" | "resolved";
  mttr?: number;
  outrageDuration?: number;
}

export interface ControlSystemOutage {
  id: string;
  regionId: string;
  districtId: string;
  occurrenceDate: string;
  restorationDate?: string;
  reason: string;
  areaAffected: string;
  loadMW: number;
  customersAffected: {
    rural: number;
    urban: number;
    metro: number;
  };
  unservedEnergyMWh: number;
  status: "active" | "resolved";
}

export interface StatsOverviewProps {
  op5Faults: OP5Fault[];
  controlOutages: ControlSystemOutage[];
}

export interface LoadMonitoringData {
  substationName: string;
  feederName: string;
  region: string;
  district: string;
  date: string;
  recordedBy: string;
  maximumLoadMW: number;
  minimumLoadMW: number;
  averageLoadMW: number;
  maximumLoadTime?: string;
  minimumLoadTime?: string;
  hourlyReadings?: { hour: number; loadMW: number }[];
  remarks?: string;
}
