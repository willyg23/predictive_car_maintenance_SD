import { StyleSheet, View, Text, ScrollView,TextInput, TouchableOpacity } from "react-native";
import Header from "../components/Header";
import NavigationBar from "../components/NavigationBar";
import { useEffect, useState } from "react";
import { generateResponse } from "../../scripts/generateResponse";
import OpenAI from "openai";
import { useRoute } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";





const MaintenanceScreen = () => {
    const route = useRoute();
    const [messages, setMessages] = useState<Array<{ text: string; reply: string | null }>>([]);
    const [inputText, setInputText] = useState(""); // State to store user input
    
    const [fixedJsonObject, setFixedJsonObject] = useState({
      dtcs: [],
      coolant_temp_c: "",
      check_engine_light: "",
    });

    const [isLoading, setIsLoading] = useState(true);
    const CACHE_KEY = '@FixIT_conversation';


    const handleSendMessage = async () => {
      if (inputText.trim() !== "") {
        // Add user's message to the list
        setMessages((prevMessages) => [...prevMessages, { text: inputText, reply: null }]);
    
        try {
          // Get AI response
          const aiReply = await getPerplexityResponse(inputText);
    
          // Append AI response to messages state
          setMessages((prevMessages) => [
            ...prevMessages,
            { text: inputText, reply: aiReply },
          ]);
        } catch (error) {
          console.error("Error generating response:", error);
        }
    
        // Clear the input field
        setInputText("");
      }
    };

    const model = "accord"
    const make = "honda"


    const prePrompt = `
      I am driving a ${make} ${model}. My car's onboard diagnostics system has detected the following issues:
      - Diagnostic Trouble Codes (DTCs): ${fixedJsonObject.dtcs.join(", ")}
      - Coolant temperature: ${fixedJsonObject.coolant_temp_c}°C
      - Check engine light status: ${fixedJsonObject.check_engine_light ? "On" : "Off"}
      
      Please explain:
      1. What the DTC codes (${fixedJsonObject.dtcs.join(", ")}) mean.
      2. What might happen to my car if I do not address these issues.
      3. Provide recommendations on how to fix these problems.
    `;
 
    // const response = await generateResponse(prePrompt);
    
    const client = new OpenAI({ apiKey: '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',baseURL:"https://api.perplexity.ai" }); // Pass your API key here

    const getPerplexityResponse = async (inputText: string) => {
      const API_URL = 'https://api.perplexity.ai/chat/completions';
      const PERPLEXITY_API_KEY = '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'

      const combinedPrompt = `
        I am driving a ${make} ${model}. My car's onboard diagnostics system has detected the following issues:
        - Diagnostic Trouble Codes (DTCs): ${fixedJsonObject.dtcs.join(", ")}
        - Coolant temperature: ${fixedJsonObject.coolant_temp_c}°C
        - Check engine light status: ${fixedJsonObject.check_engine_light ? "On" : "Off"}
    

        Answere this question: ${inputText}
      `;




      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${PERPLEXITY_API_KEY}`
          },
          body: JSON.stringify({
            model: "sonar-pro",
            messages: [
              {
                role: "user",
                content: combinedPrompt
              }
            ]
          })
        });
    
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
    
        const data = await response.json();
        
        
        setMessages((prevMessages) => [
          ...prevMessages.slice(0, prevMessages.length - 1), 
          { text: inputText, reply: data.choices[0].message.content }, 
          
        ]);
        return data.choices[0].message.content;
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
    };

  

     
    const setCodes = (str:string) => {
      // Attempt to parse the JSON string
      const fixedJsonObject = route.params?.fixedJsonObject || null;
      console.log("here is the fixedJSONObject "+JSON.stringify(fixedJsonObject))
      setFixedJsonObject(fixedJsonObject); // Update state with parsed object
    } 

    useEffect(() => {

      const loadConversation = async () => {
        try {
          // Try to load cached conversation
          const cachedData = await AsyncStorage.getItem(CACHE_KEY);
          
          if (cachedData) {
            console.log("there is cache data")
            setMessages(JSON.parse(cachedData));
          } else {
            // If no cache exists and we have diagnostic data
            console.log("there is no cache data")
            if (fixedJsonObject.dtcs.length > 0) {
              console.log("there is no cache data 2 ")
              // Generate initial AI response
              const aiReply = await getPerplexityResponse(prePrompt);
              
              // Create initial conversation entry
              const initialMessage = { 
                text: "Vehicle Diagnostic Report", 
                reply: aiReply 
              };
              
              setMessages([initialMessage]);
              await AsyncStorage.setItem(CACHE_KEY, JSON.stringify([initialMessage]));
            }
          }
        } catch (error) {
          console.error('Error loading conversation:', error);
        } finally {
          setIsLoading(false);
        }
      };

      loadConversation();
      // getPerplexityResponse();
      setCodes("")
      console.log("hey")
    }, [])


    // Add this useEffect to save conversation on changes
    useEffect(() => {
      const saveConversation = async () => {
        if (!isLoading) {  // Don't save during initial load
          try {
            await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(messages));
          } catch (error) {
            console.error('Error saving conversation:', error);
          }
        }
      };

      saveConversation();
    }, [messages]);



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