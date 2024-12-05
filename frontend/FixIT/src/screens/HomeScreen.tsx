import { Image, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useEffect, useState } from 'react';
import useBLE from "../../scripts/useBLE";
import { useNavigation } from "@react-navigation/native";

const HomeScreen = () => {
    const [deviceConnected, setDeviceConnected] = useState(false);

    // The value below are all functions and variables needed for device to be connected
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
        <View style={styles.container}>

            <View style={styles.headerContainer}>
                <View style={{marginLeft:30, margin:"auto"}}>
                    <View>
                        <Text style={styles.header1Text}>OBD2 Scanner</Text>
                    </View> 

                    <View>
                        { deviceConnected ? (
                            <>
                                <Text style={styles.string}>Connected: Honda Civic 2022</Text>
                            </>
                        ) : (
                            <>
                                <Text style={styles.string}>Unconnected: Connect device</Text>
                            </>
                        )
                        }
                    </View>
                </View>
            </View>

            <View style={styles.doubleBoxContainer}>
                <View style={styles.box}>
                    <View style={styles.centerIconContainer}>
                        <View style={styles.centerIcon}>
                            <Image style={styles.icon} source={require("../../assets/thermometer.png")}/>
                        </View>
                    </View>

                    <View style={styles.textContainer}>
                        <Text style={styles.boxTitle}>Engine Temp</Text>
                    </View>

                    <View style={styles.valueContainer}>
                        { deviceConnected ? (
                                <>
                                    <Text style={styles.boxValue}>194°F</Text>
                                </>
                            ) : (
                                <>
                                    <Text style={styles.boxValue}>--</Text>
                                </>
                            )
                        }
                    </View>
                   
                        
                </View>
                <View style={styles.box}>

                    <View style={styles.centerIconContainer}>
                        <View style={styles.centerIcon}>
                            <Image style={styles.icon} source={require("../../assets/battery.png")}/>
                        </View>
                    </View>

                    <View style={styles.textContainer}>
                        <Text style={styles.boxTitle}>Battery</Text>
                    </View>

                    <View style={styles.valueContainer}>
                        { deviceConnected ? (
                                <>
                                    <Text style={styles.boxValue}>12.6V</Text>
                                </>
                            ) : (
                                <>
                                    <Text style={styles.boxValue}>--</Text>
                                </>
                            )
                        }
                    </View>
                   
                </View>
            </View>

            <View style={styles.rectangleBox}>

                <View style={styles.stringContainer}>
                    <View style={{margin:"auto", marginLeft:12}}>
                        <Text style={styles.header2Text}> Vehicle Status</Text>
                        <Text style={styles.substring}>All systems operational</Text>
                    </View>
                </View>

                <View style={{margin:'auto',marginLeft:"30%"}}>
                    <Image style={{width:40,height:40}} source={require("../../assets/warning.png")}/>
                </View>
            </View>

            <View style={styles.DoublerectangleBoxContainer}>
                <View style={styles.rectangle}>
                    <View style={styles.iconStringContainer}>
                        { deviceConnected ? (
                                <>
                                    <Pressable onPress={() => navigation.navigate('LiveData', {
                                        scanForPeripherals,
                                        connectToDevice,
                                        disconnectFromDevice,
                                        allDevices,
                                        connectedDevice,
                                        obdData
                                    })} style={({ pressed }) => [
                                        {
                                          flexDirection: "row",
                                          transform: [{ scale: pressed ? 0.95 : 1 }],
                                          opacity: pressed ? 0.8 : 1,
                                          transition: 'all 0.2s'
                                        }
                                      ]}>
                                        <Image style={{width:24,height:24,margin:'auto'}} source={require("../../assets/pulse.png")}/>
                                        <Text style={{marginLeft:5,color:"white", fontSize:20, fontWeight:"500"}}>Live Data</Text>
                                    </Pressable>
                                </>
                            ) : (
                                <>
                                <Text style={{color:"white", fontSize:40}}>--</Text>
                                </>
                            )
                        }
                        
                    </View>
                    
                </View>
                <View style={styles.rectangle}>
                    <View style={styles.iconStringContainer}>
                    { deviceConnected ? (
                        <>
                            <Pressable onPress={() => navigation.navigate('Diagnostics')} style={({ pressed }) => [
                                        {
                                          flexDirection: "row",
                                          transform: [{ scale: pressed ? 0.95 : 1 }],
                                          opacity: pressed ? 0.8 : 1,
                                          transition: 'all 0.2s'
                                        }
                                      ]}>
                                <Image style={{width:24,height:24,margin:'auto'}} source={require("../../assets/wrench.png")}/>
                                <Text style={{marginLeft:5,color:"white", fontSize:20, fontWeight:"500"}}>Diagnostics</Text>
                            </Pressable>
                            
                        </>
                        ) : (
                            <>
                                <Text style={{color:"white", fontSize:40}}>--</Text>
                            </>
                        )
                    }
                    </View>
                </View>
            </View>



            {deviceConnected ? (
                <>
                    
                    {/* <View>
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
                    </View> */}
                    <View style={styles.scanNowContainer}>
                        <View style={{margin:"auto"}}>
                            <Pressable onPress={ () => {disconnectFromDevice; setDeviceConnected(false)}} style={({ pressed }) => [
                                        {
                                          flexDirection: "row",
                                          transform: [{ scale: pressed ? 0.95 : 1 }],
                                          opacity: pressed ? 0.8 : 1,
                                          transition: 'all 0.2s'
                                        }
                                      ]}>
                                <Image style={{width:25,height:25}} source={require("../../assets/wifi.png")}/>
                                <Text style={{fontSize:20, margin:'auto', marginLeft:10, color:'white', fontWeight:"500"}}>Disconnect</Text>
                            </Pressable>
                        </View>
                    </View>
                </>
            ) : (
                <>
                    <View style={styles.scanNowContainer}>
                        <View style={{margin:"auto"}}>
                            <Pressable onPress={scanForPeripherals} style={({ pressed }) => [
                                        {
                                          flexDirection: "row",
                                          transform: [{ scale: pressed ? 0.95 : 1 }],
                                          opacity: pressed ? 0.8 : 1,
                                          transition: 'all 0.2s'
                                        }
                                      ]}>
                                <Image style={{width:25,height:25}} source={require("../../assets/wifi.png")}/>
                                <Text style={{fontSize:20, margin:'auto', marginLeft:10, color:'white', fontWeight:"500"}}>Scan for Device</Text>
                            </Pressable>
                        </View>
                    </View>
                    <ScrollView style={styles.deviceScrollViewContainer}>
                        {allDevices.map((device, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={async () => {
                                await connectToDevice(device);
                                setDeviceConnected(true);
                            }}
                            style={styles.ctaButton}>
                            <Text style={styles.ctaButtonText}>Connect to {device.name}</Text>
                        </TouchableOpacity>
                        ))}
                    </ScrollView>
                    
                </>
            )}
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        
        // borderWidth:1,
        // borderColor:"black"
    },
    headerContainer:{
        
        backgroundColor:"#18181b",
        height:100,
        
    },
    header1Text:{
        fontSize:30,
        fontWeight:800,
        color:"white"
    },
    string:{
        fontSize:18,
        color:"white"
    },
    doubleBoxContainer:{
        
        flexDirection: "row",
        marginTop:25,
    },
    box:{
        borderColor:"#E4E4E7",
        borderWidth:1,
        width:"40%",
        height:160,
        margin:"auto",
        borderRadius:10,
        backgroundColor:"white"
    },
    rectangleBox:{
        borderColor:"#E4E4E7",
        borderWidth:1,
        width:"89%",
        height:80,
        borderRadius:10,
        margin:"auto",
        marginTop:30,
        backgroundColor:"white",
        flexDirection: "row",
    },
    DoublerectangleBoxContainer:{
        marginTop:30,
        flexDirection: "row",
    },
    rectangle:{
        
        backgroundColor:"#18181b",
        height:80,
        width:"40%",
        margin:"auto",
        borderRadius:10,
    },
    centerIconContainer:{
        // borderColor:"black",
        // borderWidth:1,
    },
    centerIcon:{
        margin:"auto",
        marginTop:20
    },
    icon:{
        width: 50,
        height: 50,
    },
    textContainer:{
        marginTop:10
    },
    boxTitle:{
        fontSize:18,
        textAlign:'center'
    },
    valueContainer:{

    },
    boxValue:{
        fontSize:20,
        textAlign:"center",
        fontWeight:"800"
    },
    header2Text:{
        fontSize:25,
        fontWeight:600,
        
    },
    stringContainer:{
        // borderWidth:1,
        // borderColor:"black",
    },
    substring:{
        fontSize:15,
        fontWeight:300,
        textAlign:"center"
    },
    iconStringContainer:{
        // borderWidth:1,
        // borderColor:'white',
        margin:"auto",
        flexDirection:"row"
    },
    scanNowContainer:{
        
        margin:'auto',
        marginTop:30,
        width:"89%",
        height:50,
        backgroundColor:"#3C82F6",
        borderRadius:10,
        flexDirection:'row'
    },

    // Bens CSS below 
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
    //Ben's CSS ends
    deviceScrollViewContainer:{
        borderColor:"black",
        borderWidth:1,
        height:"20%",
        width:"89%",
        margin:"auto"

    }
    

})



export default HomeScreen;