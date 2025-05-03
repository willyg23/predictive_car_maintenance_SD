import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";
import { generateInsights } from "../services/OpenAIService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CarInfo } from "../types/carTypes";

interface ChatSectionProps {
  vehicleData: any;
}

const ChatSection: React.FC<ChatSectionProps> = ({ vehicleData }) => {
  const [showChat, setShowChat] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);
  const [selectedCar, setSelectedCar] = useState<CarInfo | null>(null);
  
  // Load selected car when chat is opened
  const loadSelectedCar = async () => {
    try {
      // Only load if not already loaded
      if (!selectedCar && showChat) {
        const carId = await AsyncStorage.getItem('last_selected_car_id');
        if (carId) {
          const cars = await AsyncStorage.getItem('user_cars');
          if (cars) {
            const parsedCars = JSON.parse(cars);
            const foundCar = parsedCars.find((c: CarInfo) => c.id === carId);
            if (foundCar) {
              setSelectedCar(foundCar);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading selected car:', error);
    }
  };
  
  // Load car data when chat area is shown
  React.useEffect(() => {
    loadSelectedCar();
  }, [showChat]);
  
  // Generate answer for custom question
  const askQuestion = async () => {
    if (!question.trim()) return;
    
    setIsAnswering(true);
    setAnswer('');
    
    try {
      const cacheKey = `chat_${question.trim().toLowerCase()}`;
      // Convert vehicleData to the right format
      const processedData = {
        dtcs: Array.isArray(vehicleData.dtcs) ? vehicleData.dtcs : [],
        coolant_temp_c: vehicleData.coolant_temp_c,
        check_engine_light: vehicleData.check_engine_light
      };
      
      // Create a medium-detail prompt without special characters
      const enhancedPrompt = `Question about my vehicle: ${question.trim()}
      
Please provide a moderately detailed answer that explains the key points without being too lengthy. 
Use about 4-6 sentences with plain language. 
Avoid using special symbols like asterisks, hashtags, or bullet points.
Focus on practical information that a car owner would find useful.`;
      
      // Map the car data to the expected format if available
      const carData = selectedCar ? {
        id: selectedCar.id,
        nickname: selectedCar.nickname,
        make: selectedCar.make,
        model: selectedCar.model,
        year: typeof selectedCar.year === 'number' ? selectedCar.year.toString() : selectedCar.year,
        mileage: selectedCar.mileage,
        last_oil_change: selectedCar.last_oil_change,
      } : undefined;
      
      // Pass the car data to the generateInsights function
      const response = await generateInsights(enhancedPrompt, processedData, cacheKey, false, carData);
      setAnswer(response);
    } catch (error) {
      console.error('Error getting answer:', error);
      setAnswer('Sorry, I encountered an error while processing your question. Please try again.');
    } finally {
      setIsAnswering(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.askButton}
        onPress={() => setShowChat(!showChat)}
      >
        <Text style={styles.askButtonText}>
          {showChat ? 'Hide Question Area' : 'Ask About Your Vehicle'}
        </Text>
      </TouchableOpacity>
      
      {showChat && (
        <View style={styles.chatArea}>
          {selectedCar && (
            <Text style={styles.selectedCarText}>
              Selected: {selectedCar.nickname || `${selectedCar.year} ${selectedCar.make} ${selectedCar.model}`}
            </Text>
          )}
          
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Ask about your vehicle..."
              placeholderTextColor="#808080"
              value={question}
              onChangeText={setQuestion}
              multiline
            />
            <TouchableOpacity 
              style={[styles.sendButton, {opacity: question.trim() ? 1 : 0.5}]}
              onPress={askQuestion}
              disabled={!question.trim() || isAnswering}
            >
              <Text style={styles.sendButtonText}>Ask</Text>
            </TouchableOpacity>
          </View>
          
          {isAnswering ? (
            <View style={styles.answerLoading}>
              <ActivityIndicator size="small" color="#4CD964" />
              <Text style={styles.answerLoadingText}>Finding answer...</Text>
            </View>
          ) : answer ? (
            <View style={styles.answerContainer}>
              <Text style={styles.answerText}>{answer}</Text>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    marginTop: 8,
  },
  askButton: {
    backgroundColor: '#5AC8FA20',
    borderWidth: 1,
    borderColor: '#5AC8FA',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  askButtonText: {
    color: '#5AC8FA',
    fontSize: 16,
    fontWeight: '600',
  },
  chatArea: {
    marginTop: 16,
  },
  selectedCarText: {
    color: '#AAAAAA',
    fontSize: 13,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#222222',
    borderRadius: 10,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#5AC8FA',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginLeft: 8,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  answerLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 16,
  },
  answerLoadingText: {
    color: '#AAAAAA',
    marginLeft: 10,
  },
  answerContainer: {
    marginTop: 16,
    backgroundColor: '#222222',
    borderRadius: 10,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#5AC8FA',
  },
  answerText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 22,
  },
});

export default ChatSection; 