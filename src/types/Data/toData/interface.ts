import Data from "..";

export interface ToData {
    toData: ( version?: "v1" | "v2" ) => Data
}

export default ToData;