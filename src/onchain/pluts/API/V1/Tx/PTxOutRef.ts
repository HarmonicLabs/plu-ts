import pstruct from "../../../PTypes/PStruct/pstruct";
import { int } from "../../../Term/Type/base";
import PTxId from "./PTxId";

const PTxOutRef = pstruct({
    PTxOutRef: {
        id: PTxId.type,
        index: int
    }
})

export default PTxOutRef;