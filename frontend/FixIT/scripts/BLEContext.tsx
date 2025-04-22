import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import useBLE from './useBLE';
import { Device } from 'react-native-ble-plx';

// Define the structure of the parsed OBD data
export interface ParsedOBDData {
  dtcs: string[];
  coolant_temp_c: number;
  check_engine_light: boolean;
  vin?: string;
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
  formattedData: (ParsedOBDData & { coolant_temp_f: number, dtcs_formatted: string }) | null;
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
        
        // Handle the parsing in a safe way
        try {
          const parsed = JSON.parse(latestData) as ParsedOBDData;
          
          // Validate required fields exist
          if (typeof parsed.coolant_temp_c !== 'number' || 
              !Array.isArray(parsed.dtcs) ||
              typeof parsed.check_engine_light !== 'boolean') {
            console.warn('Invalid OBD data format, missing required fields:', parsed);
            return;
          }
          
          setParsedData(parsed);
          console.log('Successfully parsed OBD data:', parsed);
        } catch (error) {
          console.error('Error parsing OBD data JSON:', error);
          console.error('Problematic data:', latestData);
          
          // Try to extract data from malformed JSON using regex
          try {
            // Extract DTCs if possible
            const dtcsMatch = latestData.match(/"dtcs":\s*\[(.*?)\]/);
            const dtcsStr = dtcsMatch ? dtcsMatch[1] : '';
            
            // Extract coolant temp
            const coolantMatch = latestData.match(/coolant_temp_c":\s*(\d+)/);
            const coolantTemp = coolantMatch ? parseInt(coolantMatch[1]) : 0;
            
            // Extract check engine status
            const checkEngineMatch = latestData.match(/check_engine_light":\s*(true|false)/);
            const checkEngine = checkEngineMatch ? checkEngineMatch[1] === 'true' : false;
            
            // Extract VIN
            const vinMatch = latestData.match(/vin":\s*"([^"]*)"/);
            const vin = vinMatch ? vinMatch[1] : '';
            
            // Create a fixed data object
            const fixedData: ParsedOBDData = {
              dtcs: dtcsStr.includes('"') ? JSON.parse(`[${dtcsStr}]`) : [],
              coolant_temp_c: coolantTemp,
              check_engine_light: checkEngine,
              vin: vin || 'Unknown'
            };
            
            setParsedData(fixedData);
            console.log('Recovered data from malformed JSON:', fixedData);
          } catch (regexError) {
            console.error('Could not recover data using regex:', regexError);
          }
        }
      } catch (error) {
        console.error('Top level error processing OBD data:', error);
      }
    } else {
      // Clear parsed data if there's no OBD data
      setParsedData(null);
    }
  }, [bleHook.obdData]);

  // Format parsed data for display
  const getFormattedData = () => {
    if (!parsedData) return null;
    
    return {
      ...parsedData,
      // Convert coolant temp to Fahrenheit for display
      coolant_temp_f: Math.round((parsedData.coolant_temp_c * 9/5) + 32),
      // Format DTCs as a string for easy display
      dtcs_formatted: parsedData.dtcs.join(', ') || 'None detected'
    };
  };

  // Provide both original BLE data and parsed data
  const value = {
    ...bleHook,
    parsedData,
    formattedData: getFormattedData(),
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