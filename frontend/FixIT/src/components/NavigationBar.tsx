import { Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;


interface NavigationBarProps {
    fixedJsonObject?: {
      dtcs: string[];
      coolant_temp_c: string | number;
      check_engine_light: boolean | string;
    };
  }
  


const NavigationBar : React.FC<NavigationBarProps> = ({ fixedJsonObject })  => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute();

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
                onPress={() => navigation.navigate('Maintenance', { fixedJsonObject })}
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

const styles = StyleSheet.create({
    navbar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#2E2E2E',
        backgroundColor: '#000000',
    },
    navItem: {
        alignItems: 'center',
        gap: 4,
    },
    navIcon: {
        fontSize: 24,
    },
    navText: {
        color: '#808080',
        fontSize: 12,
    },
    activeNavText: {
        color: '#4ADE80',
    },
});

export default NavigationBar; 