import { Image, Pressable, StyleSheet, Text, View, Animated } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { NavigationProp } from '@react-navigation/native'
import { useEffect, useRef } from 'react'

interface Props {
    navigation: NavigationProp<any>
}

const GettingStarted = ({ navigation }: Props) => {
    const wiggleAnim = useRef(new Animated.Value(0)).current;
    const driveAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const wiggle = Animated.sequence([
            Animated.timing(wiggleAnim, {
                toValue: -3,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(wiggleAnim, {
                toValue: 3,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(wiggleAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }),
        ]);

        Animated.loop(wiggle, {
            iterations: -1
        }).start();
    }, []);

    const handlePress = () => {
        // Stop wiggle animation
        wiggleAnim.setValue(0);
        
        // Drive away animation sequence
        Animated.sequence([
            // Scale up slightly
            Animated.timing(scaleAnim, {
                toValue: 1.1,
                duration: 200,
                useNativeDriver: true,
            }),
            // Drive to the left
            Animated.timing(driveAnim, {
                toValue: -500, // Drive off screen
                duration: 1000,
                useNativeDriver: true,
            })
        ]).start(() => {
            // Navigate after car drives away
            navigation.navigate('HomeScreen')
        });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Logo Section */}
                <View style={styles.logoContainer}>
                    <View style={styles.logoBox}>
                        <Text style={styles.logoText}>Fix</Text>
                        <Text style={[styles.logoText, styles.logoHighlight]}>IT</Text>
                    </View>
                </View>

                {/* Animated Car Container */}
                <Pressable 
                    style={styles.imageContainer}
                    onPress={handlePress}
                >
                    <Animated.Text 
                        style={[
                            styles.tempImage,
                            {
                                transform: [
                                    { translateX: driveAnim },
                                    { rotate: wiggleAnim.interpolate({
                                        inputRange: [-3, 3],
                                        outputRange: ['-3deg', '3deg']
                                    })},
                                    { scale: scaleAnim }
                                ]
                            }
                        ]}
                    >
                        🚗
                    </Animated.Text>
                    <Text style={styles.tapHint}>Tap to start your journey</Text>
                </Pressable>

                {/* Content section */}
                <View style={styles.contentContainer}>
                    <View style={styles.textContainer}>
                        <Text style={styles.header}>
                            Smart Car Care{'\n'}Made Simple
                        </Text>
                        <Text style={styles.subheader}>
                            Diagnose, maintain, and optimize your vehicle with ease
                        </Text>
                    </View>

                    {/* Features */}
                    <View style={styles.featureList}>
                        <View style={styles.featureItem}>
                            <Text style={styles.featureEmoji}>🔍</Text>
                            <Text style={styles.featureText}>Real-time diagnostics</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Text style={styles.featureEmoji}>⚡</Text>
                            <Text style={styles.featureText}>Instant insights</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Text style={styles.featureEmoji}>🛠️</Text>
                            <Text style={styles.featureText}>Maintenance tracking</Text>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.buttonContainer}>
                        <Pressable 
                            style={({pressed}) => [
                                styles.button,
                                pressed && styles.buttonPressed
                            ]}  
                            onPress={() => navigation.navigate('HomeScreen')}
                        >
                            <Text style={styles.buttonText}>Get Started</Text>
                        </Pressable>

                        <Pressable 
                            style={styles.loginButton}
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Text style={styles.loginText}>
                                Already have an account? <Text style={styles.loginHighlight}>Log in</Text>
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#000000',
    },
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    logoContainer: {
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 20,
    },
    logoBox: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoText: {
        fontSize: 36,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: 1,
    },
    logoHighlight: {
        color: '#4ADE80',
    },
    imageContainer: {
        height: '40%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    tempImage: {
        fontSize: 120,
        opacity: 0.9,
    },
    tapHint: {
        color: '#808080',
        fontSize: 16,
        marginTop: 20,
        opacity: 0.8,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'space-between',
        paddingBottom: 40,
    },
    textContainer: {
        alignItems: 'center',
        paddingTop: 20,
    },
    header: {
        fontSize: 32,
        fontWeight: '700',
        textAlign: 'center',
        color: '#FFFFFF',
        marginBottom: 12,
        letterSpacing: 0.5,
        lineHeight: 40,
    },
    subheader: {
        fontSize: 16,
        color: '#808080',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 20,
    },
    featureList: {
        gap: 16,
        marginTop: 32,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#1A1A1A',
        padding: 16,
        borderRadius: 12,
    },
    featureEmoji: {
        fontSize: 24,
    },
    featureText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
    },
    buttonContainer: {
        gap: 20,
        alignItems: 'center',
        marginTop: 32,
    },
    button: {
        width: '100%',
        height: 56,
        backgroundColor: '#4ADE80',
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#4ADE80',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    buttonPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },
    buttonText: {
        color: '#000000',
        fontSize: 18,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    loginButton: {
        padding: 8,
    },
    loginText: {
        fontSize: 15,
        color: '#808080',
    },
    loginHighlight: {
        color: '#4ADE80',
        fontWeight: '600',
    },
});

export default GettingStarted