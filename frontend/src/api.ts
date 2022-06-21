import { Axios, AxiosResponse } from "axios";
import { QueryFunction } from "react-query";
export enum SubmissionStatus {
    WAITING = 0,
    RECEIVED = 1,
    REJECTED = 2,
    APPROVED = 3
}

export interface BaseTeamTile {
    id: string
    description: string
    disabled: boolean
    img_link: string
    submitted: boolean
    status: SubmissionStatus
}
export interface LayoutTeamTile extends BaseTeamTile {
    col: number
    row: number
}

export type SubmissionBegin = {
    upload_url: string
    submission_id: string
} | { error: string }

export type SubmissionFinish = { "error": string | null }

export type PendingSubmission = {
    id: string
    team_number: number
    relative_time: string
}

export type SubmissionDetails = {
    team_number: number,
    image: string,
    status: SubmissionStatus,
    tile: {
        row: number,
        col: number,
        description: string
    }
}

export type LeaderboardItem = {
    team_number: number
    score: number
}
export type TileSubmission = {
    status: SubmissionStatus
    relative_time: string
}

export class API {
    private creds: { username: string, password: string } | null = null
    constructor(private axios: Axios){

    }

    setCreds = (creds: { username: string, password: string }) => {
        this.creds = creds
    }
    
    fetchTeamTiles: QueryFunction<AxiosResponse<LayoutTeamTile[], any>> = async ({  }) => {
        if (this.creds === null) throw new Error("Credentials not set")
        return await this.axios.get<LayoutTeamTile[]>("/team-tiles", { params: {  }, auth: this.creds });
    }

    fetchPendingSubmissions = async () => {
        if (this.creds === null) throw new Error("Credentials not set")
        return await this.axios.get<PendingSubmission[]>("/pending-submissions", { auth: this.creds });
    }

    fetchSubmissionDetails: QueryFunction<SubmissionDetails> = async ({queryKey}) => {
        if (this.creds === null) throw new Error("Credentials not set")
        return (await this.axios.get<SubmissionDetails>("/submission-details", { params: { submission_id: queryKey[1] }, auth: this.creds })).data;
    }

    fetchLeaderboard: QueryFunction<LeaderboardItem[]> = async () => {
        return (await this.axios.get<LeaderboardItem[]>("/leaderboard")).data;
    }

    fetchTileSubmissions: QueryFunction<TileSubmission[]> = async ({queryKey}) => {
        if (this.creds === null) throw new Error("Credentials not set")
        return (await this.axios.get<TileSubmission[]>("/team-tile-submissions", { params: { tile_id: queryKey[1] }, auth: this.creds })).data;
    }
    approveSubmission = async (submissionId: string, approved: boolean) => {
        if (this.creds === null) throw new Error("Credentials not set")
        return await this.axios.post<{error: string | null}>("/review", { submission_id: submissionId, approved }, { auth: this.creds });
    }
    
    beginSubmission = async (tileId: string) => {
        if (this.creds === null) throw new Error("Credentials not set")
        return await this.axios.post<SubmissionBegin>("/begin-submit", tileId, { auth: this.creds});
    }
    
    finishSubmission = async (submissionId: string) => {
        return await this.axios.post<SubmissionFinish>("/finish-submit", submissionId)
    }


    
    validateLogin = async (username: string, password: string): Promise<boolean> => {
        const response = await this.axios.post<{ error: string | null }>("/login", { username, password });
        console.log(response);
        
        return (response.data.error === null);
    }
}

