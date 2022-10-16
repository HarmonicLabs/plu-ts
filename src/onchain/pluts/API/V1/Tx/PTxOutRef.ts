import pstruct from "../../../PTypes/PStruct";
import { int } from "../../../Term/Type";
import PTxId from "./PTxId";

const PTxOutRef = pstruct({
    PTxOutRef: {
        id: PTxId.type,
        index: int
    }
})

export default PTxOutRef;