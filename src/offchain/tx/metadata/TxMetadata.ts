import JsRuntime from "../../../utils/JsRuntime";
import ObjectUtils from "../../../utils/ObjectUtils";

import { CborString, CanBeCborString, forceCborString } from "../../../cbor/CborString";
import { ToCbor } from "../../../cbor/interfaces/CBORSerializable";
import { Cbor } from "../../../cbor/Cbor";
import { CborObj } from "../../../cbor/CborObj";
import { CborMap } from "../../../cbor/CborObj/CborMap";
import { CborUInt } from "../../../cbor/CborObj/CborUInt";
import { InvalidCborFormatError } from "../../../errors/InvalidCborFormatError";
import { ToJson } from "../../../utils/ts/ToJson";
import { TxMetadatum, isTxMetadatum, txMetadatumFromCborObj } from "./TxMetadatum";

export type ITxMetadata = {
    [metadatum_label: number | string]: TxMetadatum 
}

type ITxMetadataStr = { [metadatum_label: string]: TxMetadatum };

export class TxMetadata
    implements ToCbor, ToJson
{
    readonly metadata!: ITxMetadataStr;

    constructor( metadata: ITxMetadata )
    {
        const _metadata = {};
        
        Object.keys( metadata )
        .forEach( k =>

            ObjectUtils.defineReadOnlyProperty(
                _metadata,
                BigInt( k ).toString(),
                (() => {
                    const v = metadata[k];
                    JsRuntime.assert(
                        isTxMetadatum( v ),
                        "metatdatum with label " + k + " was not instace of 'TxMetadatum'"
                    );

                    return v;
                })()
            )

        );

        ObjectUtils.defineReadOnlyProperty(
            this,
            "metadata",
            _metadata
        );
    }
    
    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborObj
    {
        return new CborMap(
            Object.keys( this.metadata ).map( labelStr => {
                return {
                    k: new CborUInt( BigInt( labelStr ) ),
                    v: this.metadata[labelStr].toCborObj()
                }
            })
        )
    }

    static fromCbor( cStr: CanBeCborString ): TxMetadata
    {
        return TxMetadata.fromCborObj( Cbor.parse( forceCborString( cStr ) ) );
    }
    static fromCborObj( cObj: CborObj ): TxMetadata
    {
        if(!( cObj instanceof CborMap ))
        throw new InvalidCborFormatError("TxMetadata")

        const meta = {};
        const len = cObj.map.length;

        for( let i = 0; i < len; i++ )
        {
            const { k, v } = cObj.map[i];

            if(!( k instanceof CborUInt ))
            throw new InvalidCborFormatError("TxMetadata")

            ObjectUtils.defineReadOnlyProperty(
                meta, k.num.toString(), txMetadatumFromCborObj( v )
            )
        }

        return new TxMetadata( meta )
    }

    toJson()
    {
        const json = {}

        const ks = Object.keys( this.metadata );

        for(const k of ks)
        {
            ObjectUtils.defineReadOnlyProperty(
                json, k, this.metadata[k].toJson()
            )
        }

        return json as any;
    }
}