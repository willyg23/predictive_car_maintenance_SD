import { StyleSheet, View, Text, ScrollView, Pressable, Image } from "react-native";
import Header from "../components/Header";
import NavigationBar from "../components/NavigationBar";

const PremiumFeatureItem = ({ icon, title, description }: { icon: string, title: string, description: string }) => (
    <Pressable style={styles.featureItem}>
        <Text style={styles.featureIcon}>{icon}</Text>
        <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>{title}</Text>
            <Text style={styles.featureDescription}>{description}</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
    </Pressable>
);

const PremiumScreen = () => {
    return (
        <View style={styles.container}>
            <Header />
            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Trial Offer Banner */}
                <View style={styles.trialBanner}>
                    <Text style={styles.trialTitle}>
                        Try FixIT Premium <Text style={styles.highlight}>FREE</Text> for{'\n'}1 week!
                    </Text>
                    <Text style={styles.trialSubtitle}>
                        Then charged $99.99/year. Cancel anytime.
                    </Text>
                </View>

                {/* Premium Features Section */}
                <View style={styles.featuresSection}>
                    <View style={styles.featureHeader}>
                        <Text style={styles.featuresTitle}>FixIT Premium Features</Text>
                        <View style={styles.premiumBadge}>
                            <Text style={styles.badgeText}>Premium</Text>
                        </View>
                    </View>

                    <PremiumFeatureItem 
                        icon="💬"
                        title="AI Mechanic"
                        description="Our AI Mechanic is here to help"
                    />
                    <PremiumFeatureItem 
                        icon="🔧"
                        title="Confirmed Fix & Cost"
                        description="Know what you should pay for repairs"
                    />
                    <PremiumFeatureItem 
                        icon="📞"
                        title="FixIT Mechanic Hotline"
                        description="A team of mechanics that work for you"
                    />
                    <PremiumFeatureItem 
                        icon="☁️"
                        title="Emissions Precheck"
                        description="Know if you will pass before you go"
                    />
                </View>

                {/* Try Premium Button */}
                <Pressable style={styles.tryButton}>
                    <Text style={styles.tryButtonText}>Try Premium</Text>
                </Pressable>
            </ScrollView>
            <NavigationBar />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 16,
        gap: 24,
    },
    trialBanner: {
        backgroundColor: '#111111',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
    },
    trialTitle: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 8,
    },
    highlight: {
        color: '#4ADE80',
    },
    trialSubtitle: {
        color: '#808080',
        fontSize: 16,
        textAlign: 'center',
    },
    featuresSection: {
        gap: 16,
    },
    featureHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 8,
    },
    featuresTitle: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '700',
    },
    premiumBadge: {
        backgroundColor: '#4ADE80',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    badgeText: {
        color: '#000000',
        fontSize: 14,
        fontWeight: '600',
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111111',
        borderRadius: 12,
        padding: 16,
        gap: 16,
    },
    featureIcon: {
        fontSize: 24,
    },
    featureContent: {
        flex: 1,
    },
    featureTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    featureDescription: {
        color: '#808080',
        fontSize: 14,
    },
    chevron: {
        color: '#808080',
        fontSize: 24,
    },
    tryButton: {
        backgroundColor: '#4ADE80',
        borderRadius: 30,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    tryButtonText: {
        color: '#000000',
        fontSize: 18,
        fontWeight: '600',
    },
});

export default PremiumScreen; 