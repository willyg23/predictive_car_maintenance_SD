import { StyleSheet, View, Text, Pressable, Animated, ScrollView } from "react-native";
import { useState, useRef } from 'react';
import Header from "../components/Header";
import ScanButton from "../components/ScanButton";
import FeatureGrid from "../components/FeatureGrid";
import NavigationBar from "../components/NavigationBar";
import VehicleSection from "../components/VehicleSection";
import SetupBanner from "../components/SetupBanner";

const HomeScreen = () => {
    const [activeTab, setActiveTab] = useState('stats');
    const pulseAnim = useRef(new Animated.Value(1)).current;

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
                        style={[styles.modeTab, activeTab === 'vibes' && styles.activeTab]}
                        onPress={() => setActiveTab('vibes')}
                    >
                        <Text style={[styles.modeText, activeTab === 'vibes' && styles.activeText]}>Vibes</Text>
                    </Pressable>
                </View>

                {/* Quick Stats with Interaction */}
                <View style={styles.statsContainer}>
                    <Pressable 
                        style={styles.statCard}
                        onPress={startPulse}
                    >
                        <Animated.View style={[styles.statContent, { transform: [{ scale: pulseAnim }] }]}>
                            <View style={styles.statHeader}>
                                <Text style={styles.statEmoji}>🌡️</Text>
                                <Text style={styles.statTrend}>↗️ 2°</Text>
                            </View>
                            <Text style={styles.statValue}>194°F</Text>
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
                                <Text style={styles.statTrend}>↘️ 0.3V</Text>
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

                {/* Interactive Scan Area */}
                <View style={styles.scanContainer}>
                    <ScanButton />
                    <View style={styles.scanInfo}>
                        <Text style={styles.scanHint}>Tap to scan your vehicle</Text>
                        <Text style={styles.scanStreak}>🔥 3 day streak!</Text>
                    </View>
                </View>

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
    statTrend: {
        fontSize: 14,
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
    scanContainer: {
        alignItems: 'center',
        gap: 12,
    },
    scanInfo: {
        alignItems: 'center',
    },
    scanHint: {
        color: '#808080',
        fontSize: 14,
    },
    scanStreak: {
        color: '#FFFFFF',
        fontSize: 12,
        marginTop: 4,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    sectionTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '700',
    },
    sectionBadge: {
        backgroundColor: '#6C63FF',
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    viewAll: {
        color: '#6C63FF',
        fontSize: 14,
        fontWeight: '600',
    },
    activityCard: {
        backgroundColor: '#1A1A1A',
        borderRadius: 16,
        padding: 16,
    },
    activityHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    activityEmoji: {
        fontSize: 20,
        marginRight: 12,
    },
    activityInfo: {
        flex: 1,
    },
    activityTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    activityTime: {
        color: '#808080',
        fontSize: 12,
        marginTop: 2,
    },
    activityBadge: {
        backgroundColor: 'rgba(74, 222, 128, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        color: '#4ADE80',
        fontSize: 12,
        fontWeight: '600',
    },
    quickActions: {
        gap: 12,
    },
    recentActivity: {
        gap: 12,
    },
});

export default HomeScreen;