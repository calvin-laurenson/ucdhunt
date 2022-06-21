import { NativeStackScreenProps } from "@react-navigation/native-stack";
import axios from "axios";
import React, { useCallback, useContext, useMemo } from "react";
import { View, StyleSheet, Text } from "react-native";
import { useQuery } from "react-query";
import { BaseTeamTile, LayoutTeamTile } from "../../api";
import { AuthContext } from "../../AuthContext";
import BingoBoard from "../../components/BingoBoard";
import { TeamDrawerStackParamList, RootStackParamList } from "../../navconfig";





const Bingo: React.FC<NativeStackScreenProps<TeamDrawerStackParamList, "Bingo">> = ({ route }) => {
    const { api } = useContext(AuthContext);
    const tileData = useQuery(["team-tiles", 1], api.fetchTeamTiles, { refetchInterval: 60 * 1000 })

    if (tileData.isLoading) return <Text>Loading...</Text>
    if (tileData.isError) return <Text>Error: {JSON.stringify(tileData.error)}</Text>
    if (tileData.data === null) return <Text>No data</Text>
    console.log(typeof tileData.data?.data);
    return (
        <View>
            <BingoBoard tiles={tileData.data!.data} />
        </View>
    )
}

const styles = StyleSheet.create({});

export default Bingo;