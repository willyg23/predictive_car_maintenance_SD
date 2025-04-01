import { StyleSheet, View, Text, ScrollView,TextInput, TouchableOpacity } from "react-native";
import Header from "../components/Header";
import NavigationBar from "../components/NavigationBar";
import { useState } from "react";
import { generateResponse } from "../../scripts/generateResponse";

const MaintenanceScreen = () => {

    const [messages, setMessages] = useState<Array<{ text: string; reply: string | null }>>([]);
    const [inputText, setInputText] = useState(""); // State to store user input
  
    const handleSendMessage = async () => {
      if (inputText.trim() !== "") {
        // Add user's message to the list
        setMessages((prevMessages) => [...prevMessages, { text: inputText, reply: null }]);
  
        try {
          // Call the generateResponse function to get a reply
          const response = await generateResponse(inputText);
          const reply = response?.message || "No response"; // Extract the reply from the API response
            console.
          // Update the messages with the reply
          setMessages((prevMessages) => [
            ...prevMessages.slice(0, prevMessages.length - 1), 
            { text: inputText, reply: reply }, 
            
          ]);
        } catch (error) {
          console.error("Error generating response:", error);
        }
  
        // Clear the input field
        setInputText("");
      }
    };


    return (
        <View style={styles.container}>
            <Header />
            <Text style={styles.title}>Maintenance</Text>
            <Text style={styles.subtitle}>Track and schedule your vehicle maintenance</Text>
            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {messages.map((message, index) => (
                    <View key={index} style={styles.messageContainer}>
                        
                        <Text style={styles.replyMessage}>{message.text}</Text>
                        
                        <Text style={styles.userMessage}>{message.reply}</Text>
                    </View>
                ))}

              
            </ScrollView>

            {/* Container fore the text input and the send button */}
            <View style={styles.fieldInputAndSend}>
                <TextInput
                    style={styles.input}
                    placeholder="Type here"
                    placeholderTextColor="grey"
                    value={inputText}
                    onChangeText={(text) => setInputText(text)}
                />
                <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
                    <Text >Send</Text>
                </TouchableOpacity>
            </View>
            
            <NavigationBar />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 16,
        gap: 20,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 32,
        fontWeight: '700',
    },
    subtitle: {
        color: '#808080',
        fontSize: 16,
    },
    input: {
        flex: 1, // Take up available space
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        color: 'white',
        marginRight: 8, // Add space between input and button
    },
      messageContainer: {
        marginBottom: 12,
      },
      userMessage: {
        color: "#FFFFFF",
        fontSize: 16,
        backgroundColor: "#1E1E1E",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        alignSelf: "flex-start", // Align user messages to the left
        marginBottom: 4,
      },
      replyMessage: {
        color: "#FFFFFF",
        fontSize: 16,
        backgroundColor: "#4CD964",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        alignSelf: "flex-end", // Align reply messages to the right
      },
      sendButton: {
        backgroundColor: '#4CD964', // Green button color
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
    },
      fieldInputAndSend: {
        flexDirection: 'row', // Align items horizontally
        alignItems: 'center', // Center items vertically
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#1E1E1E', // Background color for the input section
    },
});

export default MaintenanceScreen; 