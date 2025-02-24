import { Image, Pressable, StyleSheet, Text, View } from "react-native";

const VehicleSection = () => {
    return (
        <View style={styles.vehicleSection}>
            <Text style={styles.sectionTitle}>Vehicle Information</Text>
            <Pressable style={styles.vehicleButton}>
                <View style={styles.vehicleInfo}>
                    <Image 
                        source={require('../../assets/car-check-icon.png')} 
                        style={[styles.vehicleIcon, styles.greenTint]}
                    />
                    <View>
                        <Text style={styles.vehicleTitle}>Incident History</Text>
                        <Text style={styles.vehicleSubtitle}>Accident History, Title records,</Text>
                    </View>
                </View>
                <Image 
                    source={require('../../assets/shield-icon.png')} 
                    style={[styles.shieldIcon, styles.greenTint]}
                />
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    vehicleSection: {
        gap: 12,
    },
    sectionTitle: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '600',
    },
    vehicleButton: {
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    vehicleInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    vehicleIcon: {
        width: 32,
        height: 32,
    },
    vehicleTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
    },
    vehicleSubtitle: {
        color: '#808080',
        fontSize: 14,
    },
    shieldIcon: {
        width: 24,
        height: 24,
    },
    greenTint: {
        tintColor: '#4ADE80',
    },
});

export default VehicleSection; 