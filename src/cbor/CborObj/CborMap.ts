import CborObj, { cborObjFromRaw, RawCborObj } from ".";
import ObjectUtils from "../../utils/ObjectUtils";
import ToRawObj from "./interfaces/ToRawObj";

export type RawCborMapEntry = {
    k: RawCborObj,
    v: RawCborObj
};

export type RawCborMap = {
    map: RawCborMapEntry[]
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