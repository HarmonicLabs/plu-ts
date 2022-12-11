import Cbor from "../../../cbor/Cbor";
import CborBytes from "../../../cbor/CborObj/CborBytes";
import CborMap from "../../../cbor/CborObj/CborMap";
import CborNegInt from "../../../cbor/CborObj/CborNegInt";
import CborUInt from "../../../cbor/CborObj/CborUInt";
import CborString from "../../../cbor/CborString";
import { ToCbor } from "../../../cbor/interfaces/CBORSerializable";
import JsRuntime from "../../../utils/JsRuntime";
import ObjectUtils from "../../../utils/ObjectUtils";
import Hash32 from "../../hashes/Hash32/Hash32";
import { IValuePolicyEntry, IValueAdaEntry, isIValue, addIValues, subIValues } from "./IValue";

export type IValue = (IValuePolicyEntry | IValueAdaEntry)[]

function policyToString( policy: "" | Hash32 ): string
{
    return policy === "" ? policy : policy.asString;
}

export class Value
    implements ToCbor
{
    readonly map!: IValue

    constructor( map: IValue )
    {
        if(!isIValue( map )) console.log( map );
        
        JsRuntime.assert(
            isIValue( map ),
            "invalid value interface passed to contruct a 'value' instance"
        );

        map.forEach( entry => {

            const assets = entry.assets as any;

            ObjectUtils.freezeAll( assets );
            Object.freeze( entry.policy );
        });

        map.sort((a,b) => policyToString( a.policy ).localeCompare( policyToString( b.policy ) ) );

        ObjectUtils.defineReadOnlyProperty(
            this,
            "map",
            Object.freeze( map )
        );
    }

    static get zero(): Value
    {
        return new Value([]);
    }

    static isZero( v: Value ): boolean
    {
        return (
            v.map.length === 0 ||
            v.map.every(({ assets }) =>
                Object.keys( assets ).every( name =>
                    BigInt((assets as any)[name]) === BigInt(0) 
                ) 
            )
        )
    }

    static lovelaces( n: number | bigint ): Value
    {
        return new Value([{
            policy: "",
            assets: { "": typeof n === "number" ? Math.round( n ) : BigInt( n ) }
        }]);
    }

    static add( a: Value, b: Value ): Value
    {
        return new Value( addIValues( a.map, b.map ) );
    }

    static sub( a: Value, b: Value ): Value
    {
        return new Value( subIValues( a.map, b.map ) );
    }
    
    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() );
    }
    toCborObj(): CborMap
    {
        return new CborMap(
            this.map.map( entry => {
                const assets = entry.assets;
                const policy = entry.policy;
                return {
                    k: policy === "" ? new CborBytes(Buffer.from("","hex")) : policy.toCborObj(),
                    v: new CborMap(
                        Object.keys( assets ).map( assetNameAscii => {
                            const amt = (assets as any)[ assetNameAscii ];
                            return {
                                k: new CborBytes( Buffer.from( assetNameAscii, "ascii" ) ),
                                v: amt < 0 ? new CborNegInt( amt ) : new CborUInt( amt )
                            };
                        })
                    )
                };
            })
        );
    }
}

export default Value;
