import { DrawerScreenProps } from "@react-navigation/drawer";
import { CompositeScreenProps } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useContext } from "react";
import { FlatList, View, Text, StyleSheet, Pressable } from "react-native"
import { useQuery } from "react-query";
import { AuthContext } from "../../AuthContext";
import { AdminDrawerStackParamList, AdminStackParamList, RootStackParamList } from "../../navconfig";

type ScreenProps = CompositeScreenProps<CompositeScreenProps<DrawerScreenProps<AdminDrawerStackParamList, "Pending">, NativeStackScreenProps<AdminStackParamList>>, NativeStackScreenProps<RootStackParamList>>;

const Pending: React.FC<ScreenProps> = ({ navigation }) => {
    const { api } = useContext(AuthContext);
    const query = useQuery("pending", api.fetchPendingSubmissions)
    if (query.isLoading) return <Text>Loading...</Text>
    if (query.isError) return <Text>Error: {JSON.stringify(query.error)}</Text>
    if (query.data === null || query.data === undefined || query.data.data === null) return <Text>No data</Text>
    const data = query.data.data
    return (
        <View>

            <FlatList
                data={data}
                keyExtractor={item => item.id}
                renderItem={(info) => {
                    return (
                        <Pressable style={styles.cell} onPress={() => {
                            navigation.navigate("Review", { submissionId: info.item.id })
                        }}>
                            <Text>Team: {info.item.team_number}</Text>
                            <Text>Submitted: {info.item.relative_time}</Text>
                        </Pressable>
                    )
                }} />
        </View>
    )
}

const styles = StyleSheet.create({
    cell: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-around",
        height: 40,
        alignItems: "center",
        backgroundColor: "lightgray",
        borderRadius: 5,
        margin: 5
    }
});

export default Pending;