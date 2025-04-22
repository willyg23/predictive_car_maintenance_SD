import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

// Define the navigation param list type
type RootStackParamList = {
    HomeScreen: undefined;
    Maintenance: {
        fixedJsonObject?: {
            dtcs: string[];
            coolant_temp_c: string | number;
            check_engine_light: string | boolean;
        }
    };
    Premium: undefined;
};

// Define the navigation prop type
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface NavigationBarProps {
    fixedJsonObject?: {
        dtcs: string[];
        coolant_temp_c: string | number;
        check_engine_light: string | boolean;
    } | null;
}

// Simple NavItem component
const NavItem = ({ 
    emoji, 
    text, 
    active, 
    onPress 
}: { 
    emoji: string, 
    text: string, 
    active?: boolean,
    onPress: () => void 
}) => (
    <Pressable style={styles.navItem} onPress={onPress}>
        <Text style={[styles.navIcon, active && styles.activeNavText]}>{emoji}</Text>
        <Text style={[styles.navText, active && styles.activeNavText]}>{text}</Text>
    </Pressable>
);

const NavigationBar: React.FC<NavigationBarProps> = ({ fixedJsonObject }) => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute();

    // Safe navigation to maintenance screen
    const navigateToMaintenance = () => {
        // Only pass the fixedJsonObject if it exists and has valid data
        if (fixedJsonObject && Array.isArray(fixedJsonObject.dtcs)) {
            navigation.navigate('Maintenance', { fixedJsonObject });
        } else {
            // Otherwise navigate without data
            navigation.navigate('Maintenance', { 
                fixedJsonObject: {
                    dtcs: [],
                    coolant_temp_c: "",
                    check_engine_light: ""
                }
            });
        }
    };

    return (
        <View style={styles.navbar}>
            <NavItem 
                emoji="🚗"
                text="Scan" 
                active={route.name === 'HomeScreen'}
                onPress={() => navigation.navigate('HomeScreen')}
            />
            <NavItem 
                emoji="🔧"
                text="Maintenance" 
                active={route.name === 'Maintenance'}
                onPress={navigateToMaintenance}
            />
            <NavItem 
                emoji="🛡️"
                text="Premium" 
                active={route.name === 'Premium'}
                onPress={() => navigation.navigate('Premium')}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    navbar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#1E1E1E',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#333',
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
    },
    navIcon: {
        fontSize: 24,
        marginBottom: 4,
    },
    navText: {
        color: '#808080',
        fontSize: 12,
    },
    activeNavText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
});

export default NavigationBar; 