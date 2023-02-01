import Cbor from "../../../cbor/Cbor";
import CborObj from "../../../cbor/CborObj";
import CborArray from "../../../cbor/CborObj/CborArray";
import CborMap, { CborMapEntry } from "../../../cbor/CborObj/CborMap";
import CborUInt from "../../../cbor/CborObj/CborUInt";
import CborString from "../../../cbor/CborString";
import { ToCbor } from "../../../cbor/interfaces/CBORSerializable";
import Data, { isData } from "../../../types/Data";
import dataToCbor, { dataToCborObj } from "../../../types/Data/toCbor";
import Cloneable from "../../../types/interfaces/Cloneable";
import JsRuntime from "../../../utils/JsRuntime";
import ObjectUtils from "../../../utils/ObjectUtils";
import ToJson from "../../../utils/ts/ToJson";
import PrivateKey from "../../credentials/PrivateKey";
import Hash28 from "../../hashes/Hash28/Hash28";
import { nativeScriptToCborObj } from "../../script/NativeScript";
import Script, { ScriptType } from "../../script/Script";
import BootstrapWitness from "./BootstrapWitness";
import TxRedeemer from "./TxRedeemer";
import VKey from "./VKeyWitness/VKey";
import VKeyWitness from "./VKeyWitness/VKeyWitness";

export interface ITxWitnessSet {
    vkeyWitnesses?: VKeyWitness[],
    nativeScripts?: Script<ScriptType.NativeScript>[],
    bootstrapWitnesses?: BootstrapWitness[],
    plutusV1Scripts?: Script<ScriptType.PlutusV1>[],
    datums?: Data[],
    redeemers?: TxRedeemer[],
    plutusV2Scripts?: Script<ScriptType.PlutusV2>[],
};

function isUndefOrCheckedArr<ArrElemT>( stuff: undefined | ArrElemT[], arrayElemCheck: (elem: ArrElemT) => boolean )
{
    return (
        stuff === undefined || (
            Array.isArray( stuff ) &&
            stuff.every( arrayElemCheck )
        )
    );
}

export function isITxWitnessSet( set: object ): set is ITxWitnessSet
{
    if( !ObjectUtils.isObject( set ) ) return false;

    const {
        vkeyWitnesses,
        nativeScripts,
        bootstrapWitnesses,
        plutusV1Scripts,
        datums,
        redeemers,
        plutusV2Scripts
    } = set as ITxWitnessSet;

    return (
        isUndefOrCheckedArr(
            vkeyWitnesses,
            vkeyWit => vkeyWit instanceof VKeyWitness
        ) &&
        isUndefOrCheckedArr(
            nativeScripts,
            ns => ns instanceof Script && ns.type === ScriptType.NativeScript
        ) &&
        isUndefOrCheckedArr(
            bootstrapWitnesses,
            bootWit => bootWit instanceof BootstrapWitness
        ) &&
        isUndefOrCheckedArr(
            plutusV1Scripts,
            pv1 => pv1 instanceof Script && pv1.type === ScriptType.PlutusV1
        ) &&
        isUndefOrCheckedArr( datums, isData ) &&
        isUndefOrCheckedArr(
            redeemers,
            rdmr => rdmr instanceof TxRedeemer
        ) &&
        isUndefOrCheckedArr(
            plutusV2Scripts,
            pv2 => pv2 instanceof Script && pv2.type === ScriptType.PlutusV2
        )
    );
}

export default class TxWitnessSet
    implements ITxWitnessSet, ToCbor, ToJson
{
    readonly vkeyWitnesses?: VKeyWitness[];
    readonly nativeScripts?: Script<ScriptType.NativeScript>[];
    readonly bootstrapWitnesses?: BootstrapWitness[];
    readonly plutusV1Scripts?: Script<ScriptType.PlutusV1>[];
    readonly datums?: Data[];
    readonly redeemers?: TxRedeemer[];
    readonly plutusV2Scripts?: Script<ScriptType.PlutusV2>[];
    
    /**
     * checks that the signer is needed
     * if true adds the witness
     * otherwise nothing happens (the signature is not added)
    **/
    // readonly addVKeyWitnessIfNeeded: ( vkeyWit: VKeyWitness ) => void
    /**
     * @returns {boolean}
     *  `true` if all the signers needed
     *  have signed the transaction; `false` otherwise
     * 
     * signers needed are:
     *  - required to spend an utxo
     *  - required by certificate
     *  - required by withdrawals
     *  - additional specified in the `requiredSigners` field
     */
    // readonly isComplete: () => boolean

    constructor( witnesses: ITxWitnessSet, allRequiredSigners: Hash28[] = [] )
    {
        JsRuntime.assert(
            isITxWitnessSet( witnesses ),
            "invalid witnesses passed"
        );

        // let _required = allRequiredSigners.map( sig => sig.asString );

        const defGetter = ( name: keyof ITxWitnessSet, get: () => any ) =>
        {
            ObjectUtils.definePropertyIfNotPresent(
                this, name,
                {
                    get,
                    set: () => {},
                    enumerable: true,
                    configurable: false
                }
            )
        };

        function cloneArr<Stuff extends Cloneable<any>>( arr?: Stuff[] ): Stuff[]
        {
            return arr?.map( element => element.clone() ) ?? [];
        }

        function defGetterArr( name: keyof ITxWitnessSet, elems?: Cloneable<any>[] )
        {
            let _elems = cloneArr( elems );
            defGetter(
                name,
                () => _elems.length === 0 ? undefined : cloneArr( _elems )
            );
        }

        const {
            vkeyWitnesses,
            bootstrapWitnesses,
            datums,
            nativeScripts,
            plutusV1Scripts,
            plutusV2Scripts,
            redeemers
        } = witnesses;

        defGetterArr( "vkeyWitnesses", vkeyWitnesses );
        defGetterArr( "bootstrapWitnesses", bootstrapWitnesses );
        defGetterArr( "datums", datums );
        defGetterArr( "nativeScripts", nativeScripts );
        defGetterArr( "plutusV1Scripts", plutusV1Scripts );
        defGetterArr( "plutusV2Scripts", plutusV2Scripts );
        defGetterArr( "redeemers", redeemers );
    }

    toJson()
    {
        return {
            vkeyWitnesses: this.vkeyWitnesses?.map( vkWit => vkWit.toJson() ),
            nativeScripts: this.nativeScripts?.map( ns => ns.toJson() ),
            bootstrapWitnesses: this.bootstrapWitnesses?.map( bWit => bWit.toJson() ),
            plutusV1Scripts: this.plutusV1Scripts?.map( s => s.toJson() ),
            datums: this.datums?.map( dat => dat.toJson() ),
            redeemers: this.redeemers?.map( rdmr => rdmr.toJson() ),
            plutusV2Scripts: this.plutusV2Scripts?.map( s => s.toJson() )
        }
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
                        this.plutusV1Scripts
                        .map( script => Cbor.parse( script.cbor ) )
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
                        this.plutusV2Scripts
                        .map( script => Cbor.parse( script.cbor ) )
                    )
                },
            ]
            .filter( elem => elem !== undefined ) as CborMapEntry[])
        )
    }


}