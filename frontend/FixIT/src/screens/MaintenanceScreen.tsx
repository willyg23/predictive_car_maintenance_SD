import { StyleSheet, View, Text, ScrollView } from "react-native";
import Header from "../components/Header";
import NavigationBar from "../components/NavigationBar";

const MaintenanceScreen = () => {
    return (
        <View style={styles.container}>
            <Header />
            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.title}>Maintenance</Text>
                <Text style={styles.subtitle}>Track and schedule your vehicle maintenance</Text>
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
    title: {
        color: '#FFFFFF',
        fontSize: 32,
        fontWeight: '700',
    },
    subtitle: {
        color: '#808080',
        fontSize: 16,
    },
});

export default MaintenanceScreen; 