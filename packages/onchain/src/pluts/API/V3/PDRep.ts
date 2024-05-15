import { pstruct } from "../../PTypes";
import { PCredential } from "../V1";

export const PDrep = pstruct({
    DRep: { credentials: PCredential.type },
    AlwaysAbstain: {},
    AlwaysNoConfidence: {}
});