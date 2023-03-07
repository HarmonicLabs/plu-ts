import JsRuntime from "../../../../../utils/JsRuntime";

import { ByteString } from "../../../../../types/HexString/ByteString";
import { Integer } from "../../../../../types/ints/Integer";
import { Pair } from "../../../../../types/structs/Pair";
import { Data, eqData, isData } from "../../../../../types/Data/Data";
import { ConstType, constTypeEq, constT, constTypeToStirng, ConstTyTag, isWellFormedConstType, constListTypeUtils, constPairTypeUtils } from "../ConstType";
import { uint8ArrayEq } from "../../../../../uint8Array";


export type ConstValueList
    = Integer[]
    | ByteString[]
    | string[]
    | undefined[]
    | ConstValueList[]
    | Pair<ConstValue,ConstValue>[]
    | Data[];

export type ConstValue
    = Integer 
    | ByteString 
    | string
    | undefined 
    | boolean
    | ConstValueList
    | Pair<ConstValue,ConstValue>
    | Data;

export function isConstValue( value: any ): value is ConstValue
{
    return (
        value === undefined                                                     ||
        (value instanceof Integer)        ||
        (value instanceof ByteString && ByteString.isStrictInstance( value ) )  ||
        typeof value === "string"                                               ||
        typeof value === "boolean"                                              ||
        isConstValueList( value )                                               ||
        (Pair.isStrictInstance( value ) &&
            isConstValue( value.fst ) && isConstValue( value.snd ))             ||
        ( !Pair.isStrictInstance(value) && isData( value ) )
    )
}

export function eqConstValue( a: ConstValue, b: ConstValue ): boolean
{
    if( a === undefined ) return b === undefined;

    if(!(
        isConstValue( a ) ||
        isConstValue( b )
    )) return false;

    if( a instanceof Integer ) return (
        b instanceof Integer &&
        a.asBigInt === b.asBigInt
    );
    if( a instanceof ByteString ) return (
        b instanceof ByteString &&
        uint8ArrayEq( a.toBuffer(), b.toBuffer() )
    );
    if( typeof a === "string" ) return (
        typeof b === "string" &&
        a === b
    );
    if( typeof a === "boolean" ) return (
        typeof b === "boolean" &&
        (a === b)
    );
    if( isData(a) ) return (
        isData( b ) && eqData( a, b )
    );
    if( a instanceof Pair ) return (
        b instanceof Pair &&
        eqConstValue( a.fst, b.fst ) &&
        eqConstValue( a.snd, b.snd )
    );
    if( Array.isArray( a ) ) return (
        Array.isArray( b ) &&
        a.length === b.length &&
        (a as any[]).every(( v: any, i ) => eqConstValue( v, b[i] ))
    );
    
    return false;
}

// mutually recursive on arrays (list values)
// inferConstTypeFromConstValue -> isConstValue -> isConstValueList (on list element) -> inferConstTypeFromConstValue
/**
 * 
 * @param val 
 * @returns the type of the ```ConstValue``` input ```undefined``` if it is not possible to infer the type ( eg. [] :: list ? )
 */
export function inferConstTypeFromConstValue( val: ConstValue ): (ConstType | undefined)
{
    JsRuntime.assert(
        isConstValue( val ),
        "'inferConstTypeFromConstValue' expects a valid 'ConstValue' type, input was: " + val
    )

    if( val === undefined ) return constT.unit;
    
    if( val instanceof Integer ) return constT.int;

    if( val instanceof ByteString && ByteString.isStrictInstance( val ) ) return constT.byteStr;

    if( typeof val === "string" ) return constT.str;

    if( typeof val === "boolean" ) return constT.bool;
    
    if( Array.isArray( val ) )
    {
        if( val.length === 0 ) return undefined;

        let firstElemTy: ConstType | undefined = undefined;

        for( let i = 0; i < val.length && firstElemTy === undefined; i++ )
        {
            firstElemTy = inferConstTypeFromConstValue(
                val[i]
            );
        }

        if( firstElemTy === undefined ) return undefined;

        JsRuntime.assert(
            (val as ConstValue[]).every(
                listElem => canConstValueBeOfConstType(
                    listElem,
                    firstElemTy as ConstType
                )
            ),
            "'inferConstTypeFromConstValue': incongruent elements of constant list"
        );

        return constT.listOf( firstElemTy );
    }

    if( val instanceof Pair && Pair.isStrictInstance( val ) )
    {
        const fstTy = inferConstTypeFromConstValue( val.fst );
        if( fstTy === undefined ) return undefined;
        
        const sndTy = inferConstTypeFromConstValue( val.snd );
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

export function canConstValueBeOfConstType( val: Readonly<ConstValue>, ty: Readonly<ConstType> ): boolean
{
    if( !isWellFormedConstType( ty ) ) return false;

    if( constTypeEq( ty, constT.unit ) )        return val === undefined;
    if( constTypeEq( ty, constT.bool ) )        return typeof val === "boolean";
    if( constTypeEq( ty, constT.byteStr ) )     return (val instanceof ByteString && ByteString.isStrictInstance( val ) );
    if( constTypeEq( ty, constT.data ) )        return val === undefined ? false : isData( val );
    if( constTypeEq( ty, constT.int ) )         return (val instanceof Integer);
    if( constTypeEq( ty, constT.str ) )         return typeof val === "string";
    if( ty[ 0 ] === ConstTyTag.list )
        return (
            Array.isArray( val ) && 
            (val as ConstValue[]).every( valueElement => 
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


export function isConstValueList( val: any ): val is ConstValueList
{
    if( !Array.isArray( val ) ) return false;
    
    // [] is a valid value for any list type
    if( val.length === 0 ) return true;

    let firstElemTy: ConstType | undefined = undefined;

    for( let i = 0; i < val.length && firstElemTy === undefined; i++ )
    {
        firstElemTy = inferConstTypeFromConstValue(
            val[i]
        );
    }
    
    function isArrayOfEmptyArray( arr: any[] ): boolean
    {
        if( !Array.isArray( arr ) ) return false;

        return arr.every(
            elem => Array.isArray( elem ) && elem.length === 0 || isArrayOfEmptyArray( elem )
        );
    }

    if( firstElemTy === undefined )
    {
        
        
        return isArrayOfEmptyArray( val );
    }

    return (val as ConstValue[]).every(
        listElem => canConstValueBeOfConstType(
            listElem,
            firstElemTy as ConstType
        )
    );
}



