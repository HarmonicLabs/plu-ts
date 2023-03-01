import JsRuntime from "../../../utils/JsRuntime";
import ObjectUtils from "../../../utils/ObjectUtils";

import { Cbor } from "../../../cbor/Cbor";
import { CborObj } from "../../../cbor/CborObj";
import { CborArray } from "../../../cbor/CborObj/CborArray";
import { Data, isData } from "../../../types/Data/Data";
import { dataToCborObj } from "../../../types/Data/toCbor";
import { CborMap, CborMapEntry } from "../../../cbor/CborObj/CborMap";
import { CborUInt } from "../../../cbor/CborObj/CborUInt";
import { CborString, CanBeCborString, forceCborString } from "../../../cbor/CborString";
import { ToCbor } from "../../../cbor/interfaces/CBORSerializable";
import {  nativeScriptToCborObj } from "../../script/NativeScript";
import { Script, ScriptType } from "../../script/Script";
import { dataFromCborObj } from "../../../types/Data/fromCbor";
import { InvalidCborFormatError } from "../../../errors/InvalidCborFormatError";
import { Cloneable } from "../../../types/interfaces/Cloneable";
import { ToJson } from "../../../utils/ts/ToJson";
import { Hash28 } from "../../hashes/Hash28/Hash28";
import { BootstrapWitness } from "./BootstrapWitness";
import { TxRedeemer } from "./TxRedeemer";
import { VKeyWitness } from "./VKeyWitness/VKeyWitness";
import { CborBytes } from "../../../cbor/CborObj/CborBytes";

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

export class TxWitnessSet
    implements ITxWitnessSet, ToCbor, ToJson
{
    readonly vkeyWitnesses?: VKeyWitness[];
    readonly nativeScripts?: Script<ScriptType.NativeScript>[];
    readonly bootstrapWitnesses?: BootstrapWitness[];
    readonly plutusV1Scripts?: Script<ScriptType.PlutusV1>[];
    readonly datums?: Data[];
    readonly redeemers?: TxRedeemer[];
    readonly plutusV2Scripts?: Script<ScriptType.PlutusV2>[];
    
    /*
     * checks that the signer is needed
     * if true adds the witness
     * otherwise nothing happens (the signature is not added)
    **/
    readonly addVKeyWitness: ( vkeyWit: VKeyWitness ) => void
    /*
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
    readonly isComplete: boolean

    constructor( witnesses: ITxWitnessSet, allRequiredSigners: Hash28[] | undefined = undefined )
    {
        JsRuntime.assert(
            isITxWitnessSet( witnesses ),
            "invalid witnesses passed"
        );

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

        const _vkeyWits = vkeyWitnesses?.map( wit => wit.clone() ) ?? [];

        defGetterArr( "vkeyWitnesses", _vkeyWits );
        defGetterArr( "bootstrapWitnesses", bootstrapWitnesses );
        defGetterArr( "datums", datums );
        defGetterArr( "nativeScripts", nativeScripts );
        defGetterArr( "plutusV1Scripts", plutusV1Scripts );
        defGetterArr( "plutusV2Scripts", plutusV2Scripts );
        defGetterArr( "redeemers", redeemers );

        const _reqSigs =
            Array.isArray( allRequiredSigners ) && allRequiredSigners.every( reqSig => reqSig instanceof Hash28 ) ? 
            allRequiredSigners.map( sig => sig.toString() ) :
            undefined;

        const noRequiredSigs = _reqSigs === undefined; 

        Object.defineProperty(
            this, "isComplete",
            {
                get: () => noRequiredSigs ||
                    _reqSigs.every( 
                        sig => 
                        _vkeyWits.some( 
                            wit => wit.vkey.hash.toString() === sig 
                        )
                    ),
                set: () => {},
                configurable: false,
                enumerable: true 
            }
        );

        ObjectUtils.defineReadOnlyProperty(
            this, "addVKeyWitness",
            ( vkeyWit: VKeyWitness ) => {
                // if(
                //     noRequiredSigs ||
                //     _reqSigs.includes( vkeyWit.vkey.hash.toString() )
                // )
                // {
                //     _vkeyWits.push( vkeyWit.clone() );
                // }
                _vkeyWits.push( vkeyWit.clone() );
            }
        )
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
                        .map( script =>  Cbor.parse( script.cbor ) )
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

    static fromCbor( cStr: CanBeCborString ): TxWitnessSet
    {
        return TxWitnessSet.fromCborObj( Cbor.parse( forceCborString( cStr ) ) );
    }
    static fromCborObj( cObj: CborObj ): TxWitnessSet
    {
        if(!( cObj instanceof CborMap ))
        throw new InvalidCborFormatError("TxWitnessSet");

        let fields: (CborArray | undefined)[] = new Array( 7 ).fill( undefined );

        for( let i = 0; i < 7; i++)
        {
            const { v } = cObj.map.find(
                ({ k }) => k instanceof CborUInt && Number( k.num ) === i
            ) ?? { v: undefined };

            if( v === undefined || !(v instanceof CborArray) ) continue;

            fields[i] = v;
        }

        const [
            _vkey,
            _native,
            _bootstrap,
            _plutusV1,
            _dats,
            _reds,
            _plutusV2
        ] = fields;

        return new TxWitnessSet({
            vkeyWitnesses: _vkey === undefined ? undefined : _vkey.array.map( VKeyWitness.fromCborObj ),
            nativeScripts: _native === undefined ? undefined : 
                _native.array.map( nativeCborObj => 
                    new Script(
                        ScriptType.NativeScript, 
                        Cbor.encode( nativeCborObj ).asBytes
                    )
                ),
            bootstrapWitnesses: _bootstrap === undefined ? undefined :
                _bootstrap.array.map( BootstrapWitness.fromCborObj ),
            plutusV1Scripts: _plutusV1 === undefined ? undefined :
                _plutusV1.array.map( cbor =>
                    new Script(
                        ScriptType.PlutusV1,
                        Cbor.encode( cbor ).asBytes
                    )
                ),
            datums: _dats === undefined ? undefined :
                _dats.array.map( dataFromCborObj ),
            redeemers: _reds === undefined ? undefined :
                _reds.array.map( TxRedeemer.fromCborObj ),
            plutusV2Scripts: _plutusV2 === undefined ? undefined :
                _plutusV2.array.map( cbor =>
                    new Script(
                        ScriptType.PlutusV2,
                        Cbor.encode( cbor ).asBytes
                    )
                ),
            
        })
    }

}