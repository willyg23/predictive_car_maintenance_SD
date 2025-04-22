import { useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';
import { Buffer } from 'buffer';

const ESP32_SERVICE_UUID = '12345678-1234-1234-1234-123456789abc'; //  ESP32 Service UUID
const DTC_CHARACTERISTIC_UUID = '87654321-4321-4321-4321-cba987654321'; //  ESP32 Characteristic UUID

const bleManager = new BleManager();

const requestBluetoothPermissions = async () => {
  if (Platform.OS === 'android' && Platform.Version >= 23) {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ]);

    return Object.values(granted).every(result => result === PermissionsAndroid.RESULTS.GRANTED);
  }
  return true;
};

function useBLE() {
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [obdData, setObdData] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanAttempted, setScanAttempted] = useState<boolean>(false);
  const [testMode, setTestMode] = useState<boolean>(false);

  const isDuplicateDevice = (devices: Device[], nextDevice: Device) => {
    return devices.findIndex(device => device.id === nextDevice.id) > -1;
  };

  // Add a test mode function that simulates finding and connecting to an ESP32
  const enableTestMode = () => {
    // Create a mock device
    const mockDevice: Device = {
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
      connect: () => Promise.resolve({} as Device),
      cancelConnection: () => Promise.resolve({} as Device),
      isConnected: () => Promise.resolve(true),
      discoverAllServicesAndCharacteristics: () => Promise.resolve({} as Device),
      services: () => Promise.resolve([]),
      characteristicsForService: () => Promise.resolve([]),
      readCharacteristicForService: () => Promise.resolve({ value: '' } as any),
      writeCharacteristicWithResponseForService: () => Promise.resolve({ value: '' } as any),
      writeCharacteristicWithoutResponseForService: () => Promise.resolve({ value: '' } as any),
      monitorCharacteristicForService: () => ({ remove: () => {} }),
      requestMTU: () => Promise.resolve({} as Device),
    };

    // Add mock device to the list
    setAllDevices([mockDevice]);
    setTestMode(true);
    setScanAttempted(true);

    return mockDevice;
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
    } catch (error) {
      console.error('Failed to connect:', error);
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
      
      return;
    }
    
    // If already in test mode, just connect to the first device
    if (allDevices.length > 0) {
      setConnectedDevice(allDevices[0]);
      
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
    }
  };

  const scanForPeripherals = async () => {
    // If in test mode, just simulate finding devices
    if (testMode) {
      setIsScanning(true);
      // Simulate scanning delay
      setTimeout(() => {
        setIsScanning(false);
      }, 2000);
      return;
    }
    
    const hasPermission = await requestBluetoothPermissions();
    if (!hasPermission) {
      console.warn("Bluetooth permissions not granted.");
      return;
    }
    
    // Clear previous devices when starting a new scan
    setAllDevices([]);
    setIsScanning(true);
    setScanAttempted(true);
  
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error('Error scanning for peripherals:', error);
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
            const decodedBuffer = Buffer.from(characteristic.value, 'base64').toString('utf-8');
            console.log('Received raw DTC Data:', decodedBuffer);
            
            // Add the decoded data to our array
            setObdData(prev => [...prev, decodedBuffer]);
          } catch (e) {
            console.error('Error decoding data:', e);
          }
        }
      },
    );
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
  };
}

export default useBLE;
