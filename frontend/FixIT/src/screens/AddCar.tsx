import { NavigationProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import { Button, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { GestureHandlerRootView, Pressable, ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { RootStackParamList } from "../App";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const AddCar = () => {
    const [year, setYear] = useState('');
    const [make, setMake] = useState('');
    const [model, setModel] = useState('');
    const [nickname, setNickname] = useState('');
    const [mileage, setMileage] = useState('');
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute();
    
    const saveToDB = () => {
      // call APi to save data 

      navigation.navigate('HomeScreen')
    }
    return (
      <SafeAreaView style={styles.container}>
         {/* Header */}
         <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton}>
                        
                    </TouchableOpacity>
                    <View style={styles.titleContainer}>
                        <Text style={styles.logo}>🚗 FixIT</Text>
                    </View>
                    <TouchableOpacity style={styles.saveButton}>
                        <Button title='save' onPress={saveToDB}/>
                    </TouchableOpacity>
                </View>
                    
        <GestureHandlerRootView>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.pageTitle}>Add Vehicle Information</Text>

                {/* Basic Information Section */}
                <View style={styles.section}>
                <Text style={styles.sectionTitle}>Basic Information</Text>
                
                    <View style={styles.row}>
                        <View style={styles.halfGroup}>
                            <Text style={styles.label}>Year</Text>
                            <View style={styles.inputContainer}>
                                {/* <Ionicons name="calendar-outline" size={20} color="#8E8E93" style={styles.inputIcon} /> */}
                                <TextInput
                                style={styles.input}
                                value={year}
                                onChangeText={setYear}
                                placeholder="2023"
                                placeholderTextColor="#8E8E93"
                                />
                            </View>
                        </View>
        
                        <View style={styles.halfGroup}>
                            <Text style={styles.label}>Make</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    value={year}
                                    onChangeText={setMake}
                                    placeholder="e.g. Honda, Toyota"
                                    placeholderTextColor="#8E8E93"
                                    />
                                    {/* <Ionicons name="chevron-down" size={20} color="#8E8E93" /> */}
                            </View>
                        </View>
                    </View>
                
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Model</Text>
                        <TextInput
                        style={styles.fullInput}
                        value={model}
                        onChangeText={setModel}
                        placeholder="e.g. Camry, Civic, F-150"
                        placeholderTextColor="#8E8E93"
                        />
                    </View>
        
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Nickname (Optional)</Text>
                        <TextInput
                        style={styles.fullInput}
                        value={nickname}
                        onChangeText={setNickname}
                        placeholder="Give your car a name"
                        placeholderTextColor="#8E8E93"
                        />
                    </View>
                </View>
        
                    {/* Odometer Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Odometer</Text>
                        
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Current Mileage</Text>
                            <View style={styles.inputContainer}>
                            {/* <Ionicons name="speedometer-outline" size={20} color="#8E8E93" style={styles.inputIcon} /> */}
                            <TextInput
                                style={styles.input}
                                value={mileage}
                                onChangeText={setMileage}
                                placeholder="e.g. 45000"
                                placeholderTextColor="#8E8E93"
                                keyboardType="numeric"
                            />
                            </View>
                        </View>

        
                    </View>

                    {/* Maintenance Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Maintenace History</Text>
                        
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Last Oil Change</Text>
                            <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                // value={mileage}
                                // onChangeText={}
                                placeholder="Select date"
                                placeholderTextColor="#8E8E93"
                                keyboardType="default"
                            />
                            </View>
                        </View>
                    </View>

                    {/* Purchase Info Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Purchase Information</Text>
                        
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Purchase Date</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    // value={mileage}
                                    // onChangeText={}
                                    placeholder="Select date"
                                    placeholderTextColor="#8E8E93"
                                    keyboardType="default"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Purchase Price (Optional)</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    // value={mileage}
                                    // onChangeText={}
                                    placeholder="$ e.g 2500"
                                    placeholderTextColor="#8E8E93"
                                    keyboardType="default"
                                />
                            </View>
                        </View>

                    </View>
            </ScrollView>

        </GestureHandlerRootView>
        
        
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
    },
    titleContainer: {
      flex: 1,
      alignItems: 'center',
    },
    logo: {
      color: 'white',
      fontSize: 24,
      fontWeight: 'bold',
    },
    saveButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#4CD964',
      paddingHorizontal: 16,
      paddingVertical:1,
      borderRadius: 8,
    },
    saveText: {
      color: 'white',
      marginLeft: 4,
      fontWeight: '600',
    },
    pageTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: 'white',
      marginTop: 24,
      marginBottom: 16,
      paddingHorizontal: 16,
    },
    section: {
      backgroundColor: '#1C1C1E',
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 16,
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: '600',
      color: '#4CD964',
      marginBottom: 16,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    inputGroup: {
      marginBottom: 16,
      marginHorizontal: 4,
    },
    halfGroup:{
      flex:1,  
    },
    label: {
      fontSize: 16,
      color: 'white',
      marginBottom: 8,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#2C2C2E',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
    },
    inputIcon: {
      marginRight: 8,
    },
    input: {
      flex: 1,
      color: 'white',
      fontSize: 16,
    },
    fullInput: {
      backgroundColor: '#2C2C2E',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      color: 'white',
      fontSize: 16,
      
    },
    dropdownText: {
      flex: 1,
      color: '#8E8E93',
      fontSize: 16,
    },
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 20, // Add padding at bottom for better scrolling experience
    },
    content: {
        padding: 16,
        gap: 20,
    },
  });