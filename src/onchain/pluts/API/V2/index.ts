import V1 from "../V1";
import PScriptContext from "./ScriptContext/PScriptContext";
import pfindOwnInput from "./ScriptContext/PTxInfo/pfindOwnInput";
import pownHash from "./ScriptContext/PTxInfo/pownHash";
import PTxInfo from "./ScriptContext/PTxInfo/PTxInfo";
import POutputDatum from "./Tx/POutputDatum";
import PTxInInfo from "./Tx/PTxInInfo";
import PTxOut from "./Tx/PTxOut";


const V2 = Object.freeze({
    ...V1,

    PScriptContext,
    PTxInfo, pfindOwnInput, pownHash,

    POutputDatum,
    PTxInInfo,
    PTxOut
});

export default V2;