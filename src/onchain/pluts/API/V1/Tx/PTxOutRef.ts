import { int } from "../../../Term/Type/base";
import { pstruct } from "../../../PTypes/PStruct/pstruct";
import { PTxId } from "./PTxId";

export const PTxOutRef = pstruct({
    PTxOutRef: {
        id: PTxId.type,
        index: int
    }
});