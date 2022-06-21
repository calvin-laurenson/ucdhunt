import { LinkingOptions, NavigatorScreenParams } from "@react-navigation/native"
export type TeamDrawerStackParamList = {
    ["Bingo"]: {},
    ["Leaderboard"]: {},
}
export type TeamStackParamList = {
  ["Submit"]: {tileId: string},
  ["Submissions"]: {tileId: string},
  ["Drawer"]: NavigatorScreenParams<TeamDrawerStackParamList>,
}
export type AdminDrawerStackParamList = {
  ["Pending"]: {},
}
export type AdminStackParamList = {
  ["Drawer"]: NavigatorScreenParams<AdminDrawerStackParamList>,
  ["Review"]: {submissionId: string}
}
export type RootStackParamList = {
    ["Team"]: NavigatorScreenParams<TeamStackParamList>,
    ["Admin"]: NavigatorScreenParams<AdminStackParamList>,
    ["Team Select"]: {},
  }
  declare global {
    namespace ReactNavigation {
      interface RootParamList extends RootStackParamList {}
    }
  }
  
  export const linking: LinkingOptions<ReactNavigation.RootParamList> = {
    prefixes: [],
    config: {
      screens: {
        "Team Select": "team-select"
      }
    }
  }