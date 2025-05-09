import React, { useRef, useEffect, useState } from "react";
import { SafeAreaView, StyleSheet, Text, View, Animated, Pressable, ScrollView, ActivityIndicator, Dimensions, TextInput, Modal, Switch, Platform } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useBLEContext } from "../../scripts/BLEContext";
import { Device } from "react-native-ble-plx";

export const TapToScan = () => {
    const {
        scanForPeripherals,
        stopScan,
        connectToDevice,
        disconnectFromDevice,
        allDevices,
        connectedDevice,
        obdData,
        isScanning,
        scanAttempted,
        enableTestMode,
        connectToTestDevice,
        testMode,
        disableTestMode,
        permissionError,
        formattedData,
    } = useBLEContext();

    const [jsonInputVisible, setJsonInputVisible] = useState(false);
    const [jsonInput, setJsonInput] = useState('');
    const [jsonError, setJsonError] = useState('');
    const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
    const [virtualModeActive, setVirtualModeActive] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
    const [connectionStatusVisible, setConnectionStatusVisible] = useState(false);

    const pulseAnim = useRef(new Animated.Value(1)).current;
    const loadingScale = useRef(new Animated.Value(0)).current;
    const loadingOpacity = useRef(new Animated.Value(0)).current;
    const loadingRotation = useRef(new Animated.Value(0)).current;
    const radarAnim1 = useRef(new Animated.Value(0)).current;
    const radarAnim2 = useRef(new Animated.Value(0)).current;
    const radarAnim3 = useRef(new Animated.Value(0)).current;
    const dotAnim = useRef(new Animated.Value(0)).current;
    
    // Use state for glow effect instead of animated value
    const [glowIntensity, setGlowIntensity] = useState(0.4);

    // Default JSON data for the input
    const defaultJsonData = JSON.stringify({
      dtcs: ["P0100"],
      coolant_temp_c: 85,
      check_engine_light: true
    }, null, 2);

    // Toggle between real and virtual modes
    const toggleVirtualMode = () => {
      if (virtualModeActive) {
        // Switching to real mode
        disableTestMode();
        setVirtualModeActive(false);
      } else {
        // Switching to virtual mode
        enableTestMode();
        setVirtualModeActive(true);
      }
    };

    // Scan appropriate to current mode
    const handleScan = () => {
      startPulse();
      if (virtualModeActive) {
        // In virtual mode, ensure test mode is enabled
        if (!testMode) {
          enableTestMode();
        }
      } else {
        // In real mode, ensure test mode is disabled
        if (testMode) {
          disableTestMode();
        }
      }
      scanForPeripherals();
    };

    // Show JSON input modal when connecting to virtual device
    const handleVirtualDeviceConnect = (device: Device) => {
      setSelectedDevice(device);
      setJsonInput(defaultJsonData);
      setJsonError('');
      setJsonInputVisible(true);
    };

    // Handle JSON submission
    const handleJsonSubmit = () => {
      try {
        // Try to parse the JSON to validate it
        const parsedJson = JSON.parse(jsonInput);
        
        // Check if it has the required fields
        if (!parsedJson.dtcs || !Array.isArray(parsedJson.dtcs)) {
          setJsonError('JSON must include a "dtcs" array');
          return;
        }
        if (typeof parsedJson.coolant_temp_c !== 'number') {
          setJsonError('JSON must include "coolant_temp_c" as a number');
          return;
        }
        if (typeof parsedJson.check_engine_light !== 'boolean') {
          setJsonError('JSON must include "check_engine_light" as a boolean');
          return;
        }
        
        // If valid, proceed with connection
        setJsonInputVisible(false);
        
        // Connect with custom JSON
        if (selectedDevice) {
          connectToDevice(selectedDevice, jsonInput);
        }
      } catch (error: any) {
        setJsonError('Invalid JSON format: ' + error.message);
      }
    };

    // Pulse animation for buttons
    const startPulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    };

    // Animations for loading screen
    useEffect(() => {
      if (isScanning) {
        // Reset animations
        loadingScale.setValue(0);
        loadingOpacity.setValue(0);
        radarAnim1.setValue(0);
        radarAnim2.setValue(0);
        radarAnim3.setValue(0);
        dotAnim.setValue(0);
        
        // Start animations
        Animated.parallel([
          // Entrance animation
          Animated.timing(loadingScale, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(loadingOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          // Continuous radar wave effects with staggered timing
          Animated.loop(
            Animated.sequence([
              Animated.timing(radarAnim1, {
                toValue: 1,
                duration: 2000,
                useNativeDriver: true,
              }),
              Animated.timing(radarAnim1, {
                toValue: 0,
                duration: 0,
                useNativeDriver: true,
              }),
            ])
          ),
          Animated.loop(
            Animated.sequence([
              Animated.delay(600),
              Animated.timing(radarAnim2, {
                toValue: 1,
                duration: 2000,
                useNativeDriver: true,
              }),
              Animated.timing(radarAnim2, {
                toValue: 0,
                duration: 0,
                useNativeDriver: true,
              }),
            ])
          ),
          Animated.loop(
            Animated.sequence([
              Animated.delay(1200),
              Animated.timing(radarAnim3, {
                toValue: 1,
                duration: 2000,
                useNativeDriver: true,
              }),
              Animated.timing(radarAnim3, {
                toValue: 0,
                duration: 0,
                useNativeDriver: true,
              }),
            ])
          ),
          // Animated dots
          Animated.loop(
            Animated.timing(dotAnim, {
              toValue: 1,
              duration: 1500,
              useNativeDriver: true,
            })
          ),
          // Continuous rotation
          Animated.loop(
            Animated.timing(loadingRotation, {
              toValue: 1,
              duration: 3000,
              useNativeDriver: true,
            })
          ),
        ]).start();
        
        // Manually handle the glow effect with setInterval instead of Animated
        const glowInterval = setInterval(() => {
          setGlowIntensity(prev => prev === 0.4 ? 0.8 : 0.4);
        }, 1500);
        
        // Clean up interval on unmount or when scanning stops
        return () => clearInterval(glowInterval);
      } else {
        // Exit animation
        Animated.parallel([
          Animated.timing(loadingScale, {
            toValue: 1.2,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(loadingOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, [isScanning]);

    // Interpolate rotation for spin effect
    const spin = loadingRotation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    // Create radar animation configs for each wave
    const createRadarAnimStyle = (animValue: Animated.Value) => ({
      opacity: animValue.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.2, 0.4, 0]
      }),
      transform: [
        { 
          scale: animValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0.2, 1.8]
          }) 
        }
      ]
    });

    // Animation for the loading dots
    const dotOpacity1 = dotAnim.interpolate({
      inputRange: [0, 0.3, 0.6, 1],
      outputRange: [0.2, 1, 0.2, 0.2]
    });
    
    const dotOpacity2 = dotAnim.interpolate({
      inputRange: [0, 0.3, 0.6, 1],
      outputRange: [0.2, 0.2, 1, 0.2]
    });
    
    const dotOpacity3 = dotAnim.interpolate({
      inputRange: [0, 0.3, 0.6, 1],
      outputRange: [0.2, 0.2, 0.2, 1]
    });

    // Mode switcher component
    const ModeSwitcher = () => (
      <View style={styles.modeSwitcherContainer}>
        <Text style={[styles.modeText, !virtualModeActive && styles.activeModeText]}>Real Mode</Text>
        <Switch
          value={virtualModeActive}
          onValueChange={toggleVirtualMode}
          trackColor={{ false: '#333', true: 'rgba(106, 90, 205, 0.4)' }}
          thumbColor={virtualModeActive ? '#6A5ACD' : '#FF5F6D'}
          ios_backgroundColor="#333"
          style={styles.modeSwitch}
        />
        <Text style={[styles.modeText, virtualModeActive && styles.activeModeText]}>Virtual Mode</Text>
      </View>
    );

    // Handle real device connection with connection status
    const handleRealDeviceConnect = (device: Device) => {
      setConnectionStatus("Connecting to ESP32...");
      setConnectionStatusVisible(true);
      
      // Start a timeout to hide the status after 3 seconds if no connection is made
      const timeoutId = setTimeout(() => {
        if (!connectedDevice) {
          setConnectionStatus("Connection failed. Try again or check device.");
        }
      }, 3000);
      
      // Try to connect
      connectToDevice(device)
        .then(() => {
          setConnectionStatus("Connected successfully!");
          // Keep the success message visible briefly before hiding
          setTimeout(() => {
            setConnectionStatusVisible(false);
          }, 2000);
        })
        .catch(error => {
          setConnectionStatus(`Connection failed: ${error.message || "Unknown error"}`);
          // Keep error message visible longer
          setTimeout(() => {
            setConnectionStatusVisible(false);
          }, 4000);
        });
        
      return () => clearTimeout(timeoutId);
    };

    // Update connection status based on connection state changes
    useEffect(() => {
      if (connectedDevice && !virtualModeActive) {
        setConnectionStatus("Connected successfully!");
        setConnectionStatusVisible(true);
        
        // Hide the status after 2 seconds
        const timeout = setTimeout(() => {
          setConnectionStatusVisible(false);
        }, 2000);
        
        return () => clearTimeout(timeout);
      }
    }, [connectedDevice, virtualModeActive]);

    // Helper function to display DTC data in a more readable format
    const renderDTCData = () => {
      if (!connectedDevice) {
        return <Text style={styles.dataText}>Not connected to any device.</Text>;
      }
      
      if (obdData.length === 0) {
        return <Text style={styles.dataText}>No DTCs received yet.</Text>;
      }
      
      if (formattedData && formattedData.dtcs) {
        return (
          <View style={styles.dtcDataContainer}>
            <View style={styles.dtcRow}>
              <Text style={styles.dtcLabel}>Fault Codes:</Text>
              <Text style={[
                styles.dtcValue, 
                formattedData.dtcs.length > 0 ? styles.dtcAlert : styles.dtcNormal
              ]}>
                {formattedData.dtcs_formatted}
              </Text>
            </View>
            
            <View style={styles.dtcRow}>
              <Text style={styles.dtcLabel}>Coolant Temp:</Text>
              <Text style={[
                styles.dtcValue,
                formattedData.coolant_temp_c > 95 ? styles.dtcAlert : styles.dtcNormal
              ]}>
                {formattedData.coolant_temp_c}°C / {formattedData.coolant_temp_f}°F
              </Text>
            </View>
            
            <View style={styles.dtcRow}>
              <Text style={styles.dtcLabel}>Check Engine:</Text>
              <Text style={[
                styles.dtcValue,
                formattedData.check_engine_light ? styles.dtcAlert : styles.dtcNormal
              ]}>
                {formattedData.check_engine_light ? 'ON' : 'OFF'}
              </Text>
            </View>
            
            {formattedData.vin && (
              <View style={styles.dtcRow}>
                <Text style={styles.dtcLabel}>VIN:</Text>
                <Text style={styles.dtcValue}>{formattedData.vin}</Text>
              </View>
            )}
          </View>
        );
      }
      
      // Fallback to just showing the raw JSON
      return (
        <ScrollView style={styles.rawJsonContainer}>
          {obdData.map((dtc, index) => (
            <Text key={index} style={styles.dataText}>
              {dtc}
            </Text>
          ))}
        </ScrollView>
      );
    };

    return(
        <SafeAreaView style={styles.container}>
          <View style={styles.screenWrapper}>
            <Text style={styles.dataTitleText}>BLE OBD-II Scanner</Text>
            
            {/* Mode Switcher */}
            {!connectedDevice && !isScanning && <ModeSwitcher />}
            
            {/* Permission Error Display */}
            {permissionError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>{permissionError}</Text>
                {Platform.OS === 'android' && (
                  <Text style={styles.errorHint}>
                    You may need to enable Bluetooth and Location permissions in your device settings.
                  </Text>
                )}
              </View>
            )}

            {/* Connection Status Display */}
            {connectionStatusVisible && connectionStatus && !isScanning && (
              <View style={[
                styles.statusContainer, 
                connectionStatus.includes("failed") ? styles.statusError : 
                connectionStatus.includes("Connecting") ? styles.statusConnecting : 
                styles.statusSuccess
              ]}>
                {connectionStatus.includes("Connecting") && (
                  <ActivityIndicator size="small" color="#FFF" style={{marginRight: 8}} />
                )}
                <Text style={styles.statusText}>{connectionStatus}</Text>
              </View>
            )}
            
            {/* JSON Input Modal */}
            <Modal
              animationType="slide"
              transparent={true}
              visible={jsonInputVisible}
              onRequestClose={() => setJsonInputVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Enter Custom JSON for Virtual ESP32</Text>
                  <Text style={styles.modalSubtitle}>Define the data your virtual device will send</Text>
                  
                  <TextInput
                    style={styles.jsonInput}
                    multiline={true}
                    numberOfLines={8}
                    value={jsonInput}
                    onChangeText={setJsonInput}
                    placeholder="Enter JSON data here"
                    placeholderTextColor="#666"
                  />
                  
                  {jsonError ? (
                    <Text style={styles.errorText}>{jsonError}</Text>
                  ) : null}
                  
                  <View style={styles.modalButtons}>
                    <Pressable 
                      onPress={() => setJsonInputVisible(false)}
                      style={[styles.modalButton, styles.modalCancelButton]}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </Pressable>
                    
                    <Pressable 
                      onPress={handleJsonSubmit}
                      style={[styles.modalButton, { backgroundColor: '#4ADE80' }]}
                    >
                      <Text style={styles.submitButtonText}>Connect</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </Modal>
            
            {isScanning && (
              <Animated.View 
                style={[
                  styles.loadingOverlay,
                  {
                    opacity: loadingOpacity,
                  }
                ]}
              >
                {/* Multiple radar circles for a more symmetrical wave effect */}
                <Animated.View style={[styles.radarCircle, createRadarAnimStyle(radarAnim1)]} />
                <Animated.View style={[styles.radarCircle, createRadarAnimStyle(radarAnim2)]} />
                <Animated.View style={[styles.radarCircle, createRadarAnimStyle(radarAnim3)]} />
                
                <Animated.View 
                  style={[
                    styles.loadingContainer,
                    {
                      transform: [
                        { scale: loadingScale }
                      ]
                    }
                  ]}
                >
                  <Animated.View 
                    style={[
                      styles.spinnerContainer, 
                      { 
                        transform: [{ rotate: spin }],
                        shadowOpacity: glowIntensity,
                      }
                    ]}
                  >
                    <LinearGradient 
                      colors={virtualModeActive ? ['#6A5ACD', '#9370DB'] : ['#FF5F6D', '#FFC371']} 
                      start={{x: 0, y: 0}} 
                      end={{x: 1, y: 1}} 
                      style={styles.loadingGradient}
                    >
                      <ActivityIndicator size="large" color="#FFFFFF" />
                    </LinearGradient>
                  </Animated.View>
                    
                  <View style={styles.textAndButtonContainer}>
                    <View style={styles.loadingTextContainer}>
                      <Text style={styles.loadingText}>
                        {virtualModeActive 
                          ? "Preparing virtual environment..." 
                          : "Scanning for real devices..."}
                      </Text>
                      <View style={styles.dotsContainer}>
                        <Animated.Text style={[styles.loadingDot, { opacity: dotOpacity1 }]}>•</Animated.Text>
                        <Animated.Text style={[styles.loadingDot, { opacity: dotOpacity2 }]}>•</Animated.Text>
                        <Animated.Text style={[styles.loadingDot, { opacity: dotOpacity3 }]}>•</Animated.Text>
                      </View>
                    </View>
                    
                    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                      <Pressable 
                        onPress={() => { startPulse(); stopScan(); }}
                        style={styles.cancelButton}
                      >
                        <LinearGradient 
                          colors={['#3A3A3A', '#212121']} 
                          start={{x: 0, y: 0}} 
                          end={{x: 1, y: 0}} 
                          style={styles.cancelGradient}
                        >
                          <Text style={styles.cancelText}>Cancel</Text>
                        </LinearGradient>
                      </Pressable>
                    </Animated.View>
                  </View>
                </Animated.View>
              </Animated.View>
            )}
            {connectedDevice ? (
              <React.Fragment>
                <Text style={styles.dataText}>
                  Connected to {virtualModeActive ? '🧪 Virtual ESP32' : connectedDevice.name}
                </Text>
                
                {!virtualModeActive && (
                  <View style={styles.connectionInfoContainer}>
                    <Text style={styles.connectionInfoTitle}>ESP32 Connection Info:</Text>
                    <View style={styles.connectionInfoRow}>
                      <Text style={styles.connectionInfoLabel}>Device ID:</Text>
                      <Text style={styles.connectionInfoValue}>{connectedDevice.id.substring(0, 12)}...</Text>
                    </View>
                    <View style={styles.connectionInfoRow}>
                      <Text style={styles.connectionInfoLabel}>Signal Strength:</Text>
                      <Text style={styles.connectionInfoValue}>
                        {connectedDevice.rssi ? `${connectedDevice.rssi} dBm` : 'Unknown'}
                      </Text>
                    </View>
                    <View style={styles.connectionInfoRow}>
                      <Text style={styles.connectionInfoLabel}>Status:</Text>
                      <Text style={[styles.connectionInfoValue, {color: '#4ADE80'}]}>Active</Text>
                    </View>
                  </View>
                )}
                
                <View>
                  <Text style={styles.dataTitleText}>DTC Data:</Text>
                  {renderDTCData()}
                </View>
                <Animated.View style={[styles.buttonWrapper, { transform: [{ scale: pulseAnim }] }]}>
                  <Pressable onPress={() => { startPulse(); disconnectFromDevice(); }}>
                    <LinearGradient colors={['#FF5F6D', '#FFC371']} start={{x:0,y:0}} end={{x:1,y:0}} style={styles.buttonGradient}>
                      <Text style={styles.buttonText}>Disconnect</Text>
                    </LinearGradient>
                  </Pressable>
                </Animated.View>
              </React.Fragment>
            ) : (
              <React.Fragment>
                {!isScanning && (
                  <View style={styles.buttonContainer}>
                    <Animated.View style={[styles.buttonWrapper, { transform: [{ scale: pulseAnim }] }]}>
                      <Pressable onPress={handleScan}>
                        <LinearGradient 
                          colors={virtualModeActive ? ['#6A5ACD', '#483D8B'] : ['#FF5F6D', '#FFC371']} 
                          start={{x:0,y:0}} 
                          end={{x:1,y:0}} 
                          style={styles.buttonGradient}
                        >
                          <Text style={styles.buttonText}>
                            {virtualModeActive 
                              ? "Prepare Virtual ESP32" 
                              : "Scan for Real Devices"}
                          </Text>
                        </LinearGradient>
                      </Pressable>
                    </Animated.View>
                  </View>
                )}
                {!isScanning && (
                  <ScrollView
                    style={styles.deviceList}
                    contentContainerStyle={styles.deviceListContent}
                    showsVerticalScrollIndicator={false}
                  >
                    {/* Filter devices based on mode */}
                    {allDevices
                      .filter(device => 
                        virtualModeActive 
                          ? device.id === 'test-esp32-device' 
                          : device.id !== 'test-esp32-device'
                      )
                      .map((device, index) => (
                        <Animated.View key={index} style={[styles.buttonWrapper, { transform: [{ scale: pulseAnim }] }]}>
                          <Pressable 
                            onPress={() => { 
                              startPulse(); 
                              if (virtualModeActive && device.id === 'test-esp32-device') {
                                handleVirtualDeviceConnect(device);
                              } else {
                                handleRealDeviceConnect(device); 
                              }
                            }}
                          >
                            <LinearGradient 
                              colors={virtualModeActive ? ['#4ADE80', '#2E8B57'] : ['#FF5F6D', '#FFC371']} 
                              start={{x:0,y:0}} 
                              end={{x:1,y:0}} 
                              style={styles.buttonGradient}
                            >
                              <Text style={styles.buttonText}>
                                {virtualModeActive && device.id === 'test-esp32-device' 
                                  ? '🧪 Configure Virtual ESP32' 
                                  : `Connect to ${device.name}`}
                              </Text>
                            </LinearGradient>
                          </Pressable>
                        </Animated.View>
                      ))
                    }
                    {(!isScanning && scanAttempted && 
                      allDevices.filter(device => 
                        virtualModeActive 
                          ? device.id === 'test-esp32-device' 
                          : device.id !== 'test-esp32-device'
                      ).length === 0
                    ) && (
                      <Text style={styles.dataText}>
                        {virtualModeActive 
                          ? "Click 'Prepare Virtual ESP32' to create a virtual device" 
                          : "No real devices found. Make sure the ESP32 is powered on and broadcasting."}
                      </Text>
                    )}
                  </ScrollView>
                )}
              </React.Fragment>
            )}
          </View>
        </SafeAreaView>
    )
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000',
      padding: 16,
      justifyContent: 'center',
    },
    screenWrapper: {
      gap: 20,
      alignItems: 'center',
    },
    dataTitleText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#FFFFFF',
      textAlign: 'center',
    },
    dataText: {
      fontSize: 16,
      color: '#808080',
      marginTop: 8,
      textAlign: 'center',
    },
    buttonContainer: {
      width: '100%',
      gap: 12,
    },
    buttonWrapper: {
      marginTop: 16,
      borderRadius: 24,
      overflow: 'hidden',
      elevation: 4,
    },
    buttonGradient: {
      padding: 14,
      paddingHorizontal: 24,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
    deviceList: {
      maxHeight: '40%',
      width: '100%',
    },
    deviceListContent: {
      alignItems: 'center',
      paddingBottom: 16,
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.85)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
      width: width * 0.9,
      maxWidth: 400,
      gap: 20,
    },
    spinnerContainer: {
      shadowColor: '#FF5F6D',
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 20,
      elevation: 15,
    },
    loadingGradient: {
      width: 100,
      height: 100,
      borderRadius: 50,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
    },
    textAndButtonContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: 24,
    },
    loadingTextContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingText: {
      color: '#FFF',
      fontSize: 18,
      fontWeight: '500',
      textAlign: 'center',
      textShadowColor: 'rgba(255, 95, 109, 0.5)',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 10,
    },
    dotsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 4,
    },
    loadingDot: {
      color: '#FF5F6D',
      fontSize: 24,
      fontWeight: 'bold',
      marginHorizontal: 2,
    },
    cancelButton: {
      borderRadius: 12,
      overflow: 'hidden',
      width: 100,
    },
    cancelGradient: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    cancelText: {
      color: '#FFC371',
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'center',
    },
    radarCircle: {
      position: 'absolute',
      width: width,
      height: width,
      borderRadius: width / 2,
      borderWidth: 1,
      borderColor: 'rgba(255,95,109,0.4)',
      alignSelf: 'center',
    },
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.75)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      backgroundColor: '#1A1A1A',
      borderRadius: 16,
      padding: 24,
      width: '100%',
      maxWidth: 500,
      maxHeight: '80%',
    },
    modalTitle: {
      color: '#FFFFFF',
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 8,
      textAlign: 'center',
    },
    modalSubtitle: {
      color: '#808080',
      fontSize: 14,
      marginBottom: 16,
      textAlign: 'center',
    },
    jsonInput: {
      backgroundColor: '#0D0D0D',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#333',
      color: '#00FF00',
      fontFamily: 'monospace',
      fontSize: 14,
      padding: 12,
      minHeight: 200,
      textAlignVertical: 'top',
    },
    errorContainer: {
      marginHorizontal: 20,
      marginVertical: 10,
      padding: 16,
      backgroundColor: 'rgba(255, 0, 0, 0.15)',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#ff3b30',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 3,
      width: '90%',
      alignSelf: 'center',
      maxWidth: 450,
    },
    errorIcon: {
      fontSize: 24,
      marginBottom: 8,
    },
    errorText: {
      color: '#ff3b30',
      textAlign: 'center',
      fontWeight: '600',
      fontSize: 16,
      marginBottom: 8,
    },
    errorHint: {
      color: '#666',
      textAlign: 'center',
      fontSize: 14,
      fontStyle: 'italic',
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 16,
    },
    modalButton: {
      flex: 1,
      borderRadius: 12,
      padding: 12,
      alignItems: 'center',
      justifyContent: 'center',
      margin: 8,
    },
    modalCancelButton: {
      backgroundColor: '#333',
    },
    cancelButtonText: {
      color: '#CCC',
      fontSize: 16,
      fontWeight: 'bold',
    },
    submitButtonText: {
      color: '#FFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
    // Mode switcher styles
    modeSwitcherContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#1A1A1A',
      borderRadius: 24,
      padding: 8,
      marginBottom: 16,
    },
    modeText: {
      color: '#808080',
      fontSize: 16,
      fontWeight: '600',
      paddingHorizontal: 12,
    },
    activeModeText: {
      color: '#FFFFFF',
    },
    modeSwitch: {
      marginHorizontal: 8,
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 20,
      marginVertical: 8,
      padding: 12,
      borderRadius: 12,
      opacity: 0.9,
      width: '90%',
      alignSelf: 'center',
      maxWidth: 450,
    },
    statusConnecting: {
      backgroundColor: '#3498db',
    },
    statusSuccess: {
      backgroundColor: '#2ecc71',
    },
    statusError: {
      backgroundColor: '#e74c3c',
    },
    statusText: {
      color: '#FFFFFF',
      fontWeight: '600',
      textAlign: 'center',
      fontSize: 15,
    },
    connectionInfoContainer: {
      backgroundColor: 'rgba(0,0,0,0.3)',
      borderRadius: 12,
      marginVertical: 10,
      padding: 16,
      width: '90%',
      maxWidth: 450,
      alignSelf: 'center',
    },
    connectionInfoTitle: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 12,
      textAlign: 'center',
    },
    connectionInfoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 4,
    },
    connectionInfoLabel: {
      color: '#AAAAAA',
      fontSize: 14,
    },
    connectionInfoValue: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '500',
    },
    dtcDataContainer: {
      backgroundColor: 'rgba(0,0,0,0.3)',
      borderRadius: 12,
      marginVertical: 10,
      padding: 16,
      width: '90%',
      maxWidth: 450,
      alignSelf: 'center',
    },
    dtcRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    dtcLabel: {
      color: '#AAAAAA',
      fontSize: 14,
      fontWeight: '500',
    },
    dtcValue: {
      fontSize: 14,
      fontWeight: '600',
    },
    dtcAlert: {
      color: '#FF5F6D',
    },
    dtcNormal: {
      color: '#4ADE80',
    },
    rawJsonContainer: {
      maxHeight: 200,
      width: '90%',
      alignSelf: 'center',
    },
});
