import { Image, Pressable, StyleSheet, Text, View } from "react-native";

const SetupBanner = () => {
    return (
        <Pressable style={styles.setupBanner}>
            <View style={styles.setupContent}>
                <View style={styles.setupIcon} />
                <Text style={styles.setupText}>Complete Your FixIT Setup</Text>
            </View>
            <Image 
                source={require('../../assets/chevron-right.png')} 
                style={styles.chevronIcon}
            />
        </Pressable>
    );
};

const styles = StyleSheet.create({
    setupBanner: {
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    setupContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    setupIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#4ADE80',
        opacity: 0.2,
    },
    setupText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
    },
    chevronIcon: {
        width: 24,
        height: 24,
        tintColor: '#808080',
    },
});

export default SetupBanner; 