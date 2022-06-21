import { Axios } from "axios";
import { createContext } from "react";
import { API } from "./api";

export const AuthContext = createContext<{
    signIn: ({ username, password }: {
        username: string;
        password: string;
    }) => Promise<boolean>;
    signOut: () => void;
    getCreds: () => {username: string | null, password: string | null}
    api: API
}>(null as any);
