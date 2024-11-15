import { Image, StyleSheet, Text, View } from "react-native";



const HomeScreen = () => {
    return(
        <View style={styles.container}>

            <View style={styles.headerContainer}>
                <View style={{marginLeft:30, margin:"auto"}}>
                    <View>
                        <Text style={styles.header1Text}>OBD2 Scanner</Text>
                    </View> 

                    <View>
                        <Text style={styles.string}>Connected: Honda Civic 2022</Text>
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
                        <Text style={styles.boxValue}>194°F</Text>
                    </View>
                   
                        
                </View>
                <View style={styles.box}>

                    <View style={styles.centerIconContainer}>
                        <View style={styles.centerIcon}>
                            <Image style={styles.icon} source={require("../../assets/thermometer-simple.png")}/>
                        </View>
                    </View>

                    <View style={styles.textContainer}>
                        <Text style={styles.boxTitle}>Battery</Text>
                    </View>

                    <View style={styles.valueContainer}>
                        <Text style={styles.boxValue}>12.6V</Text>
                    </View>
                   
                </View>
            </View>

            <View style={styles.rectangleBox}>

                <View style={styles.stringContainer}>
                    <View style={{margin:"auto"}}>
                        <Text style={styles.header2Text}> Vehicle Status</Text>
                        <Text style={styles.substring}>All systems operational</Text>
                    </View>
                </View>

                <View>
                    <Text></Text>
                </View>
            </View>

            <View style={styles.DoublerectangleBoxContainer}>
                <View style={styles.rectangle}>

                </View>
                <View style={styles.rectangle}>

                </View>
            </View>
            
            
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        
        // borderWidth:1,
        // borderColor:"black"
    },
    headerContainer:{
        
        backgroundColor:"#000000",
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
        borderColor:"grey",
        borderWidth:1,
        width:"40%",
        height:160,
        margin:"auto",
        borderRadius:10,
        backgroundColor:"white"
    },
    rectangleBox:{
        borderColor:"grey",
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
        
        backgroundColor:"black",
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
        borderWidth:1,
        borderColor:"black",
        
        
    },
    substring:{
        fontSize:15,
        fontWeight:300,
        textAlign:"center"
    }


})



export default HomeScreen;