/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GettingStarted from './screens/GettingStarted';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Login from './screens/Login';
import SignIn from './screens/SiginIn';
import CarData from './screens/CarData';
import HomeScreen from './screens/HomeScreen';
import MaintenanceScreen from './screens/MaintenanceScreen';
import PremiumScreen from './screens/PremiumScreen';
import ServiceHistoryScreen from './screens/ServiceHistoryScreen';
import { TapToScan } from './screens/TapToScan';
import { AddCar } from './screens/AddCar';
import { BLEProvider } from '../scripts/BLEContext';

export type RootStackParamList = {
  GettingStarted: undefined;
  CarData: undefined;
  HomeScreen: { activeTab?: string; focusCarId?: string | null } | undefined;
  Maintenance: undefined;
  Premium: undefined;
  Login: undefined;
  SignIn: undefined;
  AddCar: { editMode?: boolean; carData?: any } | undefined;
  TapToScan: undefined;
  ServiceHistory: { carId?: string } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <BLEProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name='GettingStarted' component={GettingStarted}/>
            <Stack.Screen name='CarData' component={CarData}/>
            <Stack.Screen name='HomeScreen' component={HomeScreen} options={{headerShown:false}}/>
            <Stack.Screen name='Maintenance' component={MaintenanceScreen} options={{headerShown:false}}/>
            <Stack.Screen name='Premium' component={PremiumScreen} options={{headerShown:false}}/>
            <Stack.Screen name='ServiceHistory' component={ServiceHistoryScreen} options={{headerShown:false}}/>
            <Stack.Screen name='AddCar' component={AddCar} options={{headerShown:false}}/>
            <Stack.Screen name='TapToScan' component={TapToScan} options={{headerShown:false}}/>
            
            {/* <Stack.Screen name='Login' component={Login}/>
            <Stack.Screen name='SignIn' component={SignIn}/> */}
          </Stack.Navigator>
        </NavigationContainer>
      </BLEProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
