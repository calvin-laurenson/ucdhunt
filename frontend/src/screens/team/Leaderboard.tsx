import { useContext } from "react";
import { View, StyleSheet, Text, FlatList } from "react-native";
import { useQuery } from "react-query";
import { AuthContext } from "../../AuthContext";

function Leaderboard() {
    const { api } = useContext(AuthContext);
    const query = useQuery("leaderboard", api.fetchLeaderboard);
    if (query.isLoading) return <Text>Loading...</Text>
    if (query.isError) return <Text>Error: {JSON.stringify(query.error)}</Text>
    if (query.data === undefined) return <Text>No data</Text>
    const data = query.data
    return (
        <FlatList data={data} renderItem={(info) => (
            <View style={styles.cell}>
                <Text>{info.index + 1}</Text>
                <Text>Team: {info.item.team_number}</Text>
                <Text>Score: {info.item.score}</Text>
                </View>
        
        )} />
    )
}

const styles = StyleSheet.create({cell: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    height: 40,
    alignItems: "center",
    backgroundColor: "lightgray",
    borderRadius: 5,
    margin: 5
}});

export default Leaderboard;