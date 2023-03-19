import JsRuntime from "../../../../utils/JsRuntime";
import { BinaryString } from "../../../../types/bits/BinaryString";
import { BitStream } from "../../../../types/bits/BitStream";
import { ByteString } from "../../../../types/HexString/ByteString";
import { Pair } from "../../../../types/structs/Pair";
import { Data } from "../../../../types/Data/Data";
import { ConstType, constT, constTypeToStirng, isWellFormedConstType } from "./ConstType";
import { ConstValue, canConstValueBeOfConstType, ConstValueList, inferConstTypeFromConstValue, isConstValueInt } from "./ConstValue";
import { Cloneable } from "../../../../types/interfaces/Cloneable";


export class UPLCConst
    implements Cloneable<UPLCConst>
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

    constructor( type: ConstType, value: number | bigint )
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
            `trying to construct an UPLC constant with an invalid value for type "${constTypeToStirng( typeTag )}";
             input value was: ${value}`
        )
        
        this._type = typeTag;
        this._value = value;
    }

    clone(): UPLCConst
    {
        return new UPLCConst(
            this.type,
            this.value as any
        );
    }

    static int( int: number | bigint ): UPLCConst
    {
        // new Integer works for both number | bigint
        if( !isConstValueInt( int ) )
        {
            int = BigInt( int );
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
            return new UPLCConst( constT.listOf( typeArg ), values.map( n => BigInt( n as any ) ) );
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