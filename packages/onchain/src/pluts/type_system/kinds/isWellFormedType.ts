import { isObject } from "@harmoniclabs/obj-utils";
import { isBaseDataRepPrimType, isBasePrimType, isPrimTypeTag } from "./isPrimTypeTag";
import { isTaggedAsAlias } from "./isTaggedAsAlias";
import { isTypeParam } from "./isTypePAram";
import { GenericTermType, type Methods, PrimType, StructCtorDef, StructDefinition, StructT, TermType, DataRepTermType, GenericStructDefinition, SopDefinition, SopT } from "../types";
import { termTypeToString } from "../utils";
import { unwrapAlias } from "../tyArgs";


function getIsStructDefWithTermTypeCheck( termTypeCheck: ( t: TermType ) => boolean )
    : ( def: object ) => boolean
{
    return ( def: object ): boolean => {

        if( !isObject( def ) ) return false;
    
        const ctorsNames = Object.keys( def );
    
        // required at least one constructor
        if( ctorsNames.length <= 0 ) return false;
        
        if( !ctorsNames.every(
                // all constructor names
                ctorName =>
                    // cannot be empty
                    ctorName.length > 0 &&
                    // no white spaces
                    ctorName.replace(/\s/g, '') === ctorName &&
                    // cannot start with a number
                    Number.isNaN( parseFloat( ctorName[0] ) )
            )
        ) return false;
    
        for( let i = 0; i < ctorsNames.length; i++ )
        {
            const thisCtorFields = ( def as any)[ ctorsNames[i] ] as StructCtorDef;
            const thisCtorFieldsNames = Object.keys( thisCtorFields );
    
            if(
                !thisCtorFieldsNames.every(field => {
                    return termTypeCheck( thisCtorFields[ field ] );
                })
            ) return false;
        }
    
        return true;
    }
}

export const isSopDefinition = getIsStructDefWithTermTypeCheck(
    isWellFormedType
) as ( def: object ) => def is SopDefinition;

export const isStructDefinition = getIsStructDefWithTermTypeCheck(
    isWellFormedDataRepType
) as ( def: object ) => def is StructDefinition;

export const isGenericStructDefinition = getIsStructDefWithTermTypeCheck(
    isWellFormedGenericType
) as  ( def: object ) => def is GenericStructDefinition;


export function isSopType( t: GenericTermType ): t is SopT<SopDefinition, Methods>
{
    return (
        Array.isArray( t ) &&
        t.length >= 2 &&
        t[0] === PrimType.Sop &&
        isSopDefinition( t[1] )
    )
}

export function isStructType( t: GenericTermType ): t is StructT<StructDefinition, Methods>
{
    return (
        Array.isArray( t ) &&
        t.length >= 2 &&
        t[0] === PrimType.Struct &&
        isStructDefinition( t[1] )
    )
}

export function isGenericStructType( t: GenericTermType ): t is StructT<GenericStructDefinition>
{
    return (
        Array.isArray( t ) &&
        t.length >= 2 &&
        t[0] === PrimType.Struct &&
        isGenericStructDefinition( t[1] )
    )
}

export function isWellFormedType( t: GenericTermType ): t is TermType
{
    if( isTaggedAsAlias( t ) ) return isWellFormedType( t[1] as any );

    if(!( 
        Array.isArray( t ) &&
        t.length > 0
    )) return false;

    if( isTypeParam( t ) ) return false;

    const primTypeTag = t[0];

    if(!(
        isPrimTypeTag( primTypeTag )
    )) return false;

    // just base type
    if( t.length === 1 ) return isBasePrimType( primTypeTag );

    if(
        primTypeTag === PrimType.Delayed   ||
        primTypeTag === PrimType.AsData    ||
        primTypeTag === PrimType.List      ||
        // ??
        primTypeTag === PrimType.Alias
    ) return t.length >= 2 && isWellFormedType( t[1] as any );

    if( primTypeTag === PrimType.Struct )
    {
        return t.length >= 2 && isStructDefinition( t[1] );
    }

    if( primTypeTag === PrimType.Sop )
    {
        return t.length >= 2 && isSopDefinition( t[1] );
    }

    if(
        primTypeTag === PrimType.Lambda ||
        primTypeTag === PrimType.Pair
    ) return (
        t.length === 3 && 
        isWellFormedType( t[1] as any ) &&
        isWellFormedType( t[2] as any )
    );

    return false;
}

export function isWellFormedDataRepType( t: GenericTermType ): t is DataRepTermType
{
    if( isTaggedAsAlias( t ) ) return isWellFormedDataRepType( t[1] as any );

    if(!( 
        Array.isArray( t ) &&
        t.length > 0
    )) return false;

    if( isTypeParam( t ) ) return false;

    const primTypeTag = t[0];

    if(!(
        isPrimTypeTag( primTypeTag )
    )) return false;

    // just base type
    if( t.length === 1 ) return isBaseDataRepPrimType( primTypeTag );

    if( primTypeTag === PrimType.Delayed ) return false;

    if(
        primTypeTag === PrimType.List
    )
    {
        if( t.length < 2 ) return false;

        const elemsT = isTaggedAsAlias( t[1] ) ? unwrapAlias( t[1] ) : t[1];

        if( elemsT[0] === PrimType.Pair )
        {
            return (
                isWellFormedDataRepType( elemsT[1] ) &&
                isWellFormedDataRepType( elemsT[2] )
            )
        }
        else return isWellFormedDataRepType( elemsT )
    }

    if(
        primTypeTag === PrimType.AsData    ||
        // primTypeTag === PrimType.List      ||
        primTypeTag === PrimType.Alias
    ) return t.length >= 2 && isWellFormedDataRepType( t[1] as any );

    if(
        primTypeTag === PrimType.Struct ||
        primTypeTag === PrimType.Sop
    )
    {
        return t.length >= 2 && isStructDefinition( t[1] );
    }

    if( primTypeTag === PrimType.Pair )
    {
        return (
            isWellFormedDataRepType( t[1] ) &&
            isWellFormedDataRepType( t[2] )
        );
    }

    if(
        primTypeTag === PrimType.Lambda 
    ) return false;

    return false;
}

export function isWellFormedGenericType( t: GenericTermType ): boolean
{
    if( isTaggedAsAlias( t ) ) return isWellFormedGenericType( t[1] );

    if(!( 
        Array.isArray( t ) &&
        t.length > 0
    )) return false;

    if( isTypeParam( t ) ) return true;

    const primTypeTag = t[0];

    if(!(
        isPrimTypeTag( primTypeTag )
    )) return false;
    
    // just base type
    if( t.length === 1 ) return true;

    if(
        primTypeTag === PrimType.Delayed   ||
        primTypeTag === PrimType.AsData    ||
        primTypeTag === PrimType.List      ||
        // ??
        primTypeTag === PrimType.Alias
    ) return t.length >= 2 && isWellFormedGenericType( t[1] );

    if( primTypeTag === PrimType.Struct )
    {
        return t.length >= 2 && isGenericStructDefinition( t[1] );
    }

    if( primTypeTag === PrimType.Sop )
    {
        return t.length >= 2 && isSopDefinition( t[1] );
    }

    if(
        primTypeTag === PrimType.Lambda ||
        primTypeTag === PrimType.Pair
    )
    {
        const fst = isWellFormedGenericType( t[1] );
        const snd = isWellFormedGenericType( t[2] );

        if( !fst )
        {
            console.log( "fst", termTypeToString( t[1] ) );
        }
        if( !snd )
        {
            console.log( "snd", termTypeToString( t[2] ) );
        }

        return (
            t.length === 3 && 
            fst &&
            snd
        );
    }

    return false;
}
