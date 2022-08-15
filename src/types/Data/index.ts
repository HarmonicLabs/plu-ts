import JsRuntime from "../../utils/JsRuntime";
import ByteString from "../HexString/ByteString";
import Cloneable from "../interfaces/Cloneable";
import Integer, { CanBeUInteger, forceUInteger, UInteger } from "../ints/Integer";

type Data 
    = DataConstr
    | DataMap
    | DataList
    | DataI
    | DataB;

export default Data;

export function isData( something: Data ): boolean
{
    const proto = Object.getPrototypeOf( something );

    return (
        proto === DataConstr.prototype ||
        proto === DataMap.prototype    ||
        proto === DataList.prototype   ||
        proto === DataI.prototype      ||
        proto === DataB.prototype
    );
}

export class DataConstr
    implements Cloneable<DataConstr>
{
    private _constr: UInteger;
    get constr(): UInteger { return this._constr.clone() };

    private _fields: Data[]
    get fields(): Data[] { return this._fields.map( dataElem => dataElem.clone() ) };

    constructor( constr: CanBeUInteger, fields: Data[] )
    {
        JsRuntime.assert(
            fields.every( isData ),
            "invalid fields passed to constructor"
        );

        this._constr = forceUInteger( constr );
        this._fields = fields;
    }

    clone(): DataConstr
    {
        return new DataConstr(
            this._constr.clone(),
            this._fields.map( dataElem => dataElem.clone() )
        );
    }
}

export type DataPair = [Data,Data];

export class DataMap
    implements Cloneable<DataMap>
{
    private _map: DataPair[];
    get map(): DataPair[] { return this._map.map( pair => [ pair[0].clone(), pair[1].clone() ] ) };

    constructor( map: DataPair[] )
    {
        JsRuntime.assert(
            map.every( entry => {
                return (
                    Array.isArray( entry ) && entry.length === 2 &&
                    isData( entry[0] ) && isData( entry[1] )
                )
            }),
            "invalid map passed to constructor"
        );

        this._map = map;
    }

    clone(): DataMap
    {
        return new DataMap(
            this._map.map( pair => [ pair[0].clone(), pair[1].clone() ] )
        );
    }
}

export class DataList
    implements Cloneable<DataList>
{
    private _list: Data[]
    get list(): Data[] { return this._list.map( dataElem => dataElem.clone() ) };

    constructor( list: Data[] )
    {
        JsRuntime.assert(
            list.every( isData ),
            "invalid list passed to constructor"
        );

        this._list = list;
    }

    clone(): DataList
    {
        return new DataList(
            this._list.map( dataElem => dataElem.clone() )
        );
    }
}

export class DataI
    implements Cloneable<DataI>
{
    private _int: Integer
    get int(): Integer { return this._int.clone() }

    constructor( I: Integer | number )
    {
        if( typeof I === "number" )
        {
            I = new Integer( I );
        }

        this._int = I;
    }

    clone(): DataI
    {
        return new DataI( this._int.clone() );
    }
}

export class DataB
    implements Cloneable<DataB>
{
    private _bytes: ByteString
    get bytes(): ByteString { return this._bytes.clone() };

    constructor( B: ByteString )
    {
        JsRuntime.assert(
            ByteString.isStrictInstance( B ),
            "invalid ByteString provided while constructing 'DataB' instance"
        );

        this._bytes = B;
    }

    clone(): DataB
    {
        return new DataB( this._bytes.clone() );
    }
}