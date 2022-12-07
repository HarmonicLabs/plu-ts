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
            Object.freeze( entry.assets );
            Object.freeze( entry.policy );
        });

        ObjectUtils.defineReadOnlyProperty(
            this,
            "map",
            Object.freeze( map )
        );
    }
}

export default Value;