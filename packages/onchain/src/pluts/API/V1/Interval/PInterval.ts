import { pstruct } from "../../../PTypes/PStruct/pstruct";
import { PLowerBound } from "./PLowerBound";
import { PUpperBound } from "./PUpperBound";

export const PInterval = pstruct({
    PInterval: {
        from: PLowerBound.type,
        to: PUpperBound.type
    }
});