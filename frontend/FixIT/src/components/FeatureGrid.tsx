import { Pressable, StyleSheet, Text, View } from "react-native";

const FeatureGrid = () => {
    return (
        <View style={styles.featureGrid}>
            <View style={styles.featureRow}>
                <FeatureButton 
                    emoji="📋"
                    text="Service\nHistory"
                />
                <FeatureButton 
                    emoji="🔍"
                    text="Quick\nScan"
                />
            </View>
            <View style={styles.featureButton}>
                <Text style={styles.disabledText}>Add a vehicle to use FixIT</Text>
            </View>
        </View>
    );
};

const FeatureButton = ({ emoji, text }: { emoji?: string, text?: string }) => (
    <Pressable style={styles.featureButton}>
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