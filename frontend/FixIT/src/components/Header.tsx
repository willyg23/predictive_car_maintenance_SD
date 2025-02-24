import { StyleSheet, Text, View } from "react-native";

const Header = () => {
    return (
        <View style={styles.header}>
            <View style={styles.logoContainer}>
                <Text style={styles.logoEmoji}>🚗</Text>
                <Text style={styles.logoText}>Fix<Text style={styles.highlight}>IT</Text></Text>
            </View>
            <View style={styles.headerIcons}>
                <Text style={styles.iconEmoji}>🔔</Text>
                <Text style={styles.iconEmoji}>⚙️</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 48,
        paddingBottom: 16,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    logoEmoji: {
        fontSize: 24,
    },
    logoText: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '700',
    },
    highlight: {
        color: '#4ADE80',
    },
    headerIcons: {
        flexDirection: 'row',
        gap: 16,
    },
    iconEmoji: {
        fontSize: 24,
    },
});

export default Header; 