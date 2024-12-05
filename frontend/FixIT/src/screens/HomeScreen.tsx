import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useEffect, useState } from 'react';
import useBLE from "../../scripts/useBLE";

const HomeScreen = () => {
    const [deviceConnected, setDeviceConnected] = useState(true);

    // The value below are all functions and variables needed for device to be connected
    const {
        scanForPeripherals,
        connectToDevice,
        disconnectFromDevice,
        allDevices,
        connectedDevice,
        obdData,
      } = useBLE();



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
                            <Image style={styles.icon} source={require("../../assets/thermometer-simple.png")}/>
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
                                    <Image style={{width:24,height:24,margin:'auto'}} source={require("../../assets/pulse.png")}/>
                                    <Text style={{marginLeft:5,color:"white", fontSize:20, fontWeight:"500"}}>Live Data</Text>
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
                            <Image style={{width:24,height:24,margin:'auto'}} source={require("../../assets/wrench.png")}/>
                            <Text style={{marginLeft:5,color:"white", fontSize:20, fontWeight:"500"}}>Diagnostics</Text>
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
                    <View style={styles.scanNowContainer}>
                        <View style={{margin:"auto"}}>
                            <Pressable style={{flexDirection:'row'}} onPress={scanForPeripherals}>
                                <Image style={{width:25,height:25}} source={require("../../assets/wifi.png")}/>
                                <Text style={{fontSize:20, margin:'auto', marginLeft:10, color:'white', fontWeight:"500"}}>Scan for Device</Text>
                            </Pressable>
                        </View>
                    </View>
                    {allDevices.map((device, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => connectToDevice(device)}
                        style={styles.ctaButton}>
                        <Text style={styles.ctaButtonText}>Connect to {device.name}</Text>
                    </TouchableOpacity>
                    ))}
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

})



export default HomeScreen;