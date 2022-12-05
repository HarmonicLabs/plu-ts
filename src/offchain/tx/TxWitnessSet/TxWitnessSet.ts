import { PlutusScriptVersion, ScriptJsonFormat } from "../../../onchain/pluts/Script";
import Data from "../../../types/Data";
import NativeScript from "../../script/NativeScript";
import Script, { ScriptType } from "../../script/Script";
import BootstrapWitness from "./BootstrapWitness";
import TxRedeemer from "./TxRedeemer";
import VKeyWitness from "./VKeyWitness/VKeyWitness";

export interface ITxWitnessSet {
    vkeyWitnesses?: VKeyWitness[],
    nativeScripts?: (NativeScript | Script<ScriptType.NativeScript>)[],
    bootstrapWitnesses?: BootstrapWitness[],
    plutusV1Scripts?: (
        ScriptJsonFormat<PlutusScriptVersion.V1> | 
        Script<ScriptType.PlutusV1>
    )[],
    datums?: Data[],
    redeemers?: TxRedeemer[],
    plutusV2Scripts?: (
        ScriptJsonFormat<PlutusScriptVersion.V2> | 
        Script<ScriptType.PlutusV2>
    )[],
};

export default class TxWitnessSet
    implements ITxWitnessSet
{
    readonly vkeyWitnesses?: VKeyWitness[];
    readonly nativeScripts?: (NativeScript | Script<ScriptType.NativeScript>)[];
    readonly bootstrapWitnesses?: BootstrapWitness[];
    readonly plutusV1Scripts?: (
        ScriptJsonFormat<PlutusScriptVersion.V1> | 
        Script<ScriptType.PlutusV1>
    )[];
    readonly datums?: Data[];
    readonly redeemers?: TxRedeemer[];
    readonly plutusV2Scripts?: (
        ScriptJsonFormat<PlutusScriptVersion.V2> | 
        Script<ScriptType.PlutusV2>
    )[];

    constructor( witnesses: ITxWitnessSet )
    {
        
    }


}