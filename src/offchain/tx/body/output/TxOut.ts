import Data from "../../../../types/Data";
import Hash32 from "../../../hashes/Hash32/Hash32";
import Script from "../../../script/Script";
import { Value } from "../../../Value";

export default class TxOut
{
    constructor( address: string, amount: Value, datum?: Hash32 | Data, refScript?: Script )
    {

    }
}