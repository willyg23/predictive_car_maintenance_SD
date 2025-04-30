import React from 'react';
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { RootStackParamList } from "../App";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const FeatureGrid = () => {
    const navigation = useNavigation<NavigationProp>();

    return (
        <View style={styles.featureGrid}>
            <View style={styles.featureRow}>
                <FeatureButton 
                    emoji="📋"
                    text="Service History"
                    onPress={() => navigation.navigate('ServiceHistory')}
                />
                <FeatureButton 
                    emoji="🔧"
                    text="Diagnostics"
                    onPress={() => navigation.navigate('TapToScan')}
                />
            </View>
            <View style={styles.featureRow}>
                <FeatureButton 
                    emoji="📊"
                    text="Maintenance"
                    onPress={() => navigation.navigate('Maintenance')}
                />
                <FeatureButton 
                    emoji="➕"
                    text="Add Car"
                    onPress={() => navigation.navigate('AddCar')}
                />
            </View>
        </View>
    );
};

type FeatureButtonProps = {
    emoji?: string;
    text?: string;
    onPress?: () => void;
};

const FeatureButton = ({ emoji, text, onPress }: FeatureButtonProps) => (
    <Pressable style={styles.featureButton} onPress={onPress}>
        {emoji && <Text style={styles.featureEmoji}>{emoji}</Text>}
        <Text style={styles.featureText}>{text}</Text>
    </Pressable>
);

const styles = StyleSheet.create({
    featureGrid: {
        gap: 12,
    },
    featureRow: {
        flexDirection: 'row',
        gap: 12,
    },
    featureButton: {
        flex: 1,
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        padding: 16,
        alignItems: 'flex-start',
        gap: 8,
        borderLeftWidth: 2,
        borderLeftColor: '#4ADE80',
    },
    featureEmoji: {
        fontSize: 24,
    },
    featureText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
    },
    disabledText: {
        color: '#FFFFFF',
        fontSize: 16,
        textAlign: 'center',
        alignSelf: 'center',
    },
});

export default FeatureGrid; 