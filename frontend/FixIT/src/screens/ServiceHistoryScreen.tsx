import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Animated, Modal, TextInput, Alert, Platform } from "react-native";
import Header from "../components/Header";
import NavigationBar from "../components/NavigationBar";
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import LinearGradient from "react-native-linear-gradient";
import DateTimePicker from '@react-native-community/datetimepicker';
import type { DateTimePickerEvent } from '@react-native-community/datetimepicker';

// Add interface for the route params type
interface ServiceHistoryParams {
  carId?: string;
}

interface Car {
  id: string;
  nickname: string;
  make: string;
  model: string;
  year: string;
  mileage?: string;
  last_oil_change?: string;
  purchase_date?: string;
  last_brake_pad_change?: string;
  last_maintenance_checkup?: string;
  color?: string;
}

// Dummy service history data
interface ServiceRecord {
  id: string;
  date: string;
  type: string;
  description: string;
  cost: string;
  shop: string;
}

const ServiceHistoryScreen = () => {
  const route = useRoute<RouteProp<Record<string, ServiceHistoryParams>, string>>();
  const navigation = useNavigation();
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [serviceRecords, setServiceRecords] = useState<ServiceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  
  // Add Service Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [newServiceType, setNewServiceType] = useState('');
  const [newServiceDescription, setNewServiceDescription] = useState('');
  const [newServiceCost, setNewServiceCost] = useState('');
  const [newServiceShop, setNewServiceShop] = useState('');
  const [newServiceDate, setNewServiceDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  useEffect(() => {
    const loadSelectedCar = async () => {
      try {
        // Try to get the car ID from route params first
        const carId = route.params?.carId;
        
        // If no car ID in params, try to get the last selected car from storage
        const targetCarId = carId || await AsyncStorage.getItem('last_selected_car_id');
        
        if (!targetCarId) {
          console.log('No car ID found.');
          setIsLoading(false);
          return;
        }
        
        // Fetch cars from storage
        const carsData = await AsyncStorage.getItem('user_cars');
        if (carsData) {
          const cars = JSON.parse(carsData);
          const car = cars.find((c: Car) => c.id.toString() === targetCarId.toString());
          
          if (car) {
            setSelectedCar(car);
            // Generate service records based on the car's maintenance dates
            generateServiceRecordsFromCar(car);
          } else {
            console.log('Selected car not found in storage.');
          }
        }
      } catch (error) {
        console.error('Error loading selected car:', error);
      } finally {
        setIsLoading(false);
        
        // Animate the cards appearance
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true
        }).start();
      }
    };
    
    loadSelectedCar();
  }, [route.params]);
  
  const generateServiceRecordsFromCar = (car: Car) => {
    const records: ServiceRecord[] = [];

    // Add real maintenance records based on car data
    if (car.last_oil_change) {
      records.push({
        id: '1',
        date: car.last_oil_change,
        type: 'Oil Change',
        description: `Regular oil change and filter replacement for ${car.make} ${car.model}`,
        cost: '$49.99',
        shop: 'QuickLube Services'
      });
    }
    
    if (car.last_brake_pad_change) {
      records.push({
        id: '2',
        date: car.last_brake_pad_change,
        type: 'Brake Service',
        description: 'Front and rear brake pads replacement and rotor inspection',
        cost: '$210.50',
        shop: 'AutoZone Service Center'
      });
    }
    
    if (car.last_maintenance_checkup) {
      records.push({
        id: '3',
        date: car.last_maintenance_checkup, 
        type: 'Maintenance Checkup',
        description: 'Full vehicle inspection, fluid checks, and diagnostics',
        cost: '$89.95',
        shop: car.make + ' Dealership'
      });
    }
    
    // Add previous service record based on purchase date if available
    if (car.purchase_date) {
      records.push({
        id: '4',
        date: car.purchase_date,
        type: 'Vehicle Purchase',
        description: `Acquisition of ${car.year} ${car.make} ${car.model}`,
        cost: 'N/A',
        shop: car.make + ' Dealership'
      });
    }
    
    // Add a placeholder record if no maintenance records exist
    if (records.length === 0) {
      const today = new Date();
      records.push({
        id: '5',
        date: today.toISOString(),
        type: 'Vehicle Added',
        description: `Added ${car.year} ${car.make} ${car.model} to your garage`,
        cost: 'N/A',
        shop: 'FixIT App'
      });
    }
    
    // Sort records by date (newest first)
    records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setServiceRecords(records);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  const getServiceEmoji = (type: string) => {
    switch(type.toLowerCase()) {
      case 'oil change': return '🛢️';
      case 'tire rotation': return '🔄';
      case 'brake service': return '🛑';
      case 'maintenance checkup': return '🔍';
      case 'vehicle purchase': return '🏁';
      case 'vehicle added': return '✅';
      case 'battery replacement': return '🔋';
      default: return '🧰';
    }
  };
  
  const getCarEmoji = (make: string) => {
    const makeNormalized = make.toLowerCase();
    
    if (makeNormalized.includes('ford')) return '🛻';
    if (makeNormalized.includes('toyota')) return '🚙';
    if (makeNormalized.includes('honda')) return '🚗';
    if (makeNormalized.includes('bmw') || makeNormalized.includes('mercedes')) return '🏎️';
    if (makeNormalized.includes('jeep')) return '🚜';
    if (makeNormalized.includes('chevrolet') || makeNormalized.includes('chevy')) return '🚘';
    return '🚗';
  };
  
  // Handle new service date change
  const onServiceDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) setNewServiceDate(selectedDate);
  };
  
  // Handle adding a new service
  const handleAddService = async () => {
    // Validate input
    if (!newServiceType || !newServiceDescription || !newServiceCost || !newServiceShop) {
      Alert.alert("Missing Information", "Please fill in all fields");
      return;
    }
    
    if (!selectedCar) {
      Alert.alert("Error", "No car selected");
      return;
    }
    
    // Create new service record
    const newRecord: ServiceRecord = {
      id: Date.now().toString(),
      date: newServiceDate.toISOString(),
      type: newServiceType,
      description: newServiceDescription,
      cost: newServiceCost.startsWith('$') ? newServiceCost : `$${newServiceCost}`,
      shop: newServiceShop
    };
    
    try {
      // Get existing records from AsyncStorage if any
      const storageKey = `car_service_records_${selectedCar.id}`;
      const existingRecordsStr = await AsyncStorage.getItem(storageKey);
      const existingRecords = existingRecordsStr ? JSON.parse(existingRecordsStr) : [];
      
      // Add new record
      const updatedRecords = [newRecord, ...existingRecords];
      
      // Save back to AsyncStorage
      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedRecords));
      
      // Update state
      const updatedServiceRecords = [newRecord, ...serviceRecords];
      setServiceRecords(updatedServiceRecords);
      
      // Close modal and reset form
      setModalVisible(false);
      resetForm();
      
      // Show success message
      Alert.alert("Success", "Service record added successfully");
    } catch (error) {
      console.error("Error saving service record:", error);
      Alert.alert("Error", "Failed to save service record");
    }
  };
  
  // Reset form fields
  const resetForm = () => {
    setNewServiceType('');
    setNewServiceDescription('');
    setNewServiceCost('');
    setNewServiceShop('');
    setNewServiceDate(new Date());
  };
  
  // Add this to the loadSelectedCar function, after the car is found
  useEffect(() => {
    const loadStoredServiceRecords = async () => {
      if (selectedCar) {
        try {
          const storageKey = `car_service_records_${selectedCar.id}`;
          const storedRecordsStr = await AsyncStorage.getItem(storageKey);
          
          if (storedRecordsStr) {
            // Parse stored records
            const storedRecords = JSON.parse(storedRecordsStr);
            
            // Generate base records from car data
            const baseRecords = [];
            
            // Add real maintenance records based on car data
            if (selectedCar.last_oil_change) {
              baseRecords.push({
                id: 'oil-' + selectedCar.id,
                date: selectedCar.last_oil_change,
                type: 'Oil Change',
                description: `Regular oil change and filter replacement for ${selectedCar.make} ${selectedCar.model}`,
                cost: '$49.99',
                shop: 'QuickLube Services'
              });
            }
            
            if (selectedCar.last_brake_pad_change) {
              baseRecords.push({
                id: 'brake-' + selectedCar.id,
                date: selectedCar.last_brake_pad_change,
                type: 'Brake Service',
                description: 'Front and rear brake pads replacement and rotor inspection',
                cost: '$210.50',
                shop: 'AutoZone Service Center'
              });
            }
            
            if (selectedCar.last_maintenance_checkup) {
              baseRecords.push({
                id: 'maint-' + selectedCar.id,
                date: selectedCar.last_maintenance_checkup, 
                type: 'Maintenance Checkup',
                description: 'Full vehicle inspection, fluid checks, and diagnostics',
                cost: '$89.95',
                shop: selectedCar.make + ' Dealership'
              });
            }
            
            if (selectedCar.purchase_date) {
              baseRecords.push({
                id: 'purchase-' + selectedCar.id,
                date: selectedCar.purchase_date,
                type: 'Vehicle Purchase',
                description: `Acquisition of ${selectedCar.year} ${selectedCar.make} ${selectedCar.model}`,
                cost: 'N/A',
                shop: selectedCar.make + ' Dealership'
              });
            }
            
            // Combine stored records with base records
            const combinedRecords = [...storedRecords, ...baseRecords];
            
            // Sort records by date (newest first)
            combinedRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            
            // Update state with combined records
            setServiceRecords(combinedRecords);
          } else {
            // If no stored records, generate from car data
            generateServiceRecordsFromCar(selectedCar);
          }
        } catch (error) {
          console.error('Error loading stored service records:', error);
          // Fallback to generating records
          generateServiceRecordsFromCar(selectedCar);
        }
      }
    };
    
    loadStoredServiceRecords();
  }, [selectedCar]);
  
  return (
    <View style={styles.container}>
      <Header />
      <Text style={styles.title}>Service History</Text>
      
      {selectedCar ? (
        <View style={styles.vehicleInfoContainer}>
          <Text style={styles.vehicleEmoji}>{getCarEmoji(selectedCar.make)}</Text>
          <View>
            <Text style={styles.vehicleName}>{selectedCar.nickname}</Text>
            <Text style={styles.vehicleDetails}>{selectedCar.year} {selectedCar.make} {selectedCar.model}</Text>
          </View>
          <View style={[styles.mileageBadge, { backgroundColor: `${selectedCar.color}30` || '#4ADE8030' }]}>
            <Text style={[styles.mileageText, { color: selectedCar.color || '#4ADE80' }]}>
              {selectedCar.mileage || '0'} mi
            </Text>
          </View>
        </View>
      ) : isLoading ? (
        <Text style={styles.loadingText}>Loading car information...</Text>
      ) : (
        <Text style={styles.noCarText}>No car selected. Please select a car from the Cars tab.</Text>
      )}
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {serviceRecords.length > 0 ? (
          <>
            <View style={styles.timelineHeader}>
              <Text style={styles.timelineHeaderText}>Maintenance Timeline</Text>
              <TouchableOpacity 
                style={styles.addServiceButton}
                onPress={() => setModalVisible(true)}
              >
                <Text style={styles.addServiceText}>+ Add Service</Text>
              </TouchableOpacity>
            </View>
            
            {serviceRecords.map((record, index) => (
              <Animated.View 
                key={record.id}
                style={[
                  styles.serviceCard,
                  { transform: [{ scale: scaleAnim }] }
                ]}
              >
                <View style={styles.serviceHeader}>
                  <View style={styles.serviceType}>
                    <Text style={styles.serviceEmoji}>{getServiceEmoji(record.type)}</Text>
                    <View>
                      <Text style={styles.serviceTypeText}>{record.type}</Text>
                      <Text style={styles.serviceDate}>{formatDate(record.date)}</Text>
                    </View>
                  </View>
                  {record.cost !== 'N/A' && (
                    <LinearGradient
                      colors={[selectedCar?.color || '#4ADE80', selectedCar?.color ? `${selectedCar.color}80` : '#64D2FF']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.costBadge}
                    >
                      <Text style={styles.costText}>{record.cost}</Text>
                    </LinearGradient>
                  )}
                </View>
                
                <Text style={styles.serviceDescription}>{record.description}</Text>
                
                <View style={styles.serviceFooter}>
                  <View style={styles.serviceDetail}>
                    <Text style={styles.serviceDetailLabel}>Service Date</Text>
                    <Text style={styles.serviceDetailValue}>{formatDate(record.date)}</Text>
                  </View>
                  
                  <View style={styles.serviceDetail}>
                    <Text style={styles.serviceDetailLabel}>Service Center</Text>
                    <Text style={styles.serviceDetailValue}>{record.shop}</Text>
                  </View>
                </View>
                
                {/* Timeline connector */}
                {index < serviceRecords.length - 1 && (
                  <View style={styles.timelineConnector}>
                    <View style={styles.timelineDot} />
                    <View style={styles.timelineLine} />
                    <View style={styles.timelineDot} />
                  </View>
                )}
              </Animated.View>
            ))}
            
            <TouchableOpacity style={styles.viewFullHistoryButton}>
              <Text style={styles.viewFullHistoryText}>View Complete Service Records</Text>
            </TouchableOpacity>
          </>
        ) : selectedCar ? (
          <View style={styles.noRecordsContainer}>
            <Text style={styles.noRecordsEmoji}>📋</Text>
            <Text style={styles.noRecordsText}>No service records found</Text>
            <Text style={styles.noRecordsSubtext}>Start tracking your maintenance by adding your first service record</Text>
            <TouchableOpacity 
              style={styles.addFirstRecordButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.addFirstRecordText}>Add Your First Service</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
      
      {/* Add Service Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          resetForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Service Record</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {/* Service Type */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Service Type</Text>
              <TextInput
                style={styles.formInput}
                value={newServiceType}
                onChangeText={setNewServiceType}
                placeholder="Oil Change, Brake Service, etc."
                placeholderTextColor="#8E8E93"
              />
            </View>
            
            {/* Service Description */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Description</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={newServiceDescription}
                onChangeText={setNewServiceDescription}
                placeholder="Brief description of the service performed"
                placeholderTextColor="#8E8E93"
                multiline={true}
                numberOfLines={3}
              />
            </View>
            
            {/* Service Cost */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Cost</Text>
              <TextInput
                style={styles.formInput}
                value={newServiceCost}
                onChangeText={setNewServiceCost}
                placeholder="$0.00"
                placeholderTextColor="#8E8E93"
                keyboardType="decimal-pad"
              />
            </View>
            
            {/* Service Provider */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Service Provider</Text>
              <TextInput
                style={styles.formInput}
                value={newServiceShop}
                onChangeText={setNewServiceShop}
                placeholder="Dealership, mechanic, etc."
                placeholderTextColor="#8E8E93"
              />
            </View>
            
            {/* Service Date */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Service Date</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateText}>
                  {newServiceDate.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={newServiceDate}
                  mode="date"
                  display="default"
                  onChange={onServiceDateChange}
                  maximumDate={new Date()}
                />
              )}
            </View>
            
            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleAddService}
            >
              <Text style={styles.submitButtonText}>Save Service Record</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      <NavigationBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 80,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  loadingText: {
    color: '#808080',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  noCarText: {
    color: '#808080',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 30,
  },
  vehicleInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  vehicleEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  vehicleName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  vehicleDetails: {
    color: '#A0A0A0',
    fontSize: 14,
  },
  mileageBadge: {
    marginLeft: 'auto',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mileageText: {
    fontSize: 14,
    fontWeight: '600',
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timelineHeaderText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  addServiceButton: {
    backgroundColor: '#2D2D2D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  addServiceText: {
    color: '#4ADE80',
    fontSize: 14,
    fontWeight: '600',
  },
  serviceCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  serviceType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  serviceTypeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  serviceDate: {
    color: '#A0A0A0',
    fontSize: 14,
  },
  costBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  costText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  serviceDescription: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  serviceDetail: {
    flex: 1,
  },
  serviceDetailLabel: {
    color: '#A0A0A0',
    fontSize: 12,
    marginBottom: 2,
  },
  serviceDetailValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  timelineConnector: {
    position: 'absolute',
    left: 28,
    top: '100%',
    alignItems: 'center',
    height: 16,
  },
  timelineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ADE80',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#4ADE80',
    marginVertical: 2,
  },
  viewFullHistoryButton: {
    backgroundColor: '#2D2D2D',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  viewFullHistoryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  noRecordsContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
  },
  noRecordsEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  noRecordsText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  noRecordsSubtext: {
    color: '#A0A0A0',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  addFirstRecordButton: {
    backgroundColor: '#4ADE80',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addFirstRecordText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  modalCloseButton: {
    padding: 5,
  },
  modalCloseText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4ADE80',
    color: '#FFFFFF',
    fontSize: 16,
    padding: 12,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dateInput: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4ADE80',
    color: '#FFFFFF',
    fontSize: 16,
    padding: 12,
  },
  dateText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#4ADE80',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ServiceHistoryScreen; 