import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigatorScreenParams, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useMemo, useReducer } from 'react';
import Pending from './screens/admin/Pending';
import Review from './screens/admin/Review';
import Bingo from './screens/team/Bingo';
import Leaderboard from './screens/team/Leaderboard';
import Submit from './screens/team/Submit';
import TeamSelect from './screens/TeamSelect';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from './AuthContext';
import { API } from './api';
import axios from 'axios';
import Submissions from './screens/team/Submissions';

const ROOT_URL = 'https://api.ucdhunt.calvin.laurenson.dev/api';


const TeamDrawer = createDrawerNavigator();
const TeamStack = createNativeStackNavigator();
const AdminDrawer = createDrawerNavigator();
const AdminStack = createNativeStackNavigator();
const RootStack = createNativeStackNavigator();

function TeamScreens() {
    return (
        <TeamDrawer.Navigator initialRouteName="Bingo">
            <TeamDrawer.Screen name="Bingo" component={Bingo} />
            <TeamDrawer.Screen name="Leaderboard" component={Leaderboard} />
        </TeamDrawer.Navigator>
    )
}

function Team() {
    return (
        <TeamStack.Navigator initialRouteName="Drawer">
            <TeamStack.Screen name="Drawer" component={TeamScreens} options={{ headerShown: false }} />
            <TeamStack.Screen name="Submissions" component={Submissions} />
            <TeamStack.Screen name="Submit" component={Submit} />

        </TeamStack.Navigator>
    )
}

function AdminScreens() {
    return (
        <AdminDrawer.Navigator initialRouteName="Pending">

            <AdminDrawer.Screen name="Pending" component={Pending} />
        </AdminDrawer.Navigator>
    )
}

function Admin() {
    return (
        <AdminStack.Navigator>
            <AdminStack.Screen name="Drawer" component={AdminScreens} options={{ headerShown: false }} />
            <AdminStack.Screen name="Review" component={Review} />
        </AdminStack.Navigator>
    )
}

type AuthState = {
    username: string | null,
    password: string | null,
    isLoading: boolean
    isLoggedIn: boolean,
}
enum AuthActionType {
    RESTORE_LOGIN,
    SIGN_IN,
    SIGN_OUT
}
type AuthAction = {
    type: AuthActionType.RESTORE_LOGIN,
    username: string | null,
    password: string | null,
} |
{
    type: AuthActionType.SIGN_IN,
    username: string,
    password: string,
} |
{
    type: AuthActionType.SIGN_OUT,
}

function Main() {
    const navigation = useNavigation()
    const [state, dispatch] = useReducer<(prevState: AuthState, action: AuthAction) => AuthState>(
        (prevState, action) => {
            switch (action.type) {
                case AuthActionType.RESTORE_LOGIN:
                    return {
                        ...prevState,
                        username: action.username,
                        password: action.password,
                        isLoading: false,
                    };
                case AuthActionType.SIGN_IN:
                    return {
                        ...prevState,
                        isSignout: false,
                        username: action.username,
                        password: action.password,
                    };
                case AuthActionType.SIGN_OUT:
                    return {
                        ...prevState,
                        isSignout: true,
                        username: null,
                        password: null,
                    };
            }
        },
        {
            isLoading: true,
            isLoggedIn: false,
            username: null,
            password: null
        }
    );

    useEffect(() => {
        // Fetch the token from storage then navigate to our appropriate place
        const bootstrapAsync = async () => {
            let username;
            let password;

            try {
                username = await AsyncStorage.getItem("username");
                password = await AsyncStorage.getItem("password");
            } catch (e) {
                // Restoring token failed
            }
            if (username === undefined) username = null;
            if (password === undefined) password = null;

            // After restoring token, we may need to validate it in production apps

            // This will switch to the App screen or Auth screen and this loading
            // screen will be unmounted and thrown away.
            dispatch({ type: AuthActionType.RESTORE_LOGIN, username, password });
        };

        bootstrapAsync();
    }, []);
    const authContext = useMemo(
        () => {
            const getCreds = () => ({username: state.username, password: state.password})
            const apiClient = new API(axios.create({
                baseURL: ROOT_URL,
                responseType: "json",
            }))
            return {
                signIn: async ({ username, password }: { username: string, password: string }): Promise<boolean> => {
                    // In a production app, we need to send some data (usually username, password) to server and get a token
                    // We will also need to handle errors if sign in failed
                    // After getting token, we need to persist the token using `SecureStore`
                    // In the example, we'll use a dummy token

                    const loginValid = await apiClient.validateLogin(username, password);
                    if (!loginValid) {
                        console.log("Invalid login");
                        return false
                    }
                    if (username === "admin") {
                        console.log("Successful admin login");

                        navigation.navigate("Admin", { screen: "Drawer", params: { screen: "Pending", params: {} } });
                    } else {
                        navigation.navigate("Team", { screen: "Drawer", params: { screen: "Bingo", params: { teamNumber: Number(username) } } })
                    }
                    apiClient.setCreds({username, password})
                    dispatch({ type: AuthActionType.SIGN_IN, username, password });
                    return true
                },
                signOut: () => dispatch({ type: AuthActionType.SIGN_OUT }),
                getCreds,
                api: apiClient
            }
        },
        []
    );
    return (
        <AuthContext.Provider value={authContext}>
            <RootStack.Navigator initialRouteName="Team Select">
                <RootStack.Screen
                    name="Team"
                    component={Team}
                    options={{ headerShown: false, }}
                />
                <RootStack.Screen
                    name="Admin"
                    component={Admin}
                    options={{ headerShown: false, }}
                />
                <RootStack.Screen name="Team Select" component={TeamSelect} />
            </RootStack.Navigator>
        </AuthContext.Provider>
    )
}

export { Main }