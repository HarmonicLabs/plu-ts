import Cbor from "../../../cbor/Cbor";
import CborArray from "../../../cbor/CborObj/CborArray";
import CborBytes from "../../../cbor/CborObj/CborBytes";
import CborMap, { CborMapEntry } from "../../../cbor/CborObj/CborMap";
import CborTag from "../../../cbor/CborObj/CborTag";
import CborUInt from "../../../cbor/CborObj/CborUInt";
import CborString from "../../../cbor/CborString";
import { ToCbor } from "../../../cbor/interfaces/CBORSerializable";
import { blake2b_256 } from "../../../crypto";
import { PlutusScriptVersion, ScriptJsonFormat } from "../../../onchain/pluts/Script";
import JsRuntime from "../../../utils/JsRuntime";
import ObjectUtils from "../../../utils/ObjectUtils";
import AuxiliaryDataHash from "../../hashes/Hash32/AuxiliaryDataHash";
import Hash32 from "../../hashes/Hash32/Hash32";
import NativeScript from "../../script/NativeScript";
import Script, { ScriptType } from "../../script/Script";
import { TxMetadata } from "../metadata/TxMetadata";

export interface IAuxiliaryData {
    metadata?: TxMetadata;
    nativeScripts?: (NativeScript | Script<ScriptType.NativeScript>)[];
    plutusV1Scripts?: (ScriptJsonFormat<PlutusScriptVersion.V1> | Script<ScriptType.PlutusV1>)[];
    plutusV2Scripts?: (ScriptJsonFormat<PlutusScriptVersion.V2> | Script<ScriptType.PlutusV2>)[];
}

function scriptArrToCbor( scripts: Script[] ): CborArray
{
    return new CborArray(
        scripts.map( script => new CborBytes( script.cbor ) )
    );
}

export default class AuxiliaryData
    implements IAuxiliaryData, ToCbor
{
    readonly metadata?: TxMetadata;
    readonly nativeScripts?: Script<ScriptType.NativeScript>[];
    readonly plutusV1Scripts?: Script<ScriptType.PlutusV1>[];
    readonly plutusV2Scripts?: Script<ScriptType.PlutusV2>[];

    readonly hash!: AuxiliaryDataHash

    constructor( auxData: IAuxiliaryData )
    {
        JsRuntime.assert(
            ObjectUtils.hasOwn( auxData, "metadata" ),
            "'AuxiliaryData' is missing 'metadata' field"
        );

        const {
            metadata,
            nativeScripts,
            plutusV1Scripts,
            plutusV2Scripts
        } = auxData;

        // -------------------------------- native scripts -------------------------------- //
        JsRuntime.assert(
            metadata === undefined || metadata instanceof TxMetadata,
            "'AuxiliaryData' :: 'metadata' field was not instance of 'TxMetadata'"
        );
        ObjectUtils.defineReadOnlyProperty(
            this,
            "metadata",
            metadata
        );

        // -------------------------------- native scripts -------------------------------- //
        if( nativeScripts !== undefined )
        {
            JsRuntime.assert(
                Array.isArray( nativeScripts ) &&
                nativeScripts.every( script => {

                    return true;
                }),
                "invalid nativeScripts field"
            );

            ObjectUtils.defineReadOnlyProperty(
                this,
                "nativeScripts",
                nativeScripts.length === 0 ? undefined : Object.freeze( nativeScripts )
            );
        }
        else
        {
            ObjectUtils.defineReadOnlyProperty(
                this,
                "nativeScripts",
                undefined
            );
        }

        // -------------------------------- plutus v1 -------------------------------- //
        if( plutusV1Scripts !== undefined )
        {
            JsRuntime.assert(
                Array.isArray( plutusV1Scripts ) &&
                plutusV1Scripts.every( script => {

                    return true;
                }),
                "invalid plutusV1Scripts field"
            );

            ObjectUtils.defineReadOnlyProperty(
                this,
                "plutusV1Scripts",
                plutusV1Scripts.length === 0 ? undefined : Object.freeze( plutusV1Scripts )
            );
        }
        else
        {
            ObjectUtils.defineReadOnlyProperty(
                this,
                "plutusV1Scripts",
                undefined
            );
        }

        // -------------------------------- plutus v2 -------------------------------- //
        if( plutusV2Scripts !== undefined )
        {
            JsRuntime.assert(
                Array.isArray( plutusV2Scripts ) &&
                plutusV2Scripts.every( script => {

                    return true;
                }),
                "invalid plutusV2Scripts field"
            );

            ObjectUtils.defineReadOnlyProperty(
                this,
                "plutusV2Scripts",
                plutusV2Scripts.length === 0 ? undefined : Object.freeze( plutusV2Scripts )
            );
        }
        else
        {
            ObjectUtils.defineReadOnlyProperty(
                this,
                "plutusV2Scripts",
                undefined
            );
        }

        // --------- hash ---- //
        let _hash: AuxiliaryDataHash = undefined as any;
        ObjectUtils.definePropertyIfNotPresent(
            this, "hash",
            {
                get: (): AuxiliaryDataHash => {
                    if( _hash instanceof AuxiliaryDataHash ) return _hash.clone();

                    _hash = new AuxiliaryDataHash(
                        Buffer.from(
                            blake2b_256( this.toCbor().asBytes )
                        )
                    );

                    return _hash.clone()
                },
                set: () => {},
                enumerable: true,
                configurable: false
            }
        );


    }
    
    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborTag
    {
        return new CborTag(
            259,
            new CborMap([
                this.metadata === undefined ?  undefined :
                {
                    k: new CborUInt( 0 ),
                    v: this.metadata.toCborObj()
                },
                this.nativeScripts === undefined || this.nativeScripts.length === 0 ? undefined :
                {
                    k: new CborUInt( 1 ),
                    v: scriptArrToCbor( this.nativeScripts )
                },
                this.plutusV1Scripts === undefined || this.plutusV1Scripts.length === 0 ? undefined :
                {
                    k: new CborUInt( 2 ),
                    v: scriptArrToCbor( this.plutusV1Scripts )
                },
                this.plutusV2Scripts === undefined || this.plutusV2Scripts.length === 0 ? undefined :
                {
                    k: new CborUInt( 2 ),
                    v: scriptArrToCbor( this.plutusV2Scripts )
                }
            ].filter( elem => elem !== undefined ) as CborMapEntry[])
        )
    }
}