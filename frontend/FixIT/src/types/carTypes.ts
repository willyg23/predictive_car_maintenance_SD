export interface CarInfo {
  id: string;
  nickname: string;
  make: string;
  model: string;
  year: number | string;
  mileage?: string;
  last_oil_change?: string;
  vin?: string;
}

export interface VehicleData {
  dtcs: string[];
  coolant_temp_c: number | string;
  check_engine_light: boolean;
}

export interface ScreenParams {
  fixedJsonObject?: VehicleData;
}

export type DiagnosticSection = 'overview' | 'engine' | 'maintenance' | 'repairs' | 'costs';

export interface SectionData {
  id: string;
  title: string;
  icon: string;
  color: string;
  content: string;
  isLoading: boolean;
  isExpanded: boolean;
} 