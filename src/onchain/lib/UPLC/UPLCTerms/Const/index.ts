import UPLCSerializable from "../../../../../serialization/flat/ineterfaces/UPLCSerializable";
import BinaryString from "../../../../../types/bits/BinaryString";
import BitStream from "../../../../../types/bits/BitStream";
import ByteString from "../../../../../types/HexString/ByteString";
import Integer, { UInteger } from "../../../../../types/ints/Integer";
import Pair from "../../../../../types/structs/Pair";
import JsRuntime from "../../../../../utils/JsRuntime";
import Data, { isData } from "../../Data";
import ConstType, { constTypeEq, constT, constTypeToStirng, ConstTyTag, isWellFormedConstType } from "./ConstType";
import ConstValue, { canConstValueBeOfConstType } from "./ConstValue";


export default class Const
    implements UPLCSerializable
{
    private static UPLCTag: BitStream = BitStream.fromBinStr(
        new BinaryString( "0100" )
    );

    private _type: ConstType

    get type(): ConstType
    {
        return this._type;
    }

    private _value: ConstValue

    get value(): ConstValue
    {
        return this._value;
    }

    private constructor( type: ConstType, value: Integer )
    private constructor( type: ConstType, value: ByteString )
    private constructor( type: ConstType, value: string )
    private constructor( type: ConstType, value?: undefined )
    private constructor( type: ConstType, value: boolean )
    private constructor( type: ConstType, value: ConstValue[] )
    private constructor( type: ConstType, value: Pair< ConstValue, ConstValue > )
    private constructor( type: ConstType, value: Data )
    private constructor(
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

    static int( int: Integer | number | bigint ): Const
    {
        // new Integer works for both number | bigint
        if( !(int instanceof Integer) )
        {
            // throws if Math.round( int ) !== int
            int = new Integer( int );
        }

        if( int instanceof UInteger )
        {
            int = int.toSigned();
        }

        return new Const( constT.int , int );
    }

    toUPLCBitStream(): BitStream
    {
        throw Error("not implemented");
    }
}