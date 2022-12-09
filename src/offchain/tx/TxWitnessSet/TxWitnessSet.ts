import Cbor from "../../../cbor/Cbor";
import CborObj from "../../../cbor/CborObj";
import CborArray from "../../../cbor/CborObj/CborArray";
import CborMap, { CborMapEntry } from "../../../cbor/CborObj/CborMap";
import CborUInt from "../../../cbor/CborObj/CborUInt";
import CborString from "../../../cbor/CborString";
import { ToCbor } from "../../../cbor/interfaces/CBORSerializable";
import { PlutusScriptVersion, ScriptJsonFormat } from "../../../onchain/pluts/Script";
import Data from "../../../types/Data";
import { dataToCborObj } from "../../../types/Data/toCbor";
import NativeScript, { nativeScriptToCborObj } from "../../script/NativeScript";
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
    implements ITxWitnessSet, ToCbor
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

    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() );
    }

    toCborObj(): CborObj
    {
        return new CborMap(
            ([
                this.vkeyWitnesses === undefined ? undefined :
                {
                    k: new CborUInt( 0 ),
                    v: new CborArray(
                        this.vkeyWitnesses.map( witness => witness.toCborObj() )
                    )
                },

                this.nativeScripts === undefined ? undefined :
                {
                    k: new CborUInt( 1 ),
                    v: new CborArray(
                        this.nativeScripts.map( 
                            nativeScript => nativeScript instanceof Script ?
                            Cbor.parse( nativeScript.cbor ) :
                            nativeScriptToCborObj( nativeScript ) )
                    )
                },

                this.bootstrapWitnesses === undefined ? undefined :
                {
                    k: new CborUInt( 2 ),
                    v: new CborArray(
                        this.bootstrapWitnesses.map( w => w.toCborObj() )
                    )
                },

                this.plutusV1Scripts === undefined ? undefined :
                {
                    k: new CborUInt( 3 ),
                    v: new CborArray(
                        this.plutusV1Scripts.map( script =>     
                            Cbor.parse(
                                script instanceof Script ? 
                                script.cbor : 
                                Buffer.from( script.cborHex, "hex" ) 
                            )
                        )
                    )
                },

                this.datums === undefined ? undefined :
                {
                    k: new CborUInt( 4 ),
                    v: new CborArray(
                        this.datums.map( dataToCborObj )
                    )
                },

                this.redeemers === undefined ? undefined :
                {
                    k: new CborUInt( 5 ),
                    v: new CborArray(
                        this.redeemers.map( r => r.toCborObj() )
                    )
                },

                this.plutusV2Scripts === undefined ? undefined :
                {
                    k: new CborUInt( 6 ),
                    v: new CborArray(
                        this.plutusV2Scripts.map( script =>     
                            Cbor.parse(
                                script instanceof Script ? 
                                script.cbor : 
                                Buffer.from( script.cborHex, "hex" ) 
                            )
                        )
                    )
                },
            ]
            .filter( elem => elem !== undefined ) as CborMapEntry[])
        )
    }


}