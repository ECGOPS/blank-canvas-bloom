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
  name: string;
  status: "good" | "bad";
  remarks: string;
}

export interface InspectionCategory {
  name: string;
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
