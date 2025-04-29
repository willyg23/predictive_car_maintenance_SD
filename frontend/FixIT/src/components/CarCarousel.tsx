import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable, Image, FlatList, ActivityIndicator, RefreshControl, Alert, TouchableOpacity, PanResponder, Animated, ViewToken } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import NetInfo from '@react-native-community/netinfo';

// Add function to delete a car
const deleteCar = async (carId: string, userUUID: string): Promise<boolean> => {
  try {
    console.log(`Attempting to delete car ${carId} for user ${userUUID}`);
    
    // Check network connectivity
    const netState = await NetInfo.fetch();
    if (!netState.isConnected || !netState.isInternetReachable) {
      throw new Error('No internet connection');
    }
    
    // Send delete request to API
    const apiUrl = `https://ii1orwzkzl.execute-api.us-east-2.amazonaws.com/dev/user/${userUUID}/car/${carId}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    console.log(`Delete API response status: ${response.status}`);
    
    if (response.ok) {
      // Also remove from local storage
      const carsData = await AsyncStorage.getItem('user_cars');
      if (carsData) {
        const cars = JSON.parse(carsData);
        // Use numeric comparison for API-returned IDs
        const updatedCars = cars.filter((car: any) => {
          // Car ID can be either a number or string depending on source
          return car.id.toString() !== carId.toString();
        });
        await AsyncStorage.setItem('user_cars', JSON.stringify(updatedCars));
        console.log(`Car ${carId} removed from local storage. ${updatedCars.length} cars remaining.`);
      }
      return true;
    } else {
      const errorText = await response.text();
      console.error('Delete API Error response:', errorText);
      return false;
    }
  } catch (error) {
    console.error('Error deleting car:', error);
    return false;
  }
};

// Add function to edit a car
const editCar = async (carId: string, userUUID: string, updatedCarData: Partial<Car>): Promise<boolean> => {
  try {
    console.log(`Attempting to edit car ${carId} for user ${userUUID}`);
    console.log('Edit payload:', JSON.stringify(updatedCarData, null, 2));
    
    // Check network connectivity
    const netState = await NetInfo.fetch();
    if (!netState.isConnected || !netState.isInternetReachable) {
      throw new Error('No internet connection');
    }
    
    // Send PUT request to API
    const apiUrl = `https://ii1orwzkzl.execute-api.us-east-2.amazonaws.com/dev/user/${userUUID}/car/${carId}/details`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    // Format API request body according to backend requirements
    const apiBody = {
      make: updatedCarData.make,
      model: updatedCarData.model,
      year: updatedCarData.year ? parseInt(updatedCarData.year) : undefined,
      mileage: updatedCarData.mileage ? parseInt(updatedCarData.mileage) : undefined,
      nickname: updatedCarData.nickname,
      last_oil_change: updatedCarData.last_oil_change,
      purchase_date: updatedCarData.purchase_date
    };
    
    console.log('API Edit request body:', JSON.stringify(apiBody, null, 2));
    
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
    console.log(`Edit API response status: ${response.status}`);
    
    if (response.ok) {
      const responseData = await response.json();
      console.log('Edit API response data:', JSON.stringify(responseData, null, 2));
      
      // Also update in local storage
      const carsData = await AsyncStorage.getItem('user_cars');
      if (carsData) {
        const cars = JSON.parse(carsData);
        const updatedCars = cars.map((car: any) => {
          if (car.id.toString() === carId.toString()) {
            return { ...car, ...updatedCarData };
          }
          return car;
        });
        await AsyncStorage.setItem('user_cars', JSON.stringify(updatedCars));
        console.log(`Car ${carId} updated in local storage.`);
      }
      return true;
    } else {
      const errorText = await response.text();
      console.error('Edit API Error response:', errorText);
      return false;
    }
  } catch (error) {
    console.error('Error editing car:', error);
    return false;
  }
};

// Interface for Car data
interface Car {
  id: string;
  nickname: string;
  make: string;
  model: string;
  year: string;
  mileage?: string;
  last_oil_change?: string;
  purchase_date?: string;
  color?: string;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Update the component interface to accept focusCarId
interface CarCarouselProps {
  focusCarId?: string | null;
}

const CarCarousel = ({ focusCarId }: CarCarouselProps) => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userUUID, setUserUUID] = useState<string | null>(null);
  const [deletingCarId, setDeletingCarId] = useState<string | null>(null);
  const [editingCarId, setEditingCarId] = useState<string | null>(null);
  const [targetCarId, setTargetCarId] = useState<string | null>(null);
  const [selectedCarIndex, setSelectedCarIndex] = useState<number>(0);
  const navigation = useNavigation<NavigationProp>();
  const windowWidth = Dimensions.get('window').width;
  const flatListRef = useRef<FlatList>(null);
  const isMounted = useRef(false);

  // Function to find car index by ID
  const findCarIndexById = useCallback((id: string | null) => {
    if (!id) return -1;
    return cars.findIndex(car => car.id.toString() === id.toString());
  }, [cars]);

  // Function to store the selected car ID in AsyncStorage
  const saveSelectedCar = useCallback(async (carId: string) => {
    try {
      await AsyncStorage.setItem('last_selected_car_id', carId);
      console.log(`Saved car ID ${carId} as last selected`);
    } catch (error) {
      console.error('Error saving selected car ID:', error);
    }
  }, []);

  // Load last selected car on mount
  useEffect(() => {
    const loadLastSelectedCar = async () => {
      try {
        const lastCarId = await AsyncStorage.getItem('last_selected_car_id');
        if (lastCarId && !focusCarId) {
          console.log(`Found last selected car ID: ${lastCarId}`);
          setTargetCarId(lastCarId);
        }
      } catch (error) {
        console.error('Error loading last selected car ID:', error);
      }
    };

    if (!isMounted.current) {
      isMounted.current = true;
      loadLastSelectedCar();
    }
  }, [focusCarId]);

  // Handle car selection when user scrolls or taps
  const handleCarSelect = useCallback((index: number) => {
    setSelectedCarIndex(index);
    
    if (cars.length > 0 && index >= 0 && index < cars.length) {
      const carId = cars[index].id;
      saveSelectedCar(carId);
    }
  }, [cars, saveSelectedCar]);

  // Get user UUID on mount
  useEffect(() => {
    const getUserUUID = async () => {
      try {
        const uuid = await AsyncStorage.getItem('user_uuid');
        setUserUUID(uuid);
      } catch (error) {
        console.error('Error getting user UUID:', error);
      }
    };
    
    getUserUUID();
  }, []);

  // Function to handle car deletion
  const handleDeleteCar = (car: Car) => {
    Alert.alert(
      'Delete Car',
      `Are you sure you want to delete "${car.nickname}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!userUUID) {
              Alert.alert('Error', 'User information not available');
              return;
            }
            
            setDeletingCarId(car.id);
            const success = await deleteCar(car.id, userUUID);
            setDeletingCarId(null);
            
            if (success) {
              // Remove car from state
              setCars(prevCars => prevCars.filter(c => c.id !== car.id));
              Alert.alert('Success', 'Car deleted successfully');
              
              // Refresh data after a short delay to sync with backend
              setTimeout(() => {
                onRefresh();
              }, 1000);
            } else {
              Alert.alert('Error', 'Failed to delete car. Please try again.');
            }
          }
        }
      ]
    );
  };

  // Function to handle car editing
  const handleEditCar = (car: Car) => {
    if (!userUUID) {
      Alert.alert('Error', 'User information not available');
      return;
    }
    
    // Navigate to edit screen with the car data
    navigation.navigate('AddCar', { 
      editMode: true, 
      carData: car 
    });
  };

  // Function to fetch cars - declared before it's used
  const fetchCars = useCallback(async () => {
    try {
      setError(null);
      
      // Use existing userUUID if available, or fetch it
      let uuid = userUUID;
      if (!uuid) {
        uuid = await AsyncStorage.getItem('user_uuid');
        if (!uuid) {
          console.log('No user UUID found');
          setLoading(false);
          setRefreshing(false);
          return;
        }
        setUserUUID(uuid);
      }
      
      // Check network connectivity
      const netState = await NetInfo.fetch();
      
      // If online, try to fetch from API
      if (netState.isConnected && netState.isInternetReachable) {
        try {
          const response = await fetch(`https://ii1orwzkzl.execute-api.us-east-2.amazonaws.com/dev/user/${uuid}/cars`);
          
          // Log response for debugging
          console.log(`API Response status: ${response.status}`);
          
          if (response.ok) {
            const data = await response.json();
            console.log('Raw Cars API response:', data);
            
            if (data && data.data && Array.isArray(data.data)) {
              // Log the first car in detail to see its structure
              if (data.data.length > 0) {
                console.log('First car details:', JSON.stringify(data.data[0], null, 2));
              }
              
              // Transform API car data to match our Car interface
              const transformedCars = data.data.map((apiCar: any) => {
                // Generate random color if none exists
                const carColors = ['#4ADE80', '#FF5F6D', '#FFC371', '#64D2FF', '#A78BFA', '#EC4899'];
                const randomColor = carColors[Math.floor(Math.random() * carColors.length)];
                
                // Make sure to use the provided nickname if available, otherwise use the fallback format
                const displayNickname = apiCar.nickname || `${apiCar.year} ${apiCar.make} ${apiCar.model}`;
                
                // Log the nickname extraction for debugging
                console.log(`Car ID ${apiCar.car_id}: API nickname=${apiCar.nickname}, Using nickname="${displayNickname}"`);
                
                return {
                  id: apiCar.car_id.toString(),
                  nickname: displayNickname,
                  make: apiCar.make,
                  model: apiCar.model,
                  year: apiCar.year.toString(),
                  mileage: apiCar.mileage ? apiCar.mileage.toString() : undefined,
                  last_oil_change: apiCar.last_oil_change,
                  purchase_date: apiCar.purchase_date,
                  color: apiCar.color || randomColor
                };
              });
              
              console.log('Transformed cars:', JSON.stringify(transformedCars));
              setCars(transformedCars);
              
              // Update local storage with transformed data
              await AsyncStorage.setItem('user_cars', JSON.stringify(transformedCars));
              setLoading(false);
              setRefreshing(false);
              
              // Store the target car ID for scrolling after state update
              if (focusCarId) {
                console.log(`Storing target car ID for scrolling: ${focusCarId}`);
                setTargetCarId(focusCarId);
              }
              
              return;
            }
          } else {
            console.log('API returned error status', response.status);
            throw new Error(`API Error: ${response.status}`);
          }
        } catch (apiError) {
          console.error('Error fetching from API:', apiError);
          setError('Could not connect to server. Showing local data instead.');
          // Continue to fallback to AsyncStorage
        }
      }
      
      // Fallback: Get from AsyncStorage
      const carsData = await AsyncStorage.getItem('user_cars');
      if (carsData) {
        const parsedCars = JSON.parse(carsData);
        console.log('Cars fetched from AsyncStorage:', parsedCars);
        setCars(parsedCars);
        
        // Store the target car ID for scrolling after state update
        if (focusCarId) {
          console.log(`Storing target car ID for local storage cars: ${focusCarId}`);
          setTargetCarId(focusCarId);
        }
      } else {
        // If no cars in AsyncStorage either, show demo cars
        console.log('No cars found in AsyncStorage');
        // We'll let the demo car logic below handle this case
      }
    } catch (error) {
      console.error('Error fetching cars:', error);
      setError('Error loading cars. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userUUID, focusCarId]);

  // Fetch on initial mount - this is now after fetchCars is defined
  useEffect(() => {
    fetchCars();
  }, [fetchCars]);
  
  // Watch for targetCarId changes to scroll to car
  useEffect(() => {
    if (targetCarId && cars.length > 0 && !loading && flatListRef.current) {
      const carIndex = findCarIndexById(targetCarId);
      if (carIndex !== -1) {
        console.log(`Preparing to scroll to car ID ${targetCarId} at index ${carIndex}`);
        
        // Make sure we have enough items rendered before scrolling
        // First render all items by setting initialNumToRender to the full list
        if (flatListRef.current) {
          // Wait longer for the FlatList to properly initialize
          setTimeout(() => {
            try {
              console.log(`Attempting to scroll to index ${carIndex}...`);
              flatListRef.current?.scrollToIndex({
                index: carIndex,
                animated: true,
                viewPosition: 0.5,
              });
              setTargetCarId(null);
            } catch (error) {
              console.error('Error scrolling to car:', error);
              
              // Fall back to offset approach if scrollToIndex fails
              console.log(`Falling back to scrollToOffset for index ${carIndex}`);
              const offset = carIndex * (windowWidth - 32);
              flatListRef.current?.scrollToOffset({
                offset,
                animated: true,
              });
              setTargetCarId(null);
            }
          }, 1000); // Increase timeout to ensure list is rendered
        }
      } else {
        console.log(`Car ID ${targetCarId} not found in list of ${cars.length} cars`);
        setTargetCarId(null);
      }
    }
  }, [targetCarId, cars, loading, findCarIndexById, windowWidth]);
  
  // Update targetCarId if focusCarId changes and we already have cars loaded
  useEffect(() => {
    if (focusCarId && cars.length > 0 && !loading) {
      console.log(`Focus car ID changed to ${focusCarId}, updating target`);
      setTargetCarId(focusCarId);
    }
  }, [focusCarId, cars.length, loading]);

  // Refresh every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('Screen is focused, refreshing cars...');
      fetchCars();
      return () => {
        // Cleanup function
        console.log('Screen is blurred');
      };
    }, [fetchCars])
  );

  // Handle pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCars();
  }, [fetchCars]);

  // Demo cars for testing if no cars are found
  useEffect(() => {
    if (!loading && !refreshing && cars.length === 0) {
      // Add demo cars if none exist
      const demoCars: Car[] = [
        {
          id: '1',
          nickname: 'My Tesla',
          make: 'Tesla',
          model: 'Model 3',
          year: '2022',
          mileage: '15000',
          color: '#64D2FF'
        },
        {
          id: '2',
          nickname: 'Work Truck',
          make: 'Ford',
          model: 'F-150',
          year: '2020',
          mileage: '45000',
          color: '#FF5F6D'
        }
      ];
      setCars(demoCars);
      console.log('Added demo cars since no cars were found');
      
      // Also save these to AsyncStorage to help debug
      AsyncStorage.setItem('user_cars', JSON.stringify(demoCars))
        .then(() => console.log('Demo cars saved to AsyncStorage'))
        .catch(err => console.error('Error saving demo cars to AsyncStorage:', err));
    }
  }, [loading, refreshing, cars]);

  const handleAddCar = () => {
    navigation.navigate('AddCar');
  };

  const renderCarItem = ({ item, index }: { item: Car; index: number }) => {
    // Format date to more readable format if exists
    const formatDate = (dateStr: string | null | undefined) => {
      if (!dateStr) return 'Not set';
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    // Calculate next oil change date (3 months after last oil change)
    const getNextOilChange = (dateStr: string | null | undefined) => {
      if (!dateStr) return 'Not set';
      const date = new Date(dateStr);
      date.setMonth(date.getMonth() + 3);
      return formatDate(date.toISOString());
    };

    // Determine maintenance status
    const getMaintenanceStatus = (lastOilChange: string | null | undefined) => {
      if (!lastOilChange) return { status: 'Unknown', color: '#808080' };
      
      const lastDate = new Date(lastOilChange);
      const now = new Date();
      const nextDate = new Date(lastOilChange);
      nextDate.setMonth(nextDate.getMonth() + 3);
      
      if (nextDate < now) {
        return { status: 'Maintenance Due', color: '#FF6B6B' };
      } else if ((nextDate.getTime() - now.getTime()) < 1000 * 60 * 60 * 24 * 14) {
        return { status: 'Service Soon', color: '#FFC371' };
      } else {
        return { status: 'All Good', color: '#4ADE80' };
      }
    };
    
    // Get car emoji based on make
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
    
    const maintenanceStatus = getMaintenanceStatus(item.last_oil_change);
    const carEmoji = getCarEmoji(item.make);

    // Handle direct tap on a car card
    const handleCardPress = () => {
      // Manually select this car
      handleCarSelect(index);
      
      // Can also add future functionality like navigate to car details
      console.log(`Selected car: ${item.nickname}`);
    };

    return (
      <View style={[styles.carCardContainer, { width: windowWidth - 48 }]}>
        <Pressable 
          style={[
            styles.carCard,
            { opacity: deletingCarId === item.id ? 0.7 : 1 } // Dim while deleting
          ]}
          onPress={handleCardPress}
        >
          {/* Card Header with car info and status */}
          <View style={styles.cardHeader}>
            <View style={styles.carInfo}>
              <Text style={styles.carEmoji}>{carEmoji}</Text>
              <View style={styles.carTitleContainer}>
                <Text style={styles.carNickname} numberOfLines={1} ellipsizeMode="tail">
                  {item.nickname}
                </Text>
                <Text style={styles.carModel}>{item.year} {item.make} {item.model}</Text>
              </View>
            </View>
            
            <View style={[
              styles.statusChip, 
              { backgroundColor: `${maintenanceStatus.color}20` }
            ]}>
              <View style={[styles.statusDot, { backgroundColor: maintenanceStatus.color }]} />
              <Text style={[styles.statusText, { color: maintenanceStatus.color }]}>
                {maintenanceStatus.status}
              </Text>
            </View>
          </View>
          
          {/* Car details section */}
          <View style={styles.carDetailsSection}>
            {/* Mileage */}
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Text style={styles.detailIcon}>📊</Text>
              </View>
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Mileage</Text>
                <Text style={styles.detailValue}>{item.mileage || 'Not set'} mi</Text>
              </View>
            </View>
            
            {/* Last Service */}
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Text style={styles.detailIcon}>🔧</Text>
              </View>
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Last Service</Text>
                <Text style={styles.detailValue}>
                  {item.last_oil_change ? formatDate(item.last_oil_change) : 'Not set'}
                </Text>
              </View>
            </View>
            
            {/* Next Service */}
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Text style={styles.detailIcon}>📅</Text>
              </View>
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Next Service</Text>
                <Text style={[
                  styles.detailValue,
                  { color: item.last_oil_change ? maintenanceStatus.color : '#FFFFFF' }
                ]}>
                  {item.last_oil_change ? getNextOilChange(item.last_oil_change) : 'Not set'}
                </Text>
              </View>
            </View>
          </View>
          
          {/* Action Buttons */}
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEditCar(item)}
              disabled={deletingCarId !== null}
            >
              <Text style={styles.actionButtonIcon}>✏️</Text>
              <Text style={styles.actionButtonText}>Edit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteCar(item)}
              disabled={deletingCarId !== null}
            >
              {deletingCarId === item.id ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Text style={styles.actionButtonIcon}>🗑️</Text>
                  <Text style={styles.actionButtonText}>Delete</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
          
          {/* Color accent on the side */}
          <View 
            style={[
              styles.colorAccent, 
              { backgroundColor: item.color || '#4ADE80' }
            ]} 
          />
        </Pressable>
      </View>
    );
  };

  const renderAddCarCard = () => (
    <View style={[styles.carCardContainer, { width: windowWidth - 48 }]}>
      <Pressable 
        style={styles.addCarCard}
        onPress={handleAddCar}
      >
        <View style={styles.addCarContent}>
          <View style={styles.addCarIconContainer}>
            <Text style={styles.addCarIcon}>+</Text>
          </View>
          
          <Text style={styles.addCarTitle}>Add New Vehicle</Text>
          
          <Text style={styles.addCarDescription}>
            Track maintenance, get diagnostics, and receive personalized insights
          </Text>
        </View>
      </Pressable>
    </View>
  );

  // Add this to the FlatList component to detect visible items
  const handleViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      const centerItem = viewableItems[0];
      if (centerItem.index !== null) {
        handleCarSelect(centerItem.index);
      }
    }
  }, [handleCarSelect]);

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4ADE80" />
        <Text style={styles.loadingText}>Loading your vehicles...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>My Vehicles</Text>
        <Text style={styles.headerCount}>{cars.length} {cars.length === 1 ? 'vehicle' : 'vehicles'}</Text>
      </View>
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      <FlatList
        ref={flatListRef}
        data={cars}
        renderItem={renderCarItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContainer}
        snapToAlignment="center"
        snapToInterval={windowWidth - 32}
        decelerationRate="fast"
        ListFooterComponent={renderAddCarCard}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#4ADE80"
            colors={["#4ADE80"]}
          />
        }
        removeClippedSubviews={false}
        initialNumToRender={cars.length || 10} // Render all cars initially to avoid measurement issues
        maxToRenderPerBatch={5}
        windowSize={10} // Increase window size to render more items
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50
        }}
        maintainVisibleContentPosition={{ // Help maintain position during content changes
          minIndexForVisible: 0,
        }}
        onScrollToIndexFailed={(info) => {
          console.warn('Failed to scroll to car:', info);
          // Calculate better offset based on the average item size
          const offset = info.index * info.averageItemLength;
          console.log(`Attempting recovery scroll to offset ${offset} for index ${info.index}`);
          
          setTimeout(() => {
            if (flatListRef.current) {
              flatListRef.current.scrollToOffset({
                offset,
                animated: true,
              });
            }
          }, 500);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerCount: {
    fontSize: 15,
    color: '#A0A0A0',
    fontWeight: '500',
  },
  carouselContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  carCardContainer: {
    marginRight: 16,
    marginBottom: 8,
    height: 'auto',
  },
  carCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    position: 'relative',
    overflow: 'hidden',
  },
  colorAccent: {
    position: 'absolute',
    left: 0,
    top: 20,
    bottom: 20,
    width: 4,
    borderRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  carInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  carEmoji: {
    fontSize: 28,
    marginRight: 12,
    backgroundColor: '#2A2A2A',
    width: 50,
    height: 50,
    textAlign: 'center',
    lineHeight: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  carTitleContainer: {
    flex: 1,
  },
  carNickname: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  carModel: {
    fontSize: 14,
    color: '#A0A0A0',
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  carDetailsSection: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 18,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIconContainer: {
    width: 32,
    alignItems: 'center',
    marginRight: 10,
  },
  detailIcon: {
    fontSize: 16,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    color: '#A0A0A0',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
  // Add Car Card
  addCarCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    height: '100%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderStyle: 'dashed',
  },
  addCarContent: {
    alignItems: 'center',
    maxWidth: 240,
  },
  addCarIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(76, 217, 100, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  addCarIcon: {
    fontSize: 32,
    color: '#4CD964',
    fontWeight: 'bold',
  },
  addCarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  addCarDescription: {
    fontSize: 14,
    color: '#A0A0A0',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 12,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    marginHorizontal: 16,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default CarCarousel; 