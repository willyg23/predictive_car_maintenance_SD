# BLE Data Integration Feature

This branch implements a feature that bridges the gap between TapToScan and HomeScreen, allowing real-time OBD data from the ESP32 to be displayed in the HomeScreen UI.

## Key Changes

1. **Created a BLE Context Provider**
   - Added a global context to provide BLE data across components
   - Includes automatic JSON parsing of received BLE data
   - Maintains state across screen navigation

2. **Enhanced useBLE.tsx**
   - Improved data decoding using Buffer
   - Added development mode testing with mock data
   - Better error handling for BLE communication
   - Support for custom JSON data input in virtual mode

3. **Updated HomeScreen.tsx**
   - Now dynamically displays OBD data (temperature, DTCs, engine light)
   - Shows visual indicators based on data values
   - Reflects connection status in the setup tab

4. **Updated TapToScan.tsx**
   - Now uses the centralized BLE context
   - Data received in this screen is now available throughout the app
   - Added dual-mode interface (Real mode & Virtual mode)
   - Custom JSON editor for defining virtual device data

5. **Updated App.tsx**
   - Added BLEProvider to wrap the application
   - Fixed navigation type definitions

## Data Format

The ESP32 should send JSON data in the following format:

```json
{
  "dtcs": ["P0100", "P0128"],
  "coolant_temp_c": 85,
  "check_engine_light": true
}
```

Where:
- `dtcs`: Array of diagnostic trouble codes (P-codes)
- `coolant_temp_c`: Engine coolant temperature in Celsius
- `check_engine_light`: Boolean indicating if check engine light is on

## Using Real and Virtual Modes

The TapToScan screen supports two distinct operating modes:

### Real Mode (Default)
- Scans for and connects to physical ESP32 devices
- Displays only real devices in the device list
- Shows data received from the physical device
- Use this mode for normal operation with real hardware

### Virtual Mode
1. Toggle the switch at the top of the screen to "Virtual Mode"
2. Click "Prepare Virtual ESP32" to create a virtual device
3. Tap on "🧪 Configure Virtual ESP32" in the device list
4. A JSON editor will appear where you can define custom data:
   ```json
   {
     "dtcs": ["P0100"],
     "coolant_temp_c": 85,
     "check_engine_light": true
   }
   ```
5. Edit the JSON to simulate different scenarios
6. Click "Connect" to use your custom data
7. Navigate back to the HomeScreen to see your custom data displayed
8. To return to Real Mode, disconnect and toggle the switch back

You can easily switch between these modes at any time using the toggle switch. This allows testing without hardware and normal operation with real devices in the same application.

## Dependencies

Added `buffer` package for better Base64 decoding:
```
npm install buffer
```

## Next Steps

1. Implement proper error handling for malformed JSON
2. Add more vehicle data points
3. Store historical data for trends and analysis
4. Enhance the UI with more detailed diagnostic information 