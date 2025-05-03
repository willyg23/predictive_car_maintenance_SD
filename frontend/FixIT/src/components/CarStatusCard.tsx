import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { CarInfo } from '../types/carTypes';

interface CarStatusCardProps {
  car: CarInfo | null;
  status: { color: string; text: string };
  temperature: number | string;
}

const CarStatusCard: React.FC<CarStatusCardProps> = ({ car, status, temperature }) => {
  // Format temperature value
  const tempValue = typeof temperature === 'string' 
    ? parseFloat(temperature) || 0 
    : temperature || 0;
  
  // Get temperature color
  const getTempColor = (): string => {
    if (tempValue > 90) return '#FF3B30'; // Hot
    if (tempValue > 70) return '#FFCC00'; // Warm
    return '#4CD964'; // Cool
  };
  
  // Format date to more readable format if exists
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'Not set';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Determine maintenance status based on last oil change date
  const getMaintenanceStatus = () => {
    if (!car || !car.last_oil_change) return { status: 'Unknown', color: '#808080' };
    
    try {
      // Check if last_oil_change contains a date string
      if (car.last_oil_change.includes('-') || car.last_oil_change.includes('/')) {
        const lastDate = new Date(car.last_oil_change);
        const now = new Date();
        const nextDate = new Date(car.last_oil_change);
        nextDate.setMonth(nextDate.getMonth() + 3);
        
        if (nextDate < now) {
          return { status: 'Maintenance Due', color: '#FF6B6B' };
        } else if ((nextDate.getTime() - now.getTime()) < 1000 * 60 * 60 * 24 * 14) {
          return { status: 'Service Soon', color: '#FFC371' };
        } else {
          return { status: 'All Good', color: '#4ADE80' };
        }
      } 
      
      // Default status if no valid date format or maintenance is not needed
      return { status: 'All Good', color: '#4ADE80' };
    } catch (error) {
      console.error('Error determining maintenance status:', error);
      return { status: 'Unknown', color: '#808080' };
    }
  };
  
  // Calculate oil change info for display
  const getMaintenanceInfo = () => {
    if (!car || !car.last_oil_change) return null;
    
    try {
      // Check if last_oil_change contains a date string
      if (car.last_oil_change.includes('-') || car.last_oil_change.includes('/')) {
        const lastDate = new Date(car.last_oil_change);
        const now = new Date();
        const nextDate = new Date(car.last_oil_change);
        nextDate.setMonth(nextDate.getMonth() + 3);
        
        const isDue = nextDate < now;
        const isSoon = (nextDate.getTime() - now.getTime()) < 1000 * 60 * 60 * 24 * 14;
        
        return {
          lastOilChange: formatDate(car.last_oil_change),
          nextService: formatDate(nextDate.toISOString()),
          isDue: isDue,
          isSoon: isSoon
        };
      }
      
      // If not a date format, don't display maintenance info
      return null;
    } catch (error) {
      console.error('Error calculating maintenance info:', error);
      return null;
    }
  };
  
  const maintenanceInfo = getMaintenanceInfo();
  const maintenanceStatus = getMaintenanceStatus();
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.carName}>
          {car ? `${car.year} ${car.make} ${car.model}` : 'Connect Your Vehicle'}
        </Text>
        
        <View style={[styles.statusBadge, { backgroundColor: `${maintenanceStatus.color}20` }]}>
          <View style={[styles.statusDot, { backgroundColor: maintenanceStatus.color }]} />
          <Text style={[styles.statusText, { color: maintenanceStatus.color }]}>
            {maintenanceStatus.status}
          </Text>
        </View>
      </View>
      
      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>🔧</Text>
          </View>
          <View>
            <Text style={styles.detailLabel}>Engine Temp</Text>
            <Text style={styles.detailValue}>{tempValue}°C</Text>
          </View>
        </View>
        
        {car?.mileage && (
          <View style={styles.detailItem}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>📊</Text>
            </View>
            <View>
              <Text style={styles.detailLabel}>Mileage</Text>
              <Text style={styles.detailValue}>{car.mileage} km</Text>
              {maintenanceInfo && maintenanceInfo.nextService && (
                <Text style={[
                  styles.maintenanceText, 
                  {color: maintenanceInfo.isDue ? '#FF6B6B' : maintenanceInfo.isSoon ? '#FFCC00' : '#8A8D98'}
                ]}>
                  Next service: {maintenanceInfo.nextService}
                </Text>
              )}
            </View>
          </View>
        )}
      </View>
      
      <View style={styles.tempGaugeContainer}>
        <View style={styles.tempLabels}>
          <Text style={styles.tempLabel}>Cool</Text>
          <Text style={styles.tempLabel}>Normal</Text>
          <Text style={styles.tempLabel}>Hot</Text>
        </View>
        <View style={styles.tempGauge}>
          <View 
            style={[
              styles.tempBar, 
              { width: `${Math.min(Math.max((tempValue - 50) / 100, 0), 1) * 100}%`, backgroundColor: getTempColor() }
            ]} 
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    borderRadius: 16,
    backgroundColor: '#121827',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  carName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontWeight: '600',
    fontSize: 14,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E2235',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  iconText: {
    fontSize: 18,
  },
  detailLabel: {
    color: '#8A8D98',
    fontSize: 12,
  },
  detailValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  maintenanceText: {
    fontSize: 12,
    marginTop: 2,
  },
  tempGaugeContainer: {
    marginTop: 5,
  },
  tempLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  tempLabel: {
    color: '#8A8D98',
    fontSize: 12,
  },
  tempGauge: {
    height: 6,
    backgroundColor: '#1E2235',
    borderRadius: 3,
    overflow: 'hidden',
  },
  tempBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 3,
  },
});

export default CarStatusCard; 