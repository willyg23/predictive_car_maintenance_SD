import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState, useEffect } from "react";
import { 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View, 
  Alert, 
  ActivityIndicator, 
  Platform,
  KeyboardAvoidingView,
  ScrollView
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RootStackParamList } from "../App";
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import DropDownPicker from 'react-native-dropdown-picker';
import NetInfo from '@react-native-community/netinfo';

// For TypeScript users: if you get a type error on the JSON import, add a declarations.d.ts file with: declare module '*.json';
const carMakesModels: Record<string, string[]> = require('../assets/car-makes-models.json');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Define Car type for TypeScript
interface Car {
    id: string;
    nickname: string;
    year: string;
    make: string;
    model: string;
    mileage?: string;
    last_oil_change?: string | null;
    purchase_date?: string | null;
    last_brake_pad_change?: string | null;
    last_maintenance_checkup?: string | null;
}

export const AddCar = () => {
    const route = useRoute();
    const params = route.params as { editMode?: boolean; carData?: Car } | undefined;
    const isEditMode = params?.editMode || false;
    const carToEdit = params?.carData;
    
    // Basic form state
    const [year, setYear] = useState(isEditMode && carToEdit?.year ? carToEdit.year : '');
    const [make, setMake] = useState(isEditMode && carToEdit?.make ? carToEdit.make : '');
    const [model, setModel] = useState(isEditMode && carToEdit?.model ? carToEdit.model : '');
    const [nickname, setNickname] = useState(isEditMode && carToEdit?.nickname ? carToEdit.nickname : '');
    const [mileage, setMileage] = useState(isEditMode && carToEdit?.mileage ? carToEdit.mileage : '');
    const [carId, setCarId] = useState(isEditMode && carToEdit?.id ? carToEdit.id : '');
    const [loading, setLoading] = useState(false);
    
    // Date picker states
    const [lastOilChange, setLastOilChange] = useState<Date | null>(
        isEditMode && carToEdit?.last_oil_change 
            ? new Date(carToEdit.last_oil_change) 
            : null
    );
    const [showLastOilChangePicker, setShowLastOilChangePicker] = useState(false);
    
    const [purchaseDate, setPurchaseDate] = useState<Date | null>(
        isEditMode && carToEdit?.purchase_date 
            ? new Date(carToEdit.purchase_date) 
            : null
    );
    const [showPurchaseDatePicker, setShowPurchaseDatePicker] = useState(false);
    
    // Additional maintenance fields
    const [lastBrakePadChange, setLastBrakePadChange] = useState<Date | null>(
        isEditMode && carToEdit?.last_brake_pad_change 
            ? new Date(carToEdit.last_brake_pad_change) 
            : null
    );
    const [showLastBrakePadChangePicker, setShowLastBrakePadChangePicker] = useState(false);
    
    const [lastMaintenanceCheckup, setLastMaintenanceCheckup] = useState<Date | null>(
        isEditMode && carToEdit?.last_maintenance_checkup 
            ? new Date(carToEdit.last_maintenance_checkup) 
            : null
    );
    const [showLastMaintenanceCheckupPicker, setShowLastMaintenanceCheckupPicker] = useState(false);
    
    // Dropdown states
    const [openMake, setOpenMake] = useState(false);
    const [openModel, setOpenModel] = useState(false);
    const [makeItems, setMakeItems] = useState(
      Object.keys(carMakesModels).map(make => ({ label: make, value: make }))
    );
    const [modelItems, setModelItems] = useState<{label: string, value: string}[]>([]);
    
    const navigation = useNavigation<NavigationProp>();
    
    // Update models when make changes or on initial load in edit mode
    useEffect(() => {
      if (make) {
        const models = carMakesModels[make] || [];
        setModelItems(models.map((m: string) => ({ label: m, value: m })));
        
        // If we're in edit mode and have a model but the modelItems just got set,
        // we don't need to clear the model - it should stay populated
        if (!(isEditMode && carToEdit?.model && model)) {
          // Only reset model if we're not in edit mode with a valid model
          if (!isEditMode && model) {
            setModel('');
          }
        }
      } else {
        setModelItems([]);
        if (model) setModel('');
      }
    }, [make, isEditMode, carToEdit]);

    // Special effect to handle initial model population in edit mode
    useEffect(() => {
      // This effect runs only once on component mount when in edit mode
      if (isEditMode && carToEdit?.make && carToEdit?.model) {
        // Ensure model options are loaded for the selected make
        const models = carMakesModels[carToEdit.make] || [];
        setModelItems(models.map((m: string) => ({ label: m, value: m })));
        console.log(`Edit mode: Prefilling model: ${carToEdit.model} from make: ${carToEdit.make}`);
      }
    }, []);
    
    // User UUID - hardcoded instead of creating fake users
    const getOrCreateUserUUID = async (): Promise<string> => {
        const HARDCODED_UUID = 'e84de32d-0015-46a9-a779-efb42ef98fc7';
        
        // Store the hardcoded UUID in AsyncStorage if not already there
        let user_uuid = await AsyncStorage.getItem('user_uuid');
        if (!user_uuid) {
            await AsyncStorage.setItem('user_uuid', HARDCODED_UUID);
            user_uuid = HARDCODED_UUID;
        }
        
        return user_uuid;
    };

    // Form reset
    const clearForm = () => {
        setYear('');
        setMake('');
        setModel('');
        setNickname('');
        setMileage('');
        setLastOilChange(null);
        setPurchaseDate(null);
        setLastBrakePadChange(null);
        setLastMaintenanceCheckup(null);
    };

    // Update the title based on mode
    const pageTitle = isEditMode ? 'Edit Vehicle' : 'Add Vehicle';
    const headerTitle = isEditMode ? '🚗 Edit Car' : '🚗 Add Car';
    const saveButtonText = isEditMode ? 'Update' : 'Save';

    const handleSubmit = async () => {
        // Basic validation
        if (!year || !make || !model) {
            Alert.alert('Missing Information', 'Please fill in required fields (Year, Make, Model)');
            return;
        }

        try {
            setLoading(true);
            
            // Get network state
            const netState = await NetInfo.fetch();
            
            // Get or create user UUID
            const user_uuid = await getOrCreateUserUUID();
            
            // For debugging purposes
            console.log("Using user UUID:", user_uuid);

            // Create car object (either new or updated)
            const carData = {
                id: isEditMode ? carId : Date.now().toString(), // Use existing ID if editing
                nickname: nickname || `${year} ${make} ${model}`, // Use default nickname if not provided
                year,
                make,
                model,
                mileage: mileage || '0',
                last_oil_change: lastOilChange ? lastOilChange.toISOString() : null,
                purchase_date: purchaseDate ? purchaseDate.toISOString() : null,
                last_brake_pad_change: lastBrakePadChange ? lastBrakePadChange.toISOString() : null,
                last_maintenance_checkup: lastMaintenanceCheckup ? lastMaintenanceCheckup.toISOString() : null,
            };

            // Track which car was edited if in edit mode
            let editedCarId = null;
            if (isEditMode && carId) {
                editedCarId = carId;
                console.log(`Setting up edited car ID for return navigation: ${editedCarId}`);
            }

            // Different actions based on whether we're editing or creating
            if (isEditMode) {
                // Save to AsyncStorage first for offline use
                await updateCarInLocalStorage(carData);
                
                // If online, try to update via backend
                if (netState.isConnected && netState.isInternetReachable) {
                    await updateCarInBackend(user_uuid, carData);
                }
                
                Alert.alert('Success', 'Car updated successfully!');
            } else {
                // Save to AsyncStorage first for offline use
                await saveCarToLocalStorage(carData);
                
                // If online, try to save to backend
                if (netState.isConnected && netState.isInternetReachable) {
                    await saveCarToBackend(user_uuid, carData);
                }
                
                Alert.alert('Success', 'Car added successfully!');
            }

            // Add a small delay before navigating to allow the backend sync to complete
            setTimeout(() => {
                const navParams = { 
                    activeTab: 'cars',
                    focusCarId: editedCarId
                };
                console.log('Navigating with params:', JSON.stringify(navParams));
                navigation.navigate('HomeScreen', navParams);
            }, 500);
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'adding'} car:`, error);
            Alert.alert('Error', `Could not ${isEditMode ? 'update' : 'add'} car. Please try again.`);
        } finally {
            setLoading(false);
        }
    };

    // Function to save car to AsyncStorage
    const saveCarToLocalStorage = async (car: Car): Promise<void> => {
        try {
            // Get existing cars array or initialize a new one
            const existingCarsJSON = await AsyncStorage.getItem('user_cars');
            const existingCars = existingCarsJSON ? JSON.parse(existingCarsJSON) : [];
            
            // Add new car to array
            const updatedCars = [...existingCars, car];
            
            // Save updated array back to AsyncStorage
            await AsyncStorage.setItem('user_cars', JSON.stringify(updatedCars));
            
            console.log('Car saved to local storage');
        } catch (error) {
            console.error('Error saving car to local storage:', error);
            throw error;
        }
    };

    // Function to save car to backend
    const saveCarToBackend = async (userUUID: string, car: Car): Promise<boolean> => {
        try {
            const apiUrl = `https://ii1orwzkzl.execute-api.us-east-2.amazonaws.com/dev/user/${userUUID}/car/add_user_car`;
            
            console.log('Sending car data to API:', apiUrl, car);
            
            // Format the car data according to the API requirements
            const apiBody = {
                make: car.make,
                model: car.model,
                year: parseInt(car.year),
                mileage: car.mileage ? parseInt(car.mileage) : undefined,
                nickname: car.nickname,
                // Only send nickname, not car_nickname to avoid confusion
                last_oil_change: car.last_oil_change ? car.last_oil_change.split('T')[0] : undefined,
                purchase_date: car.purchase_date ? car.purchase_date.split('T')[0] : undefined,
                last_brake_pad_change: car.last_brake_pad_change ? car.last_brake_pad_change.split('T')[0] : undefined,
                last_maintenance_checkup: car.last_maintenance_checkup ? car.last_maintenance_checkup.split('T')[0] : undefined
            };
            
            console.log('API request body:', JSON.stringify(apiBody, null, 2));
            
            // Add timeout to fetch request for better UX
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(apiBody),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            // Log response for debugging
            console.log('API Response status:', response.status);
            
            if (response.ok) {
                const responseData = await response.json();
                console.log('API Response data:', JSON.stringify(responseData, null, 2));
                return true;
            } else {
                const errorText = await response.text();
                console.error('API Error response:', errorText);
                return false;
            }
        } catch (error) {
            console.error('Error saving car to backend:', error);
            // Still consider it a success if saved locally but failed to save to backend
            return false;
        }
    };

    // Function to update car in AsyncStorage
    const updateCarInLocalStorage = async (car: Car): Promise<void> => {
        try {
            // Get existing cars array
            const existingCarsJSON = await AsyncStorage.getItem('user_cars');
            const existingCars = existingCarsJSON ? JSON.parse(existingCarsJSON) : [];
            
            // Update car in array
            const updatedCars = existingCars.map((c: Car) => 
                c.id.toString() === car.id.toString() ? car : c
            );
            
            // Save updated array back to AsyncStorage
            await AsyncStorage.setItem('user_cars', JSON.stringify(updatedCars));
            
            console.log('Car updated in local storage');
        } catch (error) {
            console.error('Error updating car in local storage:', error);
            throw error;
        }
    };

    // Function to update car in backend
    const updateCarInBackend = async (userUUID: string, car: Car): Promise<boolean> => {
        try {
            const apiUrl = `https://ii1orwzkzl.execute-api.us-east-2.amazonaws.com/dev/user/${userUUID}/car/${car.id}/details`;
            
            console.log('Sending updated car data to API:', apiUrl);
            console.log('API request body:', JSON.stringify(car, null, 2));
            
            // Format the car data according to the API requirements
            const apiBody = {
                make: car.make,
                model: car.model,
                year: parseInt(car.year),
                mileage: car.mileage ? parseInt(car.mileage) : undefined,
                nickname: car.nickname,
                last_oil_change: car.last_oil_change ? car.last_oil_change.split('T')[0] : undefined,
                purchase_date: car.purchase_date ? car.purchase_date.split('T')[0] : undefined,
                last_brake_pad_change: car.last_brake_pad_change ? car.last_brake_pad_change.split('T')[0] : undefined,
                last_maintenance_checkup: car.last_maintenance_checkup ? car.last_maintenance_checkup.split('T')[0] : undefined
            };
            
            console.log('Formatted API request body:', JSON.stringify(apiBody, null, 2));
            
            // Add timeout to fetch request for better UX
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
            
            const response = await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(apiBody),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            // Log response for debugging
            console.log('API Response status:', response.status);
            
            if (response.ok) {
                const responseData = await response.json();
                console.log('API Response data:', JSON.stringify(responseData, null, 2));
                return true;
            } else {
                const errorText = await response.text();
                console.error('API Error response:', errorText);
                return false;
            }
        } catch (error) {
            console.error('Error updating car in backend:', error);
            return false;
        }
    };

    // Date picker handlers
    const onLastOilChangeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
      setShowLastOilChangePicker(Platform.OS === 'ios');
      if (selectedDate) setLastOilChange(selectedDate);
    };
    
    const onPurchaseDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
      setShowPurchaseDatePicker(Platform.OS === 'ios');
      if (selectedDate) setPurchaseDate(selectedDate);
    };

    const onLastBrakePadChangeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
      setShowLastBrakePadChangePicker(Platform.OS === 'ios');
      if (selectedDate) setLastBrakePadChange(selectedDate);
    };
    
    const onLastMaintenanceCheckupChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
      setShowLastMaintenanceCheckupPicker(Platform.OS === 'ios');
      if (selectedDate) setLastMaintenanceCheckup(selectedDate);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton} 
                    disabled={loading}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backText}>←</Text>
                </TouchableOpacity>
                
                <View style={styles.titleContainer}>
                    <Text style={styles.logo}>{headerTitle}</Text>
                </View>
                
                <TouchableOpacity 
                    style={[
                        styles.saveButton, 
                        (loading || !make || !model || !year) && styles.disabledButton
                    ]} 
                    disabled={loading || !make || !model || !year}
                    onPress={handleSubmit}
                >
                    <Text style={styles.saveText}>
                        {loading ? 'Saving...' : saveButtonText}
                    </Text>
                    {loading && 
                        <ActivityIndicator color="#fff" size="small" style={{ marginLeft: 8 }}/>
                    } 
                </TouchableOpacity>
            </View>
            
            {/* Form Content */}
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Form Title */}
                    <Text style={styles.pageTitle}>{pageTitle}</Text>
                    
                    {/* Basic Information Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Basic Information</Text>
                        
                        {/* Year Input */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Year *</Text>
                            <TextInput
                                style={styles.input}
                                value={year}
                                onChangeText={setYear}
                                placeholder="2023"
                                placeholderTextColor="#8E8E93"
                                keyboardType="numeric"
                                editable={!loading}
                            />
                        </View>
                        
                        {/* Ensure sufficient space between dropdown containers */}
                        <View style={[styles.formGroup, { marginBottom: 16, zIndex: 2000 }]}>
                            <Text style={styles.label}>Make *</Text>
                            <DropDownPicker
                                open={openMake}
                                value={make}
                                items={makeItems}
                                setOpen={() => {
                                    setOpenMake(!openMake);
                                    if (openMake) {
                                        setTimeout(() => setOpenModel(false), 100);
                                    } else {
                                        setOpenModel(false);
                                    }
                                }}
                                setValue={setMake}
                                setItems={setMakeItems}
                                placeholder="Select Make"
                                style={styles.dropdownStyle}
                                dropDownContainerStyle={[styles.dropdownContainer, { 
                                    maxHeight: 200
                                }]}
                                textStyle={styles.dropdownText}
                                listItemLabelStyle={styles.dropdownItemLabel}
                                disabled={loading}
                                searchable={true}
                                searchPlaceholder="Search makes..."
                                searchContainerStyle={{ borderBottomColor: '#4CD964' }}
                                searchTextInputStyle={{ color: 'white' }}
                                zIndex={2000}
                                zIndexInverse={1000}
                                listMode="MODAL"
                                modalProps={{
                                    animationType: "slide"
                                }}
                                modalContentContainerStyle={{
                                    backgroundColor: "#1C1C1E"
                                }}
                                modalTitleStyle={{
                                    color: "white"
                                }}
                            />
                        </View>
                        
                        {/* Extra space for model dropdown */}
                        <View style={[styles.formGroup, { marginBottom: 16, zIndex: 1000 }]}>
                            <Text style={styles.label}>Model *</Text>
                            <DropDownPicker
                                open={openModel}
                                value={model}
                                items={modelItems}
                                setOpen={() => {
                                    setOpenModel(!openModel);
                                    if (openModel) {
                                        setTimeout(() => setOpenMake(false), 100);
                                    } else {
                                        setOpenMake(false);
                                    }
                                }}
                                setValue={setModel}
                                setItems={setModelItems}
                                placeholder="Select Model"
                                style={styles.dropdownStyle}
                                dropDownContainerStyle={[styles.dropdownContainer, { 
                                    maxHeight: 200
                                }]}
                                textStyle={styles.dropdownText}
                                listItemLabelStyle={styles.dropdownItemLabel}
                                disabled={!make || loading}
                                searchable={true}
                                searchPlaceholder="Search models..."
                                searchContainerStyle={{ borderBottomColor: '#4CD964' }}
                                searchTextInputStyle={{ color: 'white' }}
                                zIndex={1000}
                                zIndexInverse={2000}
                                listMode="MODAL"
                                modalProps={{
                                    animationType: "slide"
                                }}
                                modalContentContainerStyle={{
                                    backgroundColor: "#1C1C1E"
                                }}
                                modalTitleStyle={{
                                    color: "white"
                                }}
                            />
                        </View>
                        
                        {/* Nickname Input */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Nickname</Text>
                            <TextInput
                                style={styles.input}
                                value={nickname}
                                onChangeText={setNickname}
                                placeholder="Give your car a name"
                                placeholderTextColor="#8E8E93"
                                editable={!loading}
                            />
                        </View>
                    </View>
                    
                    {/* Odometer Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Odometer</Text>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Current Mileage</Text>
                            <TextInput
                                style={styles.input}
                                value={mileage}
                                onChangeText={setMileage}
                                placeholder="e.g. 45000"
                                placeholderTextColor="#8E8E93"
                                keyboardType="numeric"
                                editable={!loading}
                            />
                        </View>
                    </View>
                    
                    {/* Maintenance Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Maintenance History</Text>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Last Oil Change</Text>
                            <TouchableOpacity
                                style={styles.dateInput}
                                onPress={() => setShowLastOilChangePicker(true)}
                                disabled={loading}
                            >
                                <Text style={styles.dateText}>
                                    {lastOilChange ? lastOilChange.toLocaleDateString() : 'Select date'}
                                </Text>
                            </TouchableOpacity>
                            {showLastOilChangePicker && (
                                <DateTimePicker
                                    value={lastOilChange || new Date()}
                                    mode="date"
                                    display="default"
                                    onChange={onLastOilChangeChange}
                                    maximumDate={new Date()}
                                />
                            )}
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Last Brake Pad Change</Text>
                            <TouchableOpacity
                                style={styles.dateInput}
                                onPress={() => setShowLastBrakePadChangePicker(true)}
                                disabled={loading}
                            >
                                <Text style={styles.dateText}>
                                    {lastBrakePadChange ? lastBrakePadChange.toLocaleDateString() : 'Select date'}
                                </Text>
                            </TouchableOpacity>
                            {showLastBrakePadChangePicker && (
                                <DateTimePicker
                                    value={lastBrakePadChange || new Date()}
                                    mode="date"
                                    display="default"
                                    onChange={onLastBrakePadChangeChange}
                                    maximumDate={new Date()}
                                />
                            )}
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Last Maintenance Checkup</Text>
                            <TouchableOpacity
                                style={styles.dateInput}
                                onPress={() => setShowLastMaintenanceCheckupPicker(true)}
                                disabled={loading}
                            >
                                <Text style={styles.dateText}>
                                    {lastMaintenanceCheckup ? lastMaintenanceCheckup.toLocaleDateString() : 'Select date'}
                                </Text>
                            </TouchableOpacity>
                            {showLastMaintenanceCheckupPicker && (
                                <DateTimePicker
                                    value={lastMaintenanceCheckup || new Date()}
                                    mode="date"
                                    display="default"
                                    onChange={onLastMaintenanceCheckupChange}
                                    maximumDate={new Date()}
                                />
                            )}
                        </View>
                    </View>
                    
                    {/* Purchase Info Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Purchase Information</Text>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Purchase Date</Text>
                            <TouchableOpacity
                                style={styles.dateInput}
                                onPress={() => setShowPurchaseDatePicker(true)}
                                disabled={loading}
                            >
                                <Text style={styles.dateText}>
                                    {purchaseDate ? purchaseDate.toLocaleDateString() : 'Select date'}
                                </Text>
                            </TouchableOpacity>
                            {showPurchaseDatePicker && (
                                <DateTimePicker
                                    value={purchaseDate || new Date()}
                                    mode="date"
                                    display="default"
                                    onChange={onPurchaseDateChange}
                                    maximumDate={new Date()}
                                />
                            )}
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#1C1C1E',
    },
    backButton: {
        padding: 8,
        width: 44,
        alignItems: 'center',
    },
    backText: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    logo: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4CD964',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    disabledButton: {
        backgroundColor: '#4CD96480',
        opacity: 0.6,
    },
    saveText: {
        color: 'white',
        fontWeight: '600',
    },
    scrollContent: {
        paddingBottom: 40,
        flexGrow: 1,
        paddingHorizontal: 16,
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginTop: 20,
        marginBottom: 16,
    },
    section: {
        backgroundColor: '#1C1C1E',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#4CD964',
        marginBottom: 16,
    },
    formGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        color: 'white',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#2C2C2E',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#4CD964',
        paddingHorizontal: 12,
        paddingVertical: 12,
        color: 'white',
        fontSize: 16,
    },
    dateInput: {
        backgroundColor: '#2C2C2E',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#4CD964',
        paddingHorizontal: 12,
        paddingVertical: 12,
    },
    dateText: {
        color: 'white',
        fontSize: 16,
    },
    dropdownStyle: {
        backgroundColor: '#2C2C2E',
        borderColor: '#4CD964',
        borderWidth: 1,
        minHeight: 40,
        height: 40,
    },
    dropdownContainer: {
        backgroundColor: '#1C1C1E',
        borderColor: '#4CD964',
        borderWidth: 1,
    },
    dropdownText: {
        color: 'white',
        fontSize: 16,
    },
    dropdownItemLabel: {
        color: 'white',
    },
});