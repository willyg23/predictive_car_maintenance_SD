import React, { useRef, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Animated } from "react-native";

interface CategorySectionProps {
  id: string;
  title: string;
  icon: string;
  color: string;
  content: string;
  isLoading: boolean;
  isExpanded: boolean;
  onToggle: (id: string) => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  id,
  title,
  icon,
  color,
  content,
  isLoading,
  isExpanded,
  onToggle,
}) => {
  // Animation values
  const expandAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Run expand/collapse animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(expandAnim, {
        toValue: isExpanded ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(rotateAnim, {
        toValue: isExpanded ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isExpanded, expandAnim, rotateAnim]);

  // Interpolate rotate animation
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  const maxHeight = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 500],
  });

  // Format the content text for better readability
  const formatContent = (text: string) => {
    // If content is empty or loading, return null
    if (!text || isLoading) return null;
    
    // If the content includes bullet points (•), format them properly
    if (text.includes('•')) {
      return text.split('•').map((item, index) => {
        if (index === 0) return null;
        return (
          <View key={index} style={styles.bulletItem}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.contentText}>{item}</Text>
          </View>
        );
      });
    }
    
    return <Text style={styles.contentText}>{text}</Text>;
  };

  return (
    <View style={styles.sectionCard}>
      <TouchableOpacity 
        style={styles.sectionHeader} 
        onPress={() => onToggle(id)}
        activeOpacity={0.8}
      >
        <View style={styles.sectionTitle}>
          <View style={[styles.iconContainer, { backgroundColor: `${color}30` }]}>
            <Text style={styles.iconText}>{icon}</Text>
          </View>
          <Text style={styles.sectionName}>{title}</Text>
        </View>
        
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Text style={styles.chevronIcon}>▶</Text>
        </Animated.View>
      </TouchableOpacity>
      
      <Animated.View style={[styles.sectionContent, { maxHeight }]}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={color} />
            <Text style={[styles.loadingText, { color }]}>
              Analyzing...
            </Text>
          </View>
        ) : (
          <View style={styles.contentContainer}>
            {formatContent(content)}
          </View>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#121827',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#292d3e',
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 18,
  },
  sectionName: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  chevronIcon: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  sectionContent: {
    overflow: 'hidden',
  },
  contentContainer: {
    padding: 16,
    backgroundColor: '#101623',
  },
  contentText: {
    color: '#EAEAEA',
    fontSize: 15,
    lineHeight: 22,
  },
  loadingContainer: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#101623',
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bulletPoint: {
    color: '#FFFFFF',
    fontSize: 15,
    marginRight: 5,
  },
});

export default CategorySection; 