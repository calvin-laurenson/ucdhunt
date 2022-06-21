import { useNavigation } from "@react-navigation/core";
import { useMemo } from "react"
import { View, StyleSheet, Text, Pressable } from "react-native"
import { BaseTeamTile, LayoutTeamTile, SubmissionStatus } from "../api";
import { backgroundColorFromTile } from "../util";


const BingoBoard: React.FC<{ tiles: LayoutTeamTile[] }> = ({ tiles }) => {
    const navigation = useNavigation();
    const tileGrid = useMemo(() => {
        const maxRows = Math.max(...tiles.map(tile => tile.row))
        const maxCols = Math.max(...tiles.map(tile => tile.col))
        console.log(maxRows, maxCols);

        const grid: BaseTeamTile[][] = Array(maxRows + 1).fill(0).map(() => Array(maxCols + 1).fill(0))
        console.log(grid);

        tiles.forEach(tile => {
            grid[tile.row][tile.col] = tile
        }
        )
        console.log(grid);
        return grid
    }, [tiles]);

    function handleTilePress(tile: BaseTeamTile) {
        navigation.navigate("Team", {screen: "Submissions", params: {tileId: tile.id}})
    }

    return (
        <View style={styles.board}>
            {tileGrid.map((row, ri) => (
                <View style={styles.row} key={ri}>
                    {row.map((tile, ti) => (
                        <Pressable style={[ styles.tile, {backgroundColor: backgroundColorFromTile(tile)} ]} key={`${ri}-${ti}`} onPress={() => handleTilePress(tile)}>
                            <Text style={styles.tileText as any}>
                                {tile.description}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            ))}
        </View>
    )
}

const styles = StyleSheet.create({
    tile: {
        display: "flex",
        flexDirection: "column",
        borderWidth: 2,
        flexGrow: 1,
        aspectRatio: 1 / 1,
        justifyContent: "center",
        width: "min-content",
        flexBasis: 0
    },
    row: {
        display: "flex",
        flexDirection: "row",
        flexGrow: 1,
        aspectRatio: 5 / 1
    },
    board: {
        display: "flex",
        margin: "10%",
    },
    tileText: {
        textAlign: "center",
        flexWrap: "wrap",
        fontSize: "2.5vw",
    }

})

export default BingoBoard