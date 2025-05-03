import React, { useEffect, useState, useCallback } from "react";
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  ActivityIndicator, 
  TouchableOpacity, 
  StatusBar
} from "react-native";
import { useRoute, RouteProp } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";

// Components
import Header from "../components/Header";
import NavigationBar from "../components/NavigationBar";
import CategorySection from "../components/CategorySection";
import CarStatusCard from "../components/CarStatusCard";
import ChatSection from "../components/ChatSection";

// Services & Types
import { generateInsights } from "../services/OpenAIService";
import { CarInfo, VehicleData, ScreenParams, DiagnosticSection, SectionData } from "../types/carTypes";

const MaintenanceScreen = () => {
  const route = useRoute<RouteProp<Record<string, ScreenParams>, string>>();
  
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [car, setCar] = useState<CarInfo | null>(null);
  const [vehicleData, setVehicleData] = useState<VehicleData>({
    dtcs: [],
    coolant_temp_c: 0,
    check_engine_light: false,
  });
  
  // Diagnostic sections
  const [sections, setSections] = useState<SectionData[]>([
    {
      id: 'overview',
      title: 'Overview',
      icon: 'ℹ️',
      color: '#5856D6',
      content: '',
      isLoading: false,
      isExpanded: true
    },
    {
      id: 'maintenance',
      title: 'Maintenance',
      icon: '📅',
      color: '#4CD964',
      content: '',
      isLoading: false,
      isExpanded: false
    },
    {
      id: 'repairs',
      title: 'Repairs',
      icon: '🛠️',
      color: '#FF3B30',
      content: '',
      isLoading: false,
      isExpanded: false
    },
    {
      id: 'costs',
      title: 'Cost Estimates',
      icon: '💰',
      color: '#5AC8FA',
      content: '',
      isLoading: false,
      isExpanded: false
    }
  ]);

  // Initialize data
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    try {
      // Load vehicle data from params
      if (route.params?.fixedJsonObject) {
        setVehicleData({
          dtcs: Array.isArray(route.params.fixedJsonObject.dtcs) ? route.params.fixedJsonObject.dtcs : [],
          coolant_temp_c: route.params.fixedJsonObject.coolant_temp_c ?? 0,
          check_engine_light: route.params.fixedJsonObject.check_engine_light ?? false,
        });
      }
      
      // Load car data from storage
      const carId = await AsyncStorage.getItem('last_selected_car_id');
      if (carId) {
        const cars = await AsyncStorage.getItem('user_cars');
        if (cars) {
          const parsedCars = JSON.parse(cars);
          const selectedCar = parsedCars.find((c: CarInfo) => c.id === carId);
          if (selectedCar) setCar(selectedCar);
        }
      }
      
      // Generate diagnostic content
      await generateDiagnosticData();
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setIsLoading(false);
    }
  };
  
  // Toggle section expansion
  const toggleSection = (id: DiagnosticSection) => {
    setSections(prev => prev.map(section => 
      section.id === id 
        ? { ...section, isExpanded: !section.isExpanded } 
        : section
    ));
  };
  
  // Check if maintenance is due based only on last oil change date (not mileage)
  const isMaintenanceDue = (car: CarInfo | null): boolean => {
    if (!car || !car.last_oil_change) return false;
    
    // Only check date-based maintenance
    if (car.last_oil_change.includes('-') || car.last_oil_change.includes('/')) {
      try {
        const lastDate = new Date(car.last_oil_change);
        const now = new Date();
        const nextDate = new Date(car.last_oil_change);
        nextDate.setMonth(nextDate.getMonth() + 3); // Assuming 3 months interval
        
        return nextDate < now; // Return true if maintenance is due
      } catch (error) {
        console.error('Error parsing maintenance date:', error);
      }
    }
    
    return false;
  };
  
  // Generate diagnostic data using OpenAI API
  const generateDiagnosticData = useCallback(async (forceRefresh = false) => {
    // Set all sections to loading state
    setSections(prev => prev.map(section => {
      return { ...section, isLoading: true };
    }));
    
    try {
      // Process each section in parallel
      const updatedSections = await Promise.all(
        sections.map(async section => {
          try {
            const cacheKey = `section_${section.id}_${JSON.stringify(vehicleData)}`;
            
            // Format vehicle data properly
            const processedData = {
              dtcs: Array.isArray(vehicleData.dtcs) ? vehicleData.dtcs : [],
              coolant_temp_c: typeof vehicleData.coolant_temp_c === 'string' 
                ? parseFloat(vehicleData.coolant_temp_c) 
                : vehicleData.coolant_temp_c,
              check_engine_light: Boolean(vehicleData.check_engine_light)
            };
            
            // Create specific prompt based on section ID
            let prompt = '';
            switch(section.id) {
              case 'overview':
                prompt = `Provide a VERY BRIEF overview (max 2-3 sentences) summarizing the vehicle status based on the data. ${isMaintenanceDue(car) ? 'Importantly, this vehicle is due for maintenance based on the service date.' : ''} Keep it simple and high-level.`;
                break;
              case 'maintenance':
                prompt = `Recommend specific maintenance actions based on the vehicle data. ${isMaintenanceDue(car) ? 'This vehicle is overdue for an oil change based on the service date.' : ''} List only 2-3 priority items if needed. Be concise.`;
                break;
              case 'repairs':
                prompt = 'Identify any critical repairs needed based on DTCs and other data. Maximum 3 bullet points. If no repairs needed, state this briefly.';
                break;
              case 'costs':
                prompt = `Provide rough cost estimates for any recommended repairs or maintenance. ${isMaintenanceDue(car) ? 'Include cost estimate for an oil change which is needed based on the service date.' : ''} Give ranges rather than specific numbers. Keep very brief.`;
                break;
              default:
                prompt = `Based on the following vehicle data, provide a concise analysis for ${section.title}:`;
            }
            
            // Pass forceRefresh to ignore cache if we're explicitly refreshing
            // Also pass the car data if available, with proper type mapping
            const content = await generateInsights(
              prompt, 
              processedData, 
              cacheKey, 
              forceRefresh,
              car ? {
                id: car.id,
                nickname: car.nickname,
                make: car.make,
                model: car.model,
                year: typeof car.year === 'number' ? car.year.toString() : car.year,
                mileage: car.mileage,
                last_oil_change: car.last_oil_change,
              } : undefined
            );
            
            return {
              ...section,
              content,
              isLoading: false
            };
          } catch (error) {
            console.error(`Error generating content for ${section.id}:`, error);
            
            // Fallback content if API fails
            return {
              ...section,
              content: `Unable to generate ${section.title.toLowerCase()} information at this time.`,
              isLoading: false
            };
          }
        })
      );
      
      setSections(updatedSections);
    } catch (error) {
      console.error('Error generating diagnostic data:', error);
      
      // Reset loading state on error
      setSections(prev => prev.map(section => {
        return { 
          ...section, 
          isLoading: false,
          content: `Unable to generate ${section.title.toLowerCase()} information at this time.`
        };
      }));
    }
  }, [vehicleData, sections, car]);
  
  // Handle refresh button click
  const handleRefresh = () => {
    // Force refresh by skipping cache
    generateDiagnosticData(true);
  };
  
  // Get status color based on vehicle condition
  const getVehicleStatus = () => {
    if (vehicleData.check_engine_light) {
      return { color: "#FF3B30", text: "Issues Detected" };
    }
    if (vehicleData.dtcs.length > 0) {
      return { color: "#FFCC00", text: "Warning" };
    }
    if (isMaintenanceDue(car)) {
      return { color: "#FFCC00", text: "Maintenance Due" };
    }
    return { color: "#4CD964", text: "All Systems Normal" };
  };
  
  // Render refresh button
  const renderRefreshButton = () => (
    <TouchableOpacity 
      style={styles.refreshButton}
      onPress={handleRefresh}
      activeOpacity={0.8}
    >
      <View style={styles.refreshGradient}>
        <Text style={styles.refreshIcon}>↻</Text>
        <Text style={styles.refreshText}>Refresh Analysis</Text>
      </View>
    </TouchableOpacity>
  );
  
  // Loading screen
  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <Header />
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4CD964" />
          <Text style={styles.loadingText}>Analyzing vehicle data...</Text>
        </View>
        <NavigationBar fixedJsonObject={vehicleData} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <Header />
      
      <View style={styles.mainContent}>
        {/* Car Status Card */}
        <CarStatusCard 
          car={car} 
          status={getVehicleStatus()} 
          temperature={vehicleData.coolant_temp_c}
        />
        
        {/* Refresh Button */}
        {renderRefreshButton()}
        
        {/* Main Content */}
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Diagnostic Sections */}
          {sections.map((section, index) => (
            <CategorySection
              key={section.id}
              id={section.id}
              title={section.title}
              icon={section.icon}
              color={section.color}
              content={section.content}
              isLoading={section.isLoading}
              isExpanded={section.isExpanded}
              onToggle={() => toggleSection(section.id as DiagnosticSection)}
            />
          ))}
          
          {/* Ask a Question */}
          <ChatSection vehicleData={vehicleData} />
        </ScrollView>
      </View>
      
      <NavigationBar fixedJsonObject={vehicleData} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  mainContent: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 16,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  refreshButton: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  refreshGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#333333',
  },
  refreshIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  refreshText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '600',
  },
});

export default MaintenanceScreen; 