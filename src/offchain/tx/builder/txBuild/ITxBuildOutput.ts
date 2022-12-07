import { PData, PStruct, Term } from "../../../../onchain";
import Data from "../../../../types/Data";
import Hash32 from "../../../hashes/Hash32/Hash32";
import Value from "../../../ledger/Value";
import Script from "../../../script/Script";

export interface ITxBuildOutput {
    address: string,
    value: Value,
    datum?: Hash32 | Data | Term<PData> | Term<PStruct<any>>
    refScript?: Script
}

export default ITxBuildOutput;