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

// For TypeScript users: if you get a type error on the JSON import, add a declarations.d.ts file with: declare module '*.json';
const carMakesModels: Record<string, string[]> = require('../assets/car-makes-models.json');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const AddCar = () => {
    // Basic form state
    const [year, setYear] = useState('');
    const [make, setMake] = useState('');
    const [model, setModel] = useState('');
    const [nickname, setNickname] = useState('');
    const [mileage, setMileage] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Date picker states
    const [lastOilChange, setLastOilChange] = useState<Date | null>(null);
    const [showLastOilChangePicker, setShowLastOilChangePicker] = useState(false);
    const [purchaseDate, setPurchaseDate] = useState<Date | null>(null);
    const [showPurchaseDatePicker, setShowPurchaseDatePicker] = useState(false);
    
    // Dropdown states
    const [openMake, setOpenMake] = useState(false);
    const [openModel, setOpenModel] = useState(false);
    const [makeItems, setMakeItems] = useState(
      Object.keys(carMakesModels).map(make => ({ label: make, value: make }))
    );
    const [modelItems, setModelItems] = useState<{label: string, value: string}[]>([]);
    
    const navigation = useNavigation<NavigationProp>();
    
    // Update models when make changes
    useEffect(() => {
      if (make && carMakesModels[make]) {
        setModelItems(carMakesModels[make].map((m: string) => ({ label: m, value: m })));
      } else {
        setModelItems([]);
      }
      
      // Reset model if make changes
      if (model) setModel('');
      
    }, [make]);
    
    // User creation/retrieval
    const getOrCreateUserUUID = async (): Promise<string> => {
        let user_uuid = await AsyncStorage.getItem('user_uuid');
        if (!user_uuid) {
            const response = await fetch('https://ii1orwzkzl.execute-api.us-east-2.amazonaws.com/dev/create_fake_user', {
                method: 'POST',
            });
            const data = await response.json();
            user_uuid = data.user_uuid;
            if (user_uuid) {
                await AsyncStorage.setItem('user_uuid', user_uuid);
            } else {
                throw new Error('Failed to create or retrieve user_uuid');
            }
        }
        if (!user_uuid) throw new Error('Failed to create or retrieve user_uuid');
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
    };

    // Save to API
    const saveToDB = async () => {
        if (!make || !model || !year) {
            Alert.alert('Missing Fields', 'Please fill in Make, Model, and Year.');
            return;
        }
        
        setLoading(true);
        try {
            const user_uuid = await getOrCreateUserUUID();
            const url = `https://ii1orwzkzl.execute-api.us-east-2.amazonaws.com/dev/user/${user_uuid}/car/add_user_car`;
            
            // Build request body with all form fields
            const body = {
                make,
                model,
                year: year ? parseInt(year) : undefined,
                mileage: mileage ? parseInt(mileage) : undefined,
                nickname: nickname || undefined,
                last_oil_change: lastOilChange ? lastOilChange.toISOString().split('T')[0] : undefined,
                purchase_date: purchaseDate ? purchaseDate.toISOString().split('T')[0] : undefined,
            };
            
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            
            const data = await response.json();
            if (response.ok) {
                clearForm();
                Alert.alert('Success', 'Car added successfully!', [
                  { text: 'OK', onPress: () => navigation.navigate('HomeScreen') }
                ]);
            } else {
                Alert.alert('Error', data.message || "Failed to add car");
            }
        } catch (err) {
            Alert.alert('Network error');
        } finally {
            setLoading(false);
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
                    <Text style={styles.logo}>🚗 Add Car</Text>
                </View>
                
                <TouchableOpacity 
                    style={[
                        styles.saveButton, 
                        (loading || !make || !model || !year) && styles.disabledButton
                    ]} 
                    disabled={loading || !make || !model || !year}
                    onPress={saveToDB}
                >
                    <Text style={styles.saveText}>
                        {loading ? 'Saving...' : 'Save'}
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
                <View 
                    style={styles.scrollContent}
                >
                    {/* Form Title */}
                    <Text style={styles.pageTitle}>Vehicle Information</Text>
                    
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
                </View>
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