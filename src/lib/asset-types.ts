
// Asset Management Types

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
  region?: string;
  districtId: string;
  district?: string;
  date: string;
  time: string;
  substationName: string;
  substationNumber: string;
  location: string;
  rating: number;
  peakLoadStatus: 'day' | 'night';
  feederLegs: FeederLeg[];
  
  // Calculated values
  ratedLoad: number;
  redPhaseBulkLoad: number;
  yellowPhaseBulkLoad: number;
  bluePhaseBulkLoad: number;
  averageCurrent: number;
  percentageLoad: number;
  tenPercentFullLoadNeutral: number;
  calculatedNeutral: number;
  
  // Metadata
  createdBy: string;
  createdAt: string;
}
