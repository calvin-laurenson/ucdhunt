import { CompositeScreenProps } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useContext } from "react";
import { Button, View, Text, FlatList, StyleSheet } from "react-native";
import { useQuery } from "react-query";
import { AuthContext } from "../../AuthContext";
import { RootStackParamList, TeamStackParamList } from "../../navconfig";
import { backgroundColorFromTile } from "../../util";

type ScreenProps = CompositeScreenProps<NativeStackScreenProps<TeamStackParamList, "Submissions">, NativeStackScreenProps<RootStackParamList>>

const Submissions: React.FC<ScreenProps> = ({ route, navigation }) => {
    const { api } = useContext(AuthContext);
    const query = useQuery(["team-tile-submissions", route.params.tileId], api.fetchTileSubmissions);
    if (query.isLoading) return <Text>Loading...</Text>
    if (query.isError) return <Text>Error: {JSON.stringify(query.error)}</Text>
    if (query.data === undefined) return <Text>No data</Text>
    return (
        <View>
            <Button title="New submission" onPress={() => {
                navigation.navigate("Team", { screen: "Submit", params: { tileId: route.params.tileId } });
            }} />
            <FlatList data={query.data} renderItem={(info) => (
                <View style={[styles.cell, { backgroundColor: backgroundColorFromTile({ description: "", status: info.item.status, disabled: false, submitted: true, id: "", img_link: "" }) }]}>
                    <Text>Submitted: {info.item.relative_time}</Text>
                </View>
            )} />
        </View>
    );
}

const styles = StyleSheet.create({
    cell: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-around",
        height: 40,
        alignItems: "center",
        borderRadius: 5,
        margin: 5
    }
});

export default Submissions;