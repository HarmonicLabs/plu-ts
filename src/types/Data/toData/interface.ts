import { Data } from "../Data";

export interface ToData {
    toData: ( version?: "v1" | "v2" ) => Data
}