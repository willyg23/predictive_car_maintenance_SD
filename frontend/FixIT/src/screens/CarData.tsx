import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import useBLE from "../../scripts/useBLE";
import { useNavigation } from "@react-navigation/native";

const CarData = () => {

  const {
      scanForPeripherals,
      connectToDevice,
      disconnectFromDevice,
      allDevices,
      connectedDevice,
      obdData,
    } = useBLE();
  const navigation = useNavigation();
    return(
        <SafeAreaView style={styles.container}>
          <ScrollView>
          <View style={styles.dataTitleWrapper}>
            <Text style={styles.dataTitleText}>BLE OBD-II Scanner</Text>
            {connectedDevice ? (
              <>
                <Text style={styles.dataText}>
                  Connected to {connectedDevice.name}
                </Text>
                <View>
                  <Text style={styles.dataTitleText}>DTC Data:</Text>
                  {obdData.length > 0 ? (
                    obdData.map((dtc, index) => (
                      <Text key={index} style={styles.dataText}>
                        {dtc}
                      </Text>
                    ))
                  ) : (
                    <Text style={styles.dataText}>No DTCs received.</Text>
                  )}
                </View>
                <TouchableOpacity onPress={disconnectFromDevice} style={styles.ctaButton}>
                  <Text style={styles.ctaButtonText}>Disconnect</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity onPress={scanForPeripherals} style={styles.ctaButton}>
                  <Text style={styles.ctaButtonText}>Scan for Devices</Text>
                </TouchableOpacity>
                
               
              </>
            )}
          </View>
        </ScrollView>
    </SafeAreaView>
    )
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f2f2f2',
    },
    dataTitleWrapper: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    dataTitleText: {
      fontSize: 30,
      fontWeight: 'bold',
      textAlign: 'center',
      marginHorizontal: 20,
      color: 'black',
    },
    dataText: {
      fontSize: 20,
      marginTop: 10,
      color: 'black',
    },
    ctaButton: {
      backgroundColor: 'blue',
      padding: 10,
      margin: 10,
      borderRadius: 5,
    },
    ctaButtonText: {
      color: 'white',
      fontSize: 18,
    },
  });

export default CarData;