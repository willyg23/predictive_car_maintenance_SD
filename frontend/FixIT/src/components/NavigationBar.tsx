import { Pressable, StyleSheet, Text, View } from "react-native";

const NavigationBar = () => {
    return (
        <View style={styles.navbar}>
            <NavItem 
                emoji="🚗"
                text="Scan" 
                active 
            />
            <NavItem 
                emoji="🔧"
                text="Maintenance" 
            />
            <NavItem 
                emoji="🛡️"
                text="Premium" 
            />
        </View>
    );
};

const NavItem = ({ emoji, text, active }: { emoji: string, text: string, active?: boolean }) => (
    <Pressable style={styles.navItem}>
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