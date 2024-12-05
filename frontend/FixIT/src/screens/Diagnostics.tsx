import { useRoute } from "@react-navigation/native";
import { FlatList, ScrollView, Text, View } from "react-native"


function Diagnostics() {
const route = useRoute();


return (
  <View>
    <Text>Device Name: </Text>
    <Text>Device ID: </Text>
    <ScrollView>
        <Text>
            
        </Text>
    </ScrollView>
  </View>
);
}
export default Diagnostics