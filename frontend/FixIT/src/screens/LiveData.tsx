import { useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { FlatList, ScrollView, StyleSheet, Text, View } from "react-native"


function LiveData({ route }) {
    const { 
        scanForPeripherals,
        connectToDevice,
        disconnectFromDevice,
        allDevices,
        connectedDevice,
        obdData 
    } = route.params;

    const [displayData, setDisplayData] = useState(obdData);

    useEffect(() => {
        setDisplayData(obdData);
        console.log("OBD Data updated:", obdData);
    }, [obdData]);
    
    
return (
  <View>
    <Text>Device Name: {connectedDevice.name}</Text>
    <Text>Device ID: {connectedDevice.id}</Text>
    <ScrollView style={styles.scrollViewContainer}>
        <Text>
            {displayData}
        </Text>
    </ScrollView>
  </View>
);
}
const styles = StyleSheet.create({
    scrollViewContainer:{
        marginTop:30,
        height:"70%"
    }
})
export default LiveData;

