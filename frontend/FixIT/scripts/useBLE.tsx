import { useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';

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

  const isDuplicateDevice = (devices: Device[], nextDevice: Device) => {
    return devices.findIndex(device => device.id === nextDevice.id) > -1;
  };

  const scanForPeripherals = async () => {
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
    bleManager.stopDeviceScan();
    setIsScanning(false);
  };

  const connectToDevice = async (device: Device) => {
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
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  };

  const startReadingDTCFromESP32 = async (device: Device) => {
    device.monitorCharacteristicForService(
      ESP32_SERVICE_UUID,
      DTC_CHARACTERISTIC_UUID,
      (error, characteristic) => {
        if (error) {
          console.error('Error reading DTC data:', error);
          return;
        }
        if (characteristic?.value) {
          const decodedData = atob(characteristic.value); // Decode Base64 if necessary
          console.log('Received DTC Data:', decodedData);
          setObdData(prev => [...prev, decodedData]); // Append DTC data
        }
      },
    );
  };

  const disconnectFromDevice = () => {
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
  };
}

export default useBLE;
