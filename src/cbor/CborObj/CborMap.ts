import CborObj, { cborObjFromRaw, isRawCborObj, RawCborObj } from ".";
import ObjectUtils from "../../utils/ObjectUtils";
import ToRawObj from "./interfaces/ToRawObj";

export type RawCborMapEntry = {
    k: RawCborObj,
    v: RawCborObj
};

export type RawCborMap = {
    map: RawCborMapEntry[]
}

export function isRawCborMap( m: RawCborMap ): boolean
{
    if( typeof m !== "object" ) return false;

    const keys = Object.keys( m );

    return (
        keys.length === 1 &&
        keys[0] === "map" &&
        Array.isArray( m.map ) &&
        m.map.every( entry => {
            if( typeof entry !== "object" ) return false;

            const entryKeys = Object.keys( entry ); 
            
            return (
                entryKeys.length === 2      &&
                entryKeys.includes( "k" )   &&
                isRawCborObj( entry.k )     &&
                entryKeys.includes( "v" )   &&
                isRawCborObj( entry.v )
            );
        } )
    );
}

export type CborMapEntry = {
    k: CborObj,
    v: CborObj
};

export default class CborMap
    implements ToRawObj
{
    private _map : CborMapEntry[];
    public get map() : CborMapEntry[]
    {
        return this._map
            .map( entry => {
                return {
                    k: cborObjFromRaw( entry.k.toRawObj() ),
                    v: cborObjFromRaw( entry.v.toRawObj() )
                }
            });
    }
    
    constructor( map: CborMapEntry[] )
    {
        this._map = map;
    }

    toRawObj(): RawCborMap
    {
        return {
            map: this._map
                .map( entry => {
                    return {
                        k: entry.k.toRawObj(),
                        v: entry.v.toRawObj()
                    };
                })
        };
    }
}