import React, { useContext, useEffect, useState } from "react";
import { View, StyleSheet, Button, Image } from "react-native";
import * as ImagePicker from "expo-image-picker"
import { dataURLtoBlob } from "../../util";
import { TeamStackParamList } from "../../navconfig";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import axios from "axios";
import { AuthContext } from "../../AuthContext";
import { useQueryClient } from "react-query";
const Submit: React.FC<NativeStackScreenProps<TeamStackParamList, "Submit">> = ({ route, navigation }) => {
    const [image, setImage] = useState<string | null>(null);
    const [uploadData, setUploadData] = useState<{ uploadURL: string, submissionId: string } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { api, getCreds } = useContext(AuthContext);
    const [disabled, setDisabled] = useState<boolean>(false)
    const { username } = getCreds()
    const pickImage = async () => {
        setDisabled(true)
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        console.log(result);

        if (!result.cancelled) {
            await getUploadURL();
            setImage(result.uri);
        }
        setDisabled(false)
    };

    const getUploadURL = async () => {
        setDisabled(true)
        const resp = await api.beginSubmission(route.params.tileId);
        if ("error" in resp.data) {
            setError(`Error beginning submission: ${resp.data.error}`);
            return
        }
        setUploadData({ uploadURL: resp.data.upload_url, submissionId: resp.data.submission_id })
        setDisabled(false)
    }
    const queryClient = useQueryClient()

    return (
        <View>
            <Button title="Pick an image from camera roll" onPress={pickImage} disabled={disabled} />
            {(image) && (
                <>
                    <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />
                    <Button title="Submit" disabled={disabled} onPress={async () => {
                        setDisabled(true)
                        const formData = new FormData();
                        formData.append("file", dataURLtoBlob(image));
                        const uploadResp = await axios.post(uploadData!.uploadURL, formData);
                        console.log(uploadResp.data);
                        const finishResp = await api.finishSubmission(uploadData!.submissionId)
                        if (finishResp.data.error != null) {
                            console.log("err");
                            
                            setError(`Error finishing submission: ${finishResp.data.error}`);
                            setDisabled(false)
                            return
                        }
                        await queryClient.invalidateQueries("team-tiles")
                        setError(null);
                        navigation.navigate("Drawer", { screen: "Bingo", params: {  } });
                        setDisabled(false)
                    }} />
                </>
            )}

        </View>
    )
}

const styles = StyleSheet.create({});

export default Submit;