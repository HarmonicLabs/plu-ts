import { CborObj, cborObjFromRaw, isRawCborObj, RawCborObj } from ".";
import { Cloneable } from "../../types/interfaces/Cloneable";
import ObjectUtils from "../../utils/ObjectUtils";
import { ToRawObj } from "./interfaces/ToRawObj";

export interface CborMapOptions {
    indefinite?: boolean
}

const defaultOpts: Required<CborMapOptions> = Object.freeze({
    indefinite: false
})

export type RawCborMapEntry = {
    k: RawCborObj,
    v: RawCborObj
};

export type RawCborMap = {
    map: RawCborMapEntry[],
    options?: CborMapOptions
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

export class CborMap
    implements ToRawObj, Cloneable<CborMap>
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
    
    readonly indefinite!: boolean;

    constructor( map: CborMapEntry[], options?: CborMapOptions )
    {
        this._map = map;

        const {
            indefinite
        } = {
            ...defaultOpts,
            ...options
        };

        ObjectUtils.defineReadOnlyProperty(
            this, "indefinite", Boolean( indefinite )
        );
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
                }),
            options : {
                indefinite: this.indefinite
            }
        };
    }

    clone(): CborMap
    {
        return new CborMap(
            this.map,
            {
                indefinite: this.indefinite
            }
        );
    }
}