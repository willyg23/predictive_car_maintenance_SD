import React from 'react';
import { StyleSheet, View, Text, Pressable, Animated, ScrollView } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useState, useRef, useEffect } from 'react';
import Header from "../components/Header";
import FeatureGrid from "../components/FeatureGrid";
import NavigationBar from "../components/NavigationBar";
import VehicleSection from "../components/VehicleSection";
import SetupBanner from "../components/SetupBanner";
import CarCarousel from "../components/CarCarousel";
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useBLEContext, ParsedOBDData } from "../../scripts/BLEContext";
import { RootStackParamList } from "../App";

type HomeScreenRouteProp = RouteProp<RootStackParamList, 'HomeScreen'>;

const HomeScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<HomeScreenRouteProp>();
    const [activeTab, setActiveTab] = useState('stats');
    const pulseAnim = useRef(new Animated.Value(1)).current;
    // Add a ref to track if we've already cleaned up navigation params
    const alreadyCleanedUp = useRef(false);
    
    // Use BLE context instead of hardcoded data
    const { parsedData, connectedDevice } = useBLEContext();
    
    // Set activeTab from navigation params and handle focusCarId
    useEffect(() => {
        // Only run when we have specific params to process, using specific keys to avoid over-rendering
        if (route.params?.activeTab || route.params?.focusCarId) {
            const { activeTab: tabParam, focusCarId: carParam } = route.params;
            
            console.log(`HomeScreen processing params: activeTab=${tabParam}, focusCarId=${carParam}`);
            
            // If we have a focusCarId, always switch to cars tab
            if (carParam) {
                setActiveTab('cars');
            } else if (tabParam) {
                setActiveTab(tabParam);
            }
            
            // Clear params once - use the ref defined at component level
            if (!alreadyCleanedUp.current) {
                const timeoutId = setTimeout(() => {
                    console.log('Cleaning up navigation params');
                    navigation.setParams({ 
                        activeTab: undefined,
                        focusCarId: undefined
                    });
                    alreadyCleanedUp.current = true;
                }, 2000);
                
                return () => {
                    clearTimeout(timeoutId);
                };
            }
        }
    }, [route.params?.activeTab, route.params?.focusCarId, navigation]);
    
    // Fallback data if no BLE data is available
    const [localData, setLocalData] = useState<ParsedOBDData>({
        dtcs: [],
        coolant_temp_c: 0,
        check_engine_light: false
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

    // Update local data when parsed BLE data changes
    useEffect(() => {
        if (parsedData) {
            setLocalData(parsedData);
        }
    }, [parsedData]);

    // Helper function to determine temperature status
    const getTempStatus = (temp: number) => {
        if (temp > 230) return { status: "Too Hot", isWarning: true };
        if (temp < 170) return { status: "Too Cold", isWarning: true };
        return { status: "Optimal", isWarning: false };
    };

    // Get the active data (BLE data or local fallback)
    const activeData = parsedData || localData;
    const tempStatus = getTempStatus(activeData.coolant_temp_c);
    
    // Convert Celsius to Fahrenheit for display
    const tempF = Math.round(activeData.coolant_temp_c * 9/5 + 32);

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
                        style={[styles.modeTab, activeTab === 'cars' && styles.activeTab]}
                        onPress={() => setActiveTab('cars')}
                    >
                        <Text style={[styles.modeText, activeTab === 'cars' && styles.activeText]}>Cars</Text>
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
                        <Text style={styles.setupHeadline}>Let's Get Started</Text>
                        <Text style={styles.setupSubtext}>
                            {connectedDevice 
                                ? `Connected to ${connectedDevice.name}` 
                                : "Scan your car's Bluetooth device to begin diagnostics."}
                        </Text>
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
                                    <Text style={styles.startScanText}>
                                        {connectedDevice ? 'Manage Connection' : 'Start Scan'}
                                    </Text>
                                </LinearGradient>
                            </Pressable>
                        </Animated.View>
                    </View>
                )}

                {/* Cars Tab */}
                {activeTab === 'cars' && (
                    <CarCarousel focusCarId={route.params?.focusCarId} />
                )}

                {/* Quick Stats with Interaction */}
                {activeTab === 'stats' && (
                    <>
                        <View style={styles.statsContainer}>
                            <Pressable 
                                style={styles.statCard}
                                onPress={startPulse}
                            >
                                <Animated.View style={[styles.statContent, { transform: [{ scale: pulseAnim }] }]}>
                                    <View style={styles.statHeader}>
                                        <Text style={styles.statEmoji}>🌡️</Text>
                                    </View>
                                    <Text style={styles.statValue}>{tempF}°F</Text>
                                    <Text style={styles.statLabel}>Engine Temp</Text>
                                    <View style={[
                                        styles.statIndicator, 
                                        tempStatus.isWarning && styles.warningIndicator
                                    ]}>
                                        <View style={[
                                            styles.indicatorDot, 
                                            tempStatus.isWarning && styles.warningDot
                                        ]} />
                                        <Text style={[
                                            styles.statStatus, 
                                            tempStatus.isWarning && styles.warningText
                                        ]}>
                                            {tempStatus.status}
                                        </Text>
                                    </View>
                                </Animated.View>
                            </Pressable>

                            <Pressable 
                                style={[
                                    styles.statCard, 
                                    activeData.check_engine_light && styles.warningCard
                                ]}
                            >
                                <View style={styles.statContent}>
                                    <View style={styles.statHeader}>
                                        <Text style={styles.statEmoji}>🔧</Text>
                                    </View>
                                    <Text style={styles.statValue}>
                                        {activeData.dtcs.length > 0 ? activeData.dtcs[0] : "None"}
                                    </Text>
                                    <Text style={styles.statLabel}>Engine Code</Text>
                                    <View style={[
                                        styles.statIndicator, 
                                        activeData.check_engine_light && styles.warningIndicator
                                    ]}>
                                        <View style={[
                                            styles.indicatorDot, 
                                            activeData.check_engine_light && styles.warningDot
                                        ]} />
                                        <Text style={[
                                            styles.statStatus, 
                                            activeData.check_engine_light && styles.warningText
                                        ]}>
                                            {activeData.check_engine_light ? 'Check Engine' : 'All Good'}
                                        </Text>
                                    </View>
                                </View>
                            </Pressable>
                        </View>

                        {/* Service History and Maintenance Actions */}
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
                                <Text style={styles.viewAllText}>View All</Text>
                            </View>
                            <Pressable style={styles.activityCardStyle}>
                                <View style={styles.activityHeaderStyle}>
                                    <Text style={styles.activityEmojiStyle}>🔍</Text>
                                    <View style={styles.activityInfoStyle}>
                                        <Text style={styles.activityTitleStyle}>Diagnostic Scan</Text>
                                        <Text style={styles.activityTimeStyle}>2h ago</Text>
                                    </View>
                                    <View style={styles.activityBadgeStyle}>
                                        <Text style={styles.badgeTextStyle}>
                                            {activeData.check_engine_light ? 'Issues Found' : 'All Good'}
                                        </Text>
                                    </View>
                                </View>
                            </Pressable>
                        </View>
                    </>
                )}
            </ScrollView>
            {/* Pass the active data to NavigationBar */}
            <NavigationBar fixedJsonObject={activeData} />
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
    viewAllText: {
        color: '#808080',
        fontSize: 14,
    },
    activityCardStyle: {
        backgroundColor: '#1A1A1A',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
    },
    activityHeaderStyle: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    activityEmojiStyle: {
        fontSize: 24,
        marginRight: 12,
    },
    activityInfoStyle: {
        flex: 1,
    },
    activityTitleStyle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    activityTimeStyle: {
        color: '#808080',
        fontSize: 12,
    },
    activityBadgeStyle: {
        backgroundColor: 'rgba(74, 222, 128, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeTextStyle: {
        color: '#4ADE80',
        fontSize: 12,
        fontWeight: '600',
    }
});

export default HomeScreen;