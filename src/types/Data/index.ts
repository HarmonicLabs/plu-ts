import ByteString from "../HexString/ByteString";
import Integer, { UInteger } from "../ints/Integer";

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
        something instanceof DataConstr ||
        something instanceof DataMap    ||
        something instanceof DataList   ||
        something instanceof DataI      ||
        something instanceof DataB
    );
}

export class DataConstr
{
    constructor( constr: UInteger, fileds: [Data] )
    {
        
    }
}

export type DataPair = [Data,Data];

export class DataMap
{
    constructor( map: DataPair[] )
    {
        
    }
}

export class DataList
{
    constructor( list: Data[] )
    {
        
    }
}

export class DataI
{
    constructor( I: Integer )
    {
        
    }
}

export class DataB
{
    constructor( B: ByteString )
    {
        
    }
}