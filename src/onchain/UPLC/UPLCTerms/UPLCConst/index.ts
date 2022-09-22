import BinaryString from "../../../../types/bits/BinaryString";
import BitStream from "../../../../types/bits/BitStream";
import ByteString from "../../../../types/HexString/ByteString";
import Integer, { UInteger } from "../../../../types/ints/Integer";
import Pair from "../../../../types/structs/Pair";
import JsRuntime from "../../../../utils/JsRuntime";
import Data from "../../../../types/Data";
import ConstType, { constT, constTypeToStirng, isWellFormedConstType } from "./ConstType";
import ConstValue, { canConstValueBeOfConstType, ConstValueList } from "./ConstValue";


export default class UPLCConst
{
    static get UPLCTag(): BitStream
    {
        return BitStream.fromBinStr(
            new BinaryString( "0100" )
        );
    };

    private _type: ConstType

    get type(): ConstType
    {
        // clone
        return this._type.map( tag => tag ) as ConstType;
    }

    private _value: ConstValue

    get value(): ConstValue
    {
        return this._value;
    }

    constructor( type: ConstType, value: Integer )
    constructor( type: ConstType, value: ByteString )
    constructor( type: ConstType, value: string )
    constructor( type: ConstType, value?: undefined )
    constructor( type: ConstType, value: boolean )
    constructor( type: ConstType, value: ConstValueList )
    constructor( type: ConstType, value: Pair< ConstValue, ConstValue > )
    constructor( type: ConstType, value: Data )
    constructor(
        typeTag: ConstType,
        value: ConstValue
    )
    {
        JsRuntime.assert(
            isWellFormedConstType( typeTag ),
            "trying to construct an UPLC constant with an invalid type; input type: " + constTypeToStirng( typeTag )
        );

        JsRuntime.assert(
            canConstValueBeOfConstType( value, typeTag ),
            `trying to construct an UPLC constant with an invalid value for type "${constTypeToStirng( typeTag )}"; input value was: ${value?.toString()}`
        )
        
        this._type = typeTag;
        this._value = value;
    }

    // toUPLCBitStream( ctx: UPLCSerializationContex ): BitStream
    // {
    //     const constBitStream = UPLCConst.UPLCTag;
    //     
    //     constBitStream.append(
    //         encodeConstTypeToUPLCBitStream(
    //             this.type
    //         )
    //     );
// 
    //     ctx.updateWithBitStreamAppend( constBitStream );
// 
    //     const valueBitStream = encodeConstValueToUPLCBitStream(
    //         this.value,
    //         ctx
    //     );
// 
    //     constBitStream.append( valueBitStream );
// 
    //     ctx.updateWithBitStreamAppend( valueBitStream );
// 
    //     return constBitStream;
    // }
    
    static int( int: Integer | number | bigint ): UPLCConst
    {
        // new Integer works for both number | bigint
        if( !(int instanceof Integer) )
        {
            // throws if Math.round( int ) !== int
            int = new Integer( int );
        }

        if( int instanceof Integer )
        {
            if( !Integer.isStrictInstance( int ) )
            {
                int = (int as UInteger).toSigned();
            }
        }

        return new UPLCConst( constT.int , int );
    }

    static byteString( bs: ByteString ): UPLCConst
    {
        return new UPLCConst( constT.byteStr, bs );
    }

    static str( str: string ): UPLCConst
    {
        return new UPLCConst( constT.str, str );
    }

    static get unit(): UPLCConst
    {
        return new UPLCConst( constT.unit, undefined );
    }

    static bool( bool: boolean ): UPLCConst
    {
        return new UPLCConst( constT.bool, bool );
    }

    static listOf( typeArg: ConstType ): ( ( values: ConstValueList ) => UPLCConst )
    {
        return function ( values: ConstValueList ): UPLCConst
        {
            if( typeof values[0] === "number" || typeof values[0] === "bigint" )
                values = values.map( v => new Integer( v ) );
            return new UPLCConst( constT.listOf( typeArg ), values );
        };
    }

    static pairOf( typeArgFirst: ConstType, typeArgSecond: ConstType ): ( ( first: ConstValue, second: ConstValue ) => UPLCConst )
    {
        return function ( first: ConstValue, second: ConstValue ): UPLCConst
        {
            return new UPLCConst( constT.pairOf( typeArgFirst, typeArgSecond ), new Pair( first, second ) );
        };
    }

    static data( data: Data ): UPLCConst
    {
        return new UPLCConst( constT.data, data );
    }
}