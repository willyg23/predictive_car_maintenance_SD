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

import CarData from './screens/CarData';
import HomeScreen from './screens/HomeScreen';
import Diagnostics from './screens/Diagnostics';
import LiveData from './screens/LiveData';

const Stack = createNativeStackNavigator();

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaView style={{ flex: 1 }}>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name='GettingStarted' component={GettingStarted}/>
            <Stack.Screen name='CarData' component={CarData}/>
            <Stack.Screen name='HomeScreen' component={HomeScreen} options={{headerShown:false}}/>
            <Stack.Screen name='Diagnostics' component={Diagnostics}/>
            <Stack.Screen name='LiveData' component={LiveData}/>
          </Stack.Navigator>
      </NavigationContainer>
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
