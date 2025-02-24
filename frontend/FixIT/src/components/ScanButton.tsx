import { Pressable, StyleSheet, Text } from "react-native";

const ScanButton = () => {
    return (
        <Pressable style={styles.scanButton}>
            <Text style={styles.scanText}>Tap{'\n'}To{'\n'}Scan</Text>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    scanButton: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#4ADE80',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#2E2E2E',
    },
    scanText: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '600',
        textAlign: 'center',
    },
});

export default ScanButton; 