import { Button, Image, Pressable, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"


const GettingStarted = () => {
    console.log("test")
    return(
        <SafeAreaView>

        
        <View style={styles.container} >

            <View style={styles.pictureContainer}>
                <Image source={require("../../assets/gettingStarted.png")} style={styles.image}/> 
            </View>
            

             {/* Getting started Text section  */}
            <View style={styles.stringContainer} >
                <Text style={styles.header}>FixIT is the easy way to car care </Text>
                <Text style={styles.string}>Lorem ipsum dolor sit amet consector. Henderit at concecetur aliquam at hendrium </Text>
            </View>


            {/* Getting started Button  */}
            <View style={styles.buttonContainer}>

                <Pressable style={styles.button}>
                    <Text style={styles.buttonString}>Get Started</Text>
                </Pressable>
            </View>

            {/* Out story */}
            <View style={styles.ourStory}>
                <Text>Learn more about <Text style={styles.ourStoryColor}>OUR STORY</Text></Text>
            </View>

        </View>
        </SafeAreaView>
    )
}
const styles = StyleSheet.create({
    container: {
        
        backgroundColor:"white",
        
    },
    stringContainer:{
        width:"75%",
        margin:"auto",
        marginTop:0,
        
    },
    pictureContainer:{
        
        margin:"auto",
        height:"68%",   
    },
    header: {
        fontWeight:"800",
        fontSize:16,
        margin:"auto"
    },
    string:{
        margin:"auto",
    },
    buttonContainer:{
        
        marginTop:70
    },
    button: {
        
        width:"90%",
        margin:"auto",
        borderRadius:30,
        height:55,
        backgroundColor:"#6C63FFBF"
    },
    buttonString:{
        margin:"auto",
        fontSize:18,
        fontWeight:"600",
        color:"white"
    },
    ourStory: {
        margin:"auto"
    },
    ourStoryColor:{color:"blue"},
    image:{
        height:350,
        width:300,
        margin:"auto"
    }



})

export default GettingStarted;