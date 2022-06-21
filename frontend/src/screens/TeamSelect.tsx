import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useContext } from "react";
import { useForm, Controller } from "react-hook-form";
import { View, Text, TextInput, StyleSheet, Button } from "react-native"
import { AuthContext } from "../AuthContext";
import { RootStackParamList } from "../navconfig";

const TeamSelect: React.FC<NativeStackScreenProps<RootStackParamList, "Team Select">> = ({ navigation }) => {

    const { control, handleSubmit, formState: { errors }, setError } = useForm<{ teamNumber: string, password: string }>({
        defaultValues: {
            teamNumber: "1",
            password: ""
        }
    });
    const { signIn } = useContext(AuthContext);



    const onSubmit = handleSubmit(async ({ teamNumber, password }) => {
        
        const resp = await signIn({ username: teamNumber, password });
        if(!resp) setError("password", { message: "Invalid login" });
          
    });

    return (
        <View>
            <Controller
                control={control}
                rules={{
                    validate: (value) => (Number.isInteger(Number(value)) && Number(value) >= 1 && Number(value) <= 25) || value.trim() === "admin",
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        style={styles.teamNumberInput}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                    />
                )}
                name="teamNumber"
            />
            {errors.teamNumber && (<Text>Team Number must be an integer between 1 and 25</Text>)}
            <Controller
                control={control}
                rules={{
                    validate: (value) => value.length <= 50,
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        style={styles.passwordInput}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        secureTextEntry={true}
                    />
                )}
                name="password"
            />

            {errors.password && (<Text>{errors.password.message}</Text>)}

            <Button title="Submit" onPress={onSubmit} />
        </View>
    )
}

const styles = StyleSheet.create({
    teamNumberInput: {},
    passwordInput: {},
    submitButton: {},
})

export default TeamSelect;