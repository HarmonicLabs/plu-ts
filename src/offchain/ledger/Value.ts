import Cbor from "../../cbor/Cbor";
import CborObj from "../../cbor/CborObj";
import CborBytes from "../../cbor/CborObj/CborBytes";
import CborMap from "../../cbor/CborObj/CborMap";
import CborNegInt from "../../cbor/CborObj/CborNegInt";
import CborUInt from "../../cbor/CborObj/CborUInt";
import CborString from "../../cbor/CborString";
import { ToCbor } from "../../cbor/interfaces/CBORSerializable";
import JsRuntime from "../../utils/JsRuntime";
import ObjectUtils from "../../utils/ObjectUtils";
import Hash32 from "../hashes/Hash32/Hash32";


export type IValue = {
    policy: Hash32,
    assets: {
        [assetNameAscii: string]: number | bigint
    }
}[]

/**
 * extended ascii
 */
function isAscii( str: string ): boolean
{
    return (
        typeof str === "string" &&
        //char in range (0b0000_0000, 0b1111_1111)
        /^[\x00-\xFF]*$/.test(str)
    )
}

export class Value
    implements ToCbor
{
    readonly map!: IValue

    constructor( map: IValue )
    {
        JsRuntime.assert(
            Array.isArray( map ) &&
            map.every( entry => (
                ObjectUtils.hasOwn( entry, "assets" ) &&
                ObjectUtils.hasOwn( entry, "policy" ) &&
                entry.policy instanceof Hash32 &&
                (() => {
                    const assets = entry.assets;
                    const names = Object.keys( assets );

                    return names.every( name => (
                        isAscii( name ) &&
                        ((typeOfValue) => (typeOfValue === "number" || typeOfValue === "bigint")
                        )(typeof assets[name])
                    ));
                })()
            )),
            "invalid value interface passed to contruct a 'value' instance"
        );

        map.forEach( entry => {
            ObjectUtils.freezeAll( entry.assets );
            Object.freeze( entry.policy );
        });

        ObjectUtils.defineReadOnlyProperty(
            this,
            "map",
            Object.freeze( map )
        );
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
                return {
                    k: entry.policy.toCborObj(),
                    v: new CborMap(
                        Object.keys( assets ).map( assetNameAscii => {
                            const amt = assets[ assetNameAscii ];
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