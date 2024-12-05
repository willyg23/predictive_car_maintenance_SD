import { useRoute } from "@react-navigation/native";
import { FlatList, ScrollView, Text, View } from "react-native"


function Diagnostics() {
const route = useRoute();
const { deviceName, deviceId, obdData } = route.params;

return (
  <View>
    <Text>Device Name: {deviceName}</Text>
    <Text>Device ID: {deviceId}</Text>
    <ScrollView>
        <Text>
            {obdData}
        </Text>
    </ScrollView>
  </View>
);
}
export default Diagnostics