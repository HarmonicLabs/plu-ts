import ByteString from "../../../../../types/HexString/ByteString";
import Integer, { UInteger } from "../../../../../types/ints/Integer";
import Pair from "../../../../../types/structs/Pair";
import Debug from "../../../../../utils/Debug";
import JsRuntime from "../../../../../utils/JsRuntime";
import Data, { isData } from "../../Data";
import ConstType, { constTypeEq, constT, constTypeToStirng, ConstTyTag, isWellFormedConstType, constListTypeUtils, constPairTypeUtils } from "./ConstType";


type ConstValue
    = Integer 
    | ByteString 
    | string
    | undefined 
    | boolean
    | ConstValue[]
    | Pair<ConstValue,ConstValue>
    | Data;

export default ConstValue;

/**
 * 
 * @param val 
 * @returns the type of the ```ConstValue``` input ```undefined``` if it is not possible to infer the type ( eg. [] :: list ? )
 */
export function inferConstTypeFromConstValue( val: ConstValue ): (ConstType | undefined)
{
    JsRuntime.assert(
        isConstValue(
            val
        ),
        "'inferConstTypeFromConstValue' expects a valid 'CoinstValue' type, input was: " + ( val?.toString() ?? "undefined" )
    )

    if( val === undefined ) return constT.unit;
    
    if( (val as any)[Symbol.toStringTag] === "Integer" ) return constT.int;

    if( (val as any)[Symbol.toStringTag] === "ByteString" ) return constT.byteStr;

    if( typeof val === "string" ) return constT.byteStr;

    if( typeof val === "boolean" ) return constT.bool;
    
    if( Array.isArray( val ) )
    {
        if( val.length === 0 ) return undefined;

        const firstElemTy = inferConstTypeFromConstValue(
            val[0]
        )

        if( firstElemTy === undefined ) return undefined;

        JsRuntime.assert(
            val.every(
                listElem => canConstValueBeOfConstType(
                    listElem,
                    firstElemTy
                )
            ),
            "'inferConstTypeFromConstValue': incongruent elements of constant list"
        );

        return constT.listOf( firstElemTy );
    }

    if( (val as any)[Symbol.toStringTag] === "Pair" )
    {
        const value = val as Pair< ConstValue, ConstValue >;

        const fstTy = inferConstTypeFromConstValue( value.fst );
        if( fstTy === undefined ) return undefined;
        
        const sndTy = inferConstTypeFromConstValue( value.snd );
        if( sndTy === undefined ) return undefined;

        return constT.pairOf( fstTy, sndTy );
    }

    if( isData( val ) ) return constT.data;

    throw JsRuntime.makeNotSupposedToHappenError(
        "'inferConstTypeFromConstValue' did not match any possible value"
    );
}

/**
 * same as ```inferConstTypeFromConstValue``` but with a default Type if it is not possible to infer
 */
export function inferConstTypeFromConstValueOrDefault( value: ConstValue, defaultTy: ConstType ): ConstType
{
    const inferredTy = inferConstTypeFromConstValue( value );
    
    if( inferredTy !== undefined )
    {
        return inferredTy;
    }

    // it was not possible to infer the value;

    // assert the provided default can actually have values
    JsRuntime.assert(
        isWellFormedConstType(
            defaultTy
        ),
        "the provided 'defaultTy' is not a well formed constant type; try using the exported 'constT' object to be sure it is well formed"
    );

    // assert the default type is ok for the provided value
    JsRuntime.assert(
        canConstValueBeOfConstType(
            value,
            defaultTy
        ),
        "the provided default ConstType is not adeguate for the provided ConstValue, given inputs: [ " +
        (value?.toString() ?? "undefined") + " , " +
        constTypeToStirng( defaultTy ) + " ]"
    );

    return defaultTy;
}

export function canConstValueBeOfConstType( val: ConstValue, ty: ConstType ): boolean
{
    if( !isWellFormedConstType( ty ) ) return false;

    if( constTypeEq( ty, constT.unit ) )        return val === undefined;
    if( constTypeEq( ty, constT.bool ) )        return typeof val === "boolean";
    if( constTypeEq( ty, constT.byteStr ) )     return (val instanceof ByteString && ByteString.isStrictInstance( val ) );
    if( constTypeEq( ty, constT.data ) )        return val === undefined ? false : isData( val );
    if( constTypeEq( ty, constT.int ) )         return (val instanceof Integer && Integer.isStrictInstance( val ) );
    if( constTypeEq( ty, constT.str ) )         return typeof val === "string";
    if( ty[ 0 ] === ConstTyTag.list )
        return (
            Array.isArray( val ) && 
            val.every( valueElement => 
                canConstValueBeOfConstType(
                    valueElement,
                    constListTypeUtils.getTypeArgument( ty as [ ConstTyTag.list, ...ConstType ] ) 
                )
            )
        );
    if( ty[0] === ConstTyTag.pair )
        return (
            val instanceof Pair && Pair.isStrictInstance( val ) &&
            canConstValueBeOfConstType( val.fst, constPairTypeUtils.getFirstTypeArgument( ty ) ) &&
            canConstValueBeOfConstType( val.snd, constPairTypeUtils.getSecondTypeArgument( ty ) )
        );
    
    throw JsRuntime.makeNotSupposedToHappenError(
        "'canConstValueBeOfConstType' did not match any type tag"
    );
}


export function isConstValueList( val: ConstValue  ): boolean
{
    if( !Array.isArray( val ) ) return false;
    
    // [] is a valid value for any list type
    if( val.length === 0 ) return true;

    let firstElemTy: ConstType | undefined = undefined;

    for( let i = 0; i < val.length && firstElemTy === undefined; i++ )
    {
        firstElemTy = inferConstTypeFromConstValue(
            val[0]
        );
    }

    if( firstElemTy === undefined )
    {
        return val.every(
            elem => Array.isArray( elem ) && elem.length === 0
        );
    }

    return val.every(
        listElem => canConstValueBeOfConstType(
            listElem,
            firstElemTy as ConstType
        )
    );
}

export function isConstValue( value: ConstValue ): boolean
{
    const val = value as any;

    return (
        val === undefined                                                   ||
        (val instanceof Integer && Integer.isStrictInstance( val ) )        ||
        (val instanceof ByteString && ByteString.isStrictInstance( val ) )  ||
        typeof val === "string"                                             ||
        typeof val === "boolean"                                            ||
        isConstValueList( val )                                             ||
        (val instanceof Pair && Pair.isStrictInstance( val ))               ||
        isData( val )
    )
}

