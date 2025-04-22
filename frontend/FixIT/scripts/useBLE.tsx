import { useState } from 'react';
import { PermissionsAndroid, Platform, Alert, ToastAndroid } from 'react-native';
import { BleManager, Device, Subscription } from 'react-native-ble-plx';
import { Buffer } from 'buffer';

const ESP32_SERVICE_UUID = '12345678-1234-1234-1234-123456789abc'; //  ESP32 Service UUID
const DTC_CHARACTERISTIC_UUID = '87654321-4321-4321-4321-cba987654321'; //  ESP32 Characteristic UUID

const bleManager = new BleManager();

// Request comprehensive Bluetooth permissions for Android
const requestBluetoothPermissions = async () => {
  if (Platform.OS === 'android') {
    // For Android 12+ (API level 31+) we need BLUETOOTH_SCAN and BLUETOOTH_CONNECT
    if (Platform.Version >= 31) {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        // Check all permissions
        const allGranted = Object.values(granted).every(
          result => result === PermissionsAndroid.RESULTS.GRANTED
        );

        // Provide detailed feedback
        if (!allGranted) {
          // Find which permissions were denied
          const deniedPermissions = Object.entries(granted)
            .filter(([_, value]) => value !== PermissionsAndroid.RESULTS.GRANTED)
            .map(([key]) => key);

          console.warn('These permissions were denied:', deniedPermissions);
          
          // Show message to user
          ToastAndroid.show(
            'Bluetooth scanning requires all permissions to be granted',
            ToastAndroid.LONG
          );
        }

        return allGranted;
      } catch (error) {
        console.error('Error requesting permissions:', error);
        return false;
      }
    } 
    // For Android 6.0 - 11 (API level 23-30)
    else if (Platform.Version >= 23) {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          // Add any other permissions needed for older Android versions
        ]);

        const allGranted = Object.values(granted).every(
          result => result === PermissionsAndroid.RESULTS.GRANTED
        );

        if (!allGranted) {
          ToastAndroid.show(
            'Location permission is required for Bluetooth scanning',
            ToastAndroid.LONG
          );
        }

        return allGranted;
      } catch (error) {
        console.error('Error requesting permissions:', error);
        return false;
      }
    }
  }

  // For iOS or older Android versions, no explicit permissions needed
  return true;
};

function useBLE() {
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [obdData, setObdData] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanAttempted, setScanAttempted] = useState<boolean>(false);
  const [testMode, setTestMode] = useState<boolean>(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const isDuplicateDevice = (devices: Device[], nextDevice: Device) => {
    return devices.findIndex(device => device.id === nextDevice.id) > -1;
  };

  // Add a test mode function that simulates finding and connecting to an ESP32
  const enableTestMode = () => {
    // Create a mock device - using type assertion with unknown as intermediate step
    const mockDevice = {
      id: 'test-esp32-device',
      name: 'ESP32-DTC',
      localName: 'ESP32-DTC',
      rssi: -50,
      manufacturerData: null,
      serviceData: {},
      serviceUUIDs: [ESP32_SERVICE_UUID],
      solicitedServiceUUIDs: [],
      txPowerLevel: null,
      isConnectable: true,
      mtu: 23,
      overflowServiceUUIDs: [],
      // Add implementation for all required methods
      connect: () => Promise.resolve({} as unknown as Device),
      cancelConnection: () => Promise.resolve({} as unknown as Device),
      isConnected: () => Promise.resolve(true),
      discoverAllServicesAndCharacteristics: () => Promise.resolve({} as unknown as Device),
      services: () => Promise.resolve([]),
      characteristicsForService: () => Promise.resolve([]),
      descriptorsForService: () => Promise.resolve([]),
      readCharacteristicForService: () => Promise.resolve({ value: '' } as any),
      writeCharacteristicWithResponseForService: () => Promise.resolve({ value: '' } as any),
      writeCharacteristicWithoutResponseForService: () => Promise.resolve({ value: '' } as any),
      readDescriptorForService: () => Promise.resolve({ value: '' } as any),
      writeDescriptorForService: () => Promise.resolve(),
      monitorCharacteristicForService: () => ({ remove: () => {} } as Subscription),
      requestMTU: () => Promise.resolve({} as unknown as Device),
      rawScanRecord: undefined,
      requestConnectionPriority: () => Promise.resolve(),
      readRSSI: () => Promise.resolve(0),
      onDisconnected: () => ({ remove: () => {} } as Subscription),
    };

    // Cast to Device after ensuring all required methods are present
    const typedMockDevice = mockDevice as unknown as Device;

    // Add mock device to the list
    setAllDevices([typedMockDevice]);
    setTestMode(true);
    setScanAttempted(true);

    return typedMockDevice;
  };

  // Add function to disable test mode
  const disableTestMode = () => {
    // Clear any connected device
    if (connectedDevice) {
      disconnectFromDevice();
    }
    
    // Reset test mode state
    setTestMode(false);
    setAllDevices([]);
    setScanAttempted(false);
    console.log('Test mode disabled');
  };

  const connectToDevice = async (device: Device, customJson?: string) => {
    // If in test mode and connecting to a test device
    if (testMode && device.id === 'test-esp32-device') {
      return connectToTestDevice(customJson);
    }
    
    try {
      // Stop scanning if it's still active
      if (isScanning) {
        stopScan();
      }
      
      const deviceConnection = await bleManager.connectToDevice(device.id);
      setConnectedDevice(deviceConnection);
      console.log(`Connected to ${device.name}`);
      
      // Request a larger MTU size
      try {
        const newMtu = await deviceConnection.requestMTU(512);
        console.log(`MTU size changed to: ${newMtu} bytes`);
      } catch (mtuError) {
        console.warn('Could not negotiate larger MTU:', mtuError);
      }
      
      await deviceConnection.discoverAllServicesAndCharacteristics();
      startReadingDTCFromESP32(deviceConnection);
      
      // For testing: Add a mock data if connected
      if (process.env.NODE_ENV === 'development') {
        // Wait for a moment before adding mock data for testing
        setTimeout(() => {
          const mockData = JSON.stringify({
            dtcs: ["P0128"],
            coolant_temp_c: 85, // ~185°F
            check_engine_light: true
          });
          console.log('Adding mock data for testing:', mockData);
          setObdData(prev => [...prev, mockData]);
        }, 1500);
      }
      
      // Return the connected device to indicate success
      return deviceConnection;
    } catch (error) {
      console.error('Failed to connect:', error);
      // Propagate the error so the UI can handle it
      throw error;
    }
  };

  // Simulate connecting to the test device with optional custom JSON
  const connectToTestDevice = async (customJson?: string) => {
    // First, make sure we're in test mode
    if (!testMode) {
      const mockDevice = enableTestMode();
      setConnectedDevice(mockDevice);
      
      // Generate mock data or use custom JSON
      setTimeout(() => {
        const mockData = customJson || JSON.stringify({
          dtcs: ["P0128"],
          coolant_temp_c: 85, // ~185°F
          check_engine_light: true
        });
        console.log('[TEST MODE] Adding mock data:', mockData);
        setObdData(prev => [...prev, mockData]);
        
        // Add more data after a delay only if using default data
        if (!customJson) {
          setTimeout(() => {
            const updatedMockData = JSON.stringify({
              dtcs: ["P0128", "P0300"],
              coolant_temp_c: 95, // Temperature rising
              check_engine_light: true
            });
            console.log('[TEST MODE] Adding updated mock data:', updatedMockData);
            setObdData(prev => [...prev, updatedMockData]);
          }, 5000);
        }
      }, 1500);
      
      return mockDevice;
    }
    
    // If already in test mode, just connect to the first device
    if (allDevices.length > 0) {
      const device = allDevices[0];
      setConnectedDevice(device);
      
      // Generate mock data or use custom JSON
      setTimeout(() => {
        const mockData = customJson || JSON.stringify({
          dtcs: ["P0128"],
          coolant_temp_c: 85,
          check_engine_light: true
        });
        console.log('[TEST MODE] Adding mock data:', mockData);
        setObdData(prev => [...prev, mockData]);
      }, 1500);
      
      return device;
    }
    
    // If we get here, we couldn't find a test device, which shouldn't happen
    // But for type safety, return a mock device
    return enableTestMode();
  };

  const scanForPeripherals = async () => {
    // In test mode, we'll add the virtual device but still scan for real ones
    if (testMode) {
      // Reset any previous permission errors
      setPermissionError(null);
      
      const hasPermission = await requestBluetoothPermissions();
      if (!hasPermission) {
        console.warn("Bluetooth permissions not granted.");
        
        // Store the permission error
        setPermissionError("Bluetooth scanning requires permissions. Please grant the requested permissions in your device settings.");
        
        // If in test mode, we can still proceed with virtual device
        const virtualDevice = allDevices.find(device => device.id === 'test-esp32-device');
        setAllDevices(virtualDevice ? [virtualDevice] : []);
        setIsScanning(false);
        setScanAttempted(true);
        return;
      }
      
      // Start a real scan while keeping the virtual device
      setIsScanning(true);
      
      // Preserve virtual device in the list
      const virtualDevice = allDevices.find(device => device.id === 'test-esp32-device');
      const realDevices = allDevices.filter(device => device.id !== 'test-esp32-device');
      
      // Clear previous real devices but keep virtual one
      setAllDevices(virtualDevice ? [virtualDevice] : []);
      setScanAttempted(true);
    
      // Scan for real devices
      bleManager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          console.error('Error scanning for peripherals:', error);
          
          // Handle common BLE errors
          if (error.message?.includes('bluetooth disabled')) {
            setPermissionError("Bluetooth is turned off. Please enable Bluetooth in your device settings.");
          } else if (error.message?.includes('location disabled')) {
            setPermissionError("Location services are disabled. Please enable location in your device settings.");
          } else {
            setPermissionError(`Scanning error: ${error.message}`);
          }
          
          setIsScanning(false);
          return;
        }
        if (device?.name) {
          console.log('Found device:', device.name);
        }
        if (device && device.name === 'ESP32-DTC') {
          if (!isDuplicateDevice(allDevices, device)) {
            console.log('Real device found:', device.name);
            setAllDevices(prev => [...prev, device]);
          }
        }
      });
      
      // Stop scan after 10 seconds
      setTimeout(() => {
        stopScan();
      }, 10000);
      
      return;
    }
    
    // Regular scan mode (no test mode)
    setPermissionError(null);
    const hasPermission = await requestBluetoothPermissions();
    if (!hasPermission) {
      console.warn("Bluetooth permissions not granted.");
      setPermissionError(
        Platform.OS === 'android' 
          ? "Bluetooth scanning requires permission access. Please enable Bluetooth and Location in your device settings."
          : "Bluetooth permission denied. Please check your device settings."
      );
      setIsScanning(false);
      setScanAttempted(true);
      return;
    }
    
    // Clear previous devices when starting a new scan
    setAllDevices([]);
    setIsScanning(true);
    setScanAttempted(true);
  
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error('Error scanning for peripherals:', error);
        
        // Handle common BLE errors
        if (error.message?.includes('bluetooth disabled')) {
          setPermissionError("Bluetooth is turned off. Please enable Bluetooth in your device settings and try again.");
        } else if (error.message?.includes('location disabled')) {
          setPermissionError("Location services are required for Bluetooth scanning. Please enable location in your device settings.");
        } else if (error.message?.includes('permission')) {
          setPermissionError("Missing required permissions for Bluetooth. Please restart the app and grant all requested permissions.");
        } else {
          setPermissionError(`Scanning error: ${error.message || "Unknown error occurred"}`);
        }
        
        setIsScanning(false);
        return;
      }
      if (device?.name) {
        console.log('Found device:', device.name);
      }
      if (device && device.name === 'ESP32-DTC') {
        if (!isDuplicateDevice(allDevices, device)) {
          console.log('Device found:', device.name);
          setAllDevices(prev => [...prev, device]);
        }
      }
    });
    
    // Stop scan after 10 seconds
    setTimeout(() => {
      stopScan();
    }, 10000);
  };
  
  const stopScan = () => {
    if (!testMode) {
      bleManager.stopDeviceScan();
    }
    setIsScanning(false);
  };

  const startReadingDTCFromESP32 = async (device: Device) => {
    // Skip actual BLE operations if in test mode
    if (testMode) return;
    
    // Buffer to collect chunked data
    let dataBuffer = "";
    const END_MARKER = "##END##";
    
    device.monitorCharacteristicForService(
      ESP32_SERVICE_UUID,
      DTC_CHARACTERISTIC_UUID,
      (error, characteristic) => {
        if (error) {
          console.error('Error reading DTC data:', error);
          return;
        }
        
        if (characteristic?.value) {
          try {
            // First decode the Base64 string
            const decodedData = Buffer.from(characteristic.value, 'base64').toString('utf-8');
            console.log('Received raw DTC Data:', decodedData);
            
            // Check if this chunk contains the end marker
            if (decodedData.includes(END_MARKER)) {
              // Remove the end marker from the chunk before processing
              const cleanedChunk = decodedData.replace(END_MARKER, '');
              if (cleanedChunk.length > 0) {
                dataBuffer += cleanedChunk;
              }
              
              console.log('End marker received, processing complete message');
              console.log('Full buffered data:', dataBuffer);
              
              // Process the complete buffer if it's not empty
              if (dataBuffer.length > 0) {
                processCompleteJsonData(dataBuffer);
              }
              
              // Reset the buffer
              dataBuffer = "";
              return;
            }
            
            // Add this chunk to our buffer
            dataBuffer += decodedData;
          } catch (e) {
            console.error('Error processing data:', e);
          }
        }
      }
    );
  };
  
  // Helper function to process a complete JSON string
  const processCompleteJsonData = (jsonString: string) => {
    try {
      // Clean up the string to ensure it's valid JSON
      // Sometimes we might get extra whitespace or characters
      let cleanedString = jsonString.trim();
      
      // Ensure we have a complete JSON object
      if (!cleanedString.startsWith('{') || !cleanedString.endsWith('}')) {
        console.error('Invalid JSON format - missing braces:', cleanedString);
        return;
      }
      
      // Validate by parsing
      const jsonData = JSON.parse(cleanedString);
      console.log('Successfully parsed complete JSON:', jsonData);
      
      // Store the valid JSON data
      setObdData(prev => [...prev, cleanedString]);
    } catch (jsonError: any) {
      console.error('JSON parse error:', jsonError.message);
      console.error('Problematic JSON string:', jsonString);
      
      // Attempt to fix common JSON issues
      try {
        // Try to reconstruct the JSON from what we know should be there
        const fixedJson = attemptToFixJson(jsonString);
        if (fixedJson) {
          console.log('Fixed JSON:', fixedJson);
          setObdData(prev => [...prev, fixedJson]);
        }
      } catch (fixError) {
        console.error('Could not fix malformed JSON:', fixError);
      }
    }
  };
  
  // Attempt to fix malformed JSON with common patterns
  const attemptToFixJson = (brokenJson: string): string | null => {
    // If we recognize our expected format, try to reconstruct it
    if (brokenJson.includes('"dtcs":[') && 
        (brokenJson.includes('"coolant_temp_c":') || brokenJson.includes('oolant_temp_c":'))) {
      
      // Extract the DTCs array
      const dtcMatch = brokenJson.match(/"dtcs":\[(.*?)\]/);
      const dtcs = dtcMatch ? dtcMatch[1] : '""';
      
      // Extract coolant temperature 
      const coolantMatch = brokenJson.match(/(?:"c|c)oolant_temp_c":\s*(\d+)/);
      const coolantTemp = coolantMatch ? coolantMatch[1] : '0';
      
      // Extract check engine light
      const checkEngineMatch = brokenJson.match(/(?:"c|c)heck_engine_light":\s*(true|false)/);
      const checkEngine = checkEngineMatch ? checkEngineMatch[1] : 'false';
      
      // Extract VIN if available
      const vinMatch = brokenJson.match(/(?:"v|v)in":\s*"([^"]*)"/);
      const vin = vinMatch ? vinMatch[1] : 'UNKNOWN';
      
      // Construct valid JSON
      const fixedJson = `{"dtcs":[${dtcs}],"coolant_temp_c":${coolantTemp},"check_engine_light":${checkEngine},"vin":"${vin}"}`;
      
      // Validate it's proper JSON before returning
      JSON.parse(fixedJson); // This will throw if invalid
      return fixedJson;
    }
    
    return null; // Could not fix
  };

  const disconnectFromDevice = () => {
    if (testMode) {
      setConnectedDevice(null);
      setObdData([]);
      return;
    }
    
    if (connectedDevice) {
      bleManager.cancelDeviceConnection(connectedDevice.id);
      console.log('Disconnected from device');
      setConnectedDevice(null);
      setObdData([]);
    }
  };

  // Add a helper function to the BLEContext component to parse and display readable DTC data
  const parseOBDData = (data: string): any => {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error('Error parsing OBD data in helper:', e);
      return null;
    }
  };

  return {
    scanForPeripherals,
    stopScan,
    connectToDevice,
    disconnectFromDevice,
    allDevices,
    connectedDevice,
    obdData,
    isScanning,
    scanAttempted,
    enableTestMode,  // Export the test mode function
    connectToTestDevice,
    testMode,
    disableTestMode,
    permissionError, // Export the permission error
    parseOBDData,
  };
}

export default useBLE;
