import { useState } from 'react';
import { BleManager, Device } from 'react-native-ble-plx';

const ESP32_SERVICE_UUID = '12345678-1234-1234-1234-123456789abc'; //  ESP32 Service UUID
const DTC_CHARACTERISTIC_UUID = '87654321-4321-4321-4321-cba987654321'; //  ESP32 Characteristic UUID

const bleManager = new BleManager();

function useBLE() {
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [obdData, setObdData] = useState<string[]>([]);

  const isDuplicateDevice = (devices: Device[], nextDevice: Device) => {
    return devices.findIndex(device => device.id === nextDevice.id) > -1;
  };

  const scanForPeripherals = () => {
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error('Error scanning for peripherals:', error);
        return;
      }
      if (device?.name) {
        console.log('Found device:', device.name); // Log all discovered devices
      }
      if (device && device.name === 'ESP32-DTC') {
        if (!isDuplicateDevice(allDevices, device)) {
          console.log('Device found:', device.name);
          setAllDevices(prev => [...prev, device]);
        }
      }
    });
  };

  const connectToDevice = async (device: Device) => {
    try {
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
    connectToDevice,
    disconnectFromDevice,
    allDevices,
    connectedDevice,
    obdData,
  };
}

export default useBLE;
