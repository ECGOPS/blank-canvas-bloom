
import { VITAsset, VITInspectionChecklist } from "./types";

export interface FeederLeg {
  id: string;
  redPhaseCurrent: number;
  yellowPhaseCurrent: number;
  bluePhaseCurrent: number;
  neutralCurrent: number;
}

export interface LoadMonitoringData {
  id: string;
  date: string;
  time: string;
  region: string;
  district: string;
  substationName: string;
  substationNumber: string;
  location: string;
  rating: number;
  peakLoadStatus: 'day' | 'night';
  feederLegs: FeederLeg[];
  
  // Calculated fields
  ratedLoad: number;
  redPhaseBulkLoad: number;
  yellowPhaseBulkLoad: number;
  bluePhaseBulkLoad: number;
  averageCurrent: number;
  percentageLoad: number;
  tenPercentFullLoadNeutral: number;
  calculatedNeutral: number;
  
  // Metadata
  createdBy?: string;
  createdAt?: string;
}
