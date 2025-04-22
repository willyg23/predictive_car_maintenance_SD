import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import useBLE from './useBLE';
import { Device } from 'react-native-ble-plx';

// Define the structure of the parsed OBD data
export interface ParsedOBDData {
  dtcs: string[];
  coolant_temp_c: number;
  check_engine_light: boolean;
}

// Define the context interface
interface BLEContextType {
  // Original BLE data
  scanForPeripherals: () => Promise<void>;
  stopScan: () => void;
  connectToDevice: (device: Device, customJson?: string) => Promise<Device>;
  disconnectFromDevice: () => void;
  allDevices: Device[];
  connectedDevice: Device | null;
  obdData: string[];
  isScanning: boolean;
  scanAttempted: boolean;
  
  // Test mode properties
  enableTestMode: () => Device;
  connectToTestDevice: (customJson?: string) => Promise<Device>;
  testMode: boolean;
  disableTestMode: () => void;
  
  // Permission status
  permissionError: string | null;
  
  // Parsed data for UI
  parsedData: ParsedOBDData | null;
}

// Create the context with default values
const BLEContext = createContext<BLEContextType | undefined>(undefined);

// Provider component
export const BLEProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const bleHook = useBLE();
  const [parsedData, setParsedData] = useState<ParsedOBDData | null>(null);
  
  // Parse BLE data when it changes
  useEffect(() => {
    if (bleHook.obdData.length > 0) {
      try {
        // Try to parse the latest OBD data as JSON
        const latestData = bleHook.obdData[bleHook.obdData.length - 1];
        const parsed = JSON.parse(latestData) as ParsedOBDData;
        setParsedData(parsed);
        console.log('Successfully parsed OBD data:', parsed);
      } catch (error) {
        console.error('Error parsing OBD data:', error);
      }
    } else {
      // Clear parsed data if there's no OBD data
      setParsedData(null);
    }
  }, [bleHook.obdData]);

  // Provide both original BLE data and parsed data
  const value = {
    ...bleHook,
    parsedData,
  };

  return <BLEContext.Provider value={value}>{children}</BLEContext.Provider>;
};

// Custom hook to use the BLE context
export const useBLEContext = () => {
  const context = useContext(BLEContext);
  if (context === undefined) {
    throw new Error('useBLEContext must be used within a BLEProvider');
  }
  return context;
}; 