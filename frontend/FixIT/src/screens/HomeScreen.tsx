import { StyleSheet, View, Text, Pressable, Animated, ScrollView } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useState, useRef, useEffect } from 'react';
import Header from "../components/Header";
import FeatureGrid from "../components/FeatureGrid";
import NavigationBar from "../components/NavigationBar";
import VehicleSection from "../components/VehicleSection";
import SetupBanner from "../components/SetupBanner";
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState('stats');
    const pulseAnim = useRef(new Animated.Value(1)).current;

    const fixStr = '{"dtcs":["P0100"],"coolant_temp_c":116,"check_engine_light":true}';

    // This is a fixed json string that will be recieved from the machine 
    const [fixedJsonObject, setFixedJsonObject] = useState({
        dtcs: [],
        coolant_temp_c: "",
        check_engine_light: "",
    });

    const startPulse = () => {
        Animated.sequence([
            Animated.timing(pulseAnim, {
                toValue: 1.1,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const setCodes = (str: string) => {
        const parsedObject = JSON.parse(str);
        setFixedJsonObject(parsedObject); // Update state with parsed object
    }

    useEffect(() => {
        // getPerplexityResponse();
        setCodes(fixStr)
        console.log("hey")
    }, [])

    return (
        <View style={styles.container}>
            <Header />
            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Mode Switcher */}
                <View style={styles.modeSwitcher}>
                    <Pressable 
                        style={[styles.modeTab, activeTab === 'stats' && styles.activeTab]}
                        onPress={() => setActiveTab('stats')}
                    >
                        <Text style={[styles.modeText, activeTab === 'stats' && styles.activeText]}>Stats</Text>
                    </Pressable>
                    <Pressable 
                        style={[styles.modeTab, activeTab === 'setup' && styles.activeTab]}
                        onPress={() => setActiveTab('setup')}
                    >
                        <Text style={[styles.modeText, activeTab === 'setup' && styles.activeText]}>Setup</Text>
                    </Pressable>
                </View>

                {activeTab === 'setup' && (
                    <View style={styles.setupContainer}>
                        <Text style={styles.setupHeadline}>Let’s Get Started</Text>
                        <Text style={styles.setupSubtext}>Scan your car’s Bluetooth device to begin diagnostics.</Text>
                        <Animated.View 
                            style={[styles.startScanButton, { transform: [{ scale: pulseAnim }] }]}
                        >
                            <Pressable 
                                onPress={() => {
                                    startPulse();
                                    navigation.navigate('TapToScan');
                                }}
                            >
                                <LinearGradient 
                                    colors={['#FF5F6D', '#FFC371']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.startScanPressable}
                                >
                                    <Text style={styles.startScanText}>Start Scan</Text>
                                </LinearGradient>
                            </Pressable>
                        </Animated.View>
                    </View>
                )}

                {/* Quick Stats with Interaction */}
                {activeTab === 'stats' && (
                    <View style={styles.statsContainer}>
                        <Pressable 
                            style={styles.statCard}
                            onPress={startPulse}
                        >
                            <Animated.View style={[styles.statContent, { transform: [{ scale: pulseAnim }] }]}>
                                <View style={styles.statHeader}>
                                    <Text style={styles.statEmoji}>🌡️</Text>
                                </View>
                                <Text style={styles.statValue}>{fixedJsonObject.coolant_temp_c}°F</Text>
                                <Text style={styles.statLabel}>Engine Temp</Text>
                                <View style={styles.statIndicator}>
                                    <View style={styles.indicatorDot} />
                                    <Text style={styles.statStatus}>Optimal</Text>
                                </View>
                            </Animated.View>
                        </Pressable>

                        <Pressable style={[styles.statCard, styles.warningCard]}>
                            <View style={styles.statContent}>
                                <View style={styles.statHeader}>
                                    <Text style={styles.statEmoji}>⚡</Text>
                                </View>
                                <Text style={styles.statValue}>11.9V</Text>
                                <Text style={styles.statLabel}>Battery</Text>
                                <View style={[styles.statIndicator, styles.warningIndicator]}>
                                    <View style={[styles.indicatorDot, styles.warningDot]} />
                                    <Text style={[styles.statStatus, styles.warningText]}>Check Soon</Text>
                                </View>
                            </View>
                        </Pressable>
                    </View>
                )}

                {/* Quick Actions with Categories */}
                <View style={styles.quickActions}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Quick Actions</Text>
                        <Text style={styles.sectionBadge}>New</Text>
                    </View>
                    <FeatureGrid />
                </View>

                <SetupBanner />
                <VehicleSection />

                {/* Activity Feed */}
                <View style={styles.recentActivity}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Activity</Text>
                        <Text style={styles.viewAll}>View All</Text>
                    </View>
                    <Pressable style={styles.activityCard}>
                        <View style={styles.activityHeader}>
                            <Text style={styles.activityEmoji}>🔍</Text>
                            <View style={styles.activityInfo}>
                                <Text style={styles.activityTitle}>Diagnostic Scan</Text>
                                <Text style={styles.activityTime}>2h ago</Text>
                            </View>
                            <View style={styles.activityBadge}>
                                <Text style={styles.badgeText}>All Good</Text>
                            </View>
                        </View>
                    </Pressable>
                </View>
            </ScrollView>
            {/* fixedJsonObject */}
            <NavigationBar fixedJsonObject={fixedJsonObject} />
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
        gap: 20,
    },
    modeSwitcher: {
        flexDirection: 'row',
        backgroundColor: '#1A1A1A',
        borderRadius: 20,
        padding: 4,
        marginBottom: 8,
    },
    modeTab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 16,
    },
    activeTab: {
        backgroundColor: '#2D2D2D',
    },
    modeText: {
        color: '#808080',
        fontSize: 16,
        fontWeight: '600',
    },
    activeText: {
        color: '#FFFFFF',
    },
    setupContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    setupHeadline: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 8,
    },
    setupSubtext: {
        color: '#808080',
        fontSize: 16,
        marginBottom: 16,
        textAlign: 'center',
    },
    startScanButton: {
        marginTop: 16,
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    startScanPressable: {
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 24,
    },
    startScanText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#1A1A1A',
        borderRadius: 24,
        padding: 16,
        overflow: 'hidden',
        alignItems: 'center',
    },
    statContent: {
        alignItems: 'center',
    },
    statHeader: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    warningCard: {
        backgroundColor: '#2D1B1B',
    },
    statEmoji: {
        fontSize: 24,
    },
    statValue: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 4,
    },
    statLabel: {
        color: '#808080',
        fontSize: 14,
        marginBottom: 8,
    },
    statIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(74, 222, 128, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    indicatorDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#4ADE80',
        marginRight: 6,
    },
    warningIndicator: {
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
    },
    warningDot: {
        backgroundColor: '#FF6B6B',
    },
    statStatus: {
        color: '#4ADE80',
        fontSize: 12,
        fontWeight: '600',
    },
    warningText: {
        color: '#FF6B6B',
    },
    quickActions: {
        gap: 12,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    sectionBadge: {
        backgroundColor: '#FF5F6D',
        color: '#FFFFFF',
        borderRadius: 12,
        paddingVertical: 4,
        paddingHorizontal: 8,
        fontSize: 14,
        fontWeight: 'bold',
    },
    recentActivity: {
        gap: 12,
    },
});

export default HomeScreen;