import { DrawerScreenProps } from "@react-navigation/drawer";
import { CompositeScreenProps } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useContext } from "react";
import { View, Text, Image, Button, Dimensions } from "react-native"
import { useQuery, useQueryClient } from "react-query";
import { AuthContext } from "../../AuthContext";
import { AdminStackParamList, RootStackParamList } from "../../navconfig";

type ScreenProps = CompositeScreenProps<NativeStackScreenProps<AdminStackParamList, "Review">, NativeStackScreenProps<RootStackParamList>>;


const Review: React.FC<ScreenProps> = ({route, navigation}) => {
    const submissionId = route.params.submissionId;
    const { api } = useContext(AuthContext);
    const query = useQuery(["submission", submissionId], api.fetchSubmissionDetails, { refetchInterval: 60 * 1000 })
    if (query.isLoading) return <Text>Loading...</Text>
    if (query.isError) return <Text>Error: {JSON.stringify(query.error)}</Text>
    if (query.data === undefined) return <Text>No data</Text>
    const data = query.data
    const { width, height } = Dimensions.get('window');
    function backToList() {
        navigation.navigate("Admin", { screen: "Drawer", params: { screen: "Pending", params: {} } })
    }
    const queryClient = useQueryClient()

    return (
        <View>
            <Text>Team: {data.team_number}</Text>
            <Text>Tile text: {data.tile.description}</Text>
            <Image source={{uri: data.image}} style={{width: width, height: height, resizeMode: "cover"}} />
            <Button title="Approve" color="green" onPress={async () => {
                await api.approveSubmission(submissionId, true)
                await queryClient.invalidateQueries("pending")
                backToList()
            }} />
            <Button title="Reject" color="red" onPress={async () => {
                await api.approveSubmission(submissionId, false)
                await queryClient.invalidateQueries("pending")
                backToList()
            }} />
        </View>
    )
}

export default Review;