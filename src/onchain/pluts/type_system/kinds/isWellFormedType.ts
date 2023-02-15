import ObjectUtils from "../../../../utils/ObjectUtils";
import { GenericStructDefinition, GenericTermType, PrimType, StructCtorDef, StructDefinition, StructT, TermType } from "../types";
import { isPrimTypeTag } from "./isPrimTypeTag";
import { isTaggedAsAlias } from "./isTaggedAsAlias";
import { isTypeParam } from "./isTypePAram";


function getIsStructDefWithTermTypeCheck( termTypeCheck: ( t: TermType ) => boolean )
    : ( def: object ) => boolean
{
    return ( def: object ): boolean => {

        if( !ObjectUtils.isObject( def ) ) return false;
    
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

export const isStructDefinition = getIsStructDefWithTermTypeCheck(
    isWellFormedType
) as ( def: object ) => def is StructDefinition;

export const isGenericStructDefinition = getIsStructDefWithTermTypeCheck(
    isWellFormedGenericType
) as  ( def: object ) => def is GenericStructDefinition;


export function isStructType( t: GenericTermType ): t is StructT<StructDefinition>
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

    if(!(
        isPrimTypeTag( t[0] )
    )) return false;
    
    // just base type
    if( t.length === 1 ) return true;

    if(
        t[0] === PrimType.Delayed   ||
        t[0] === PrimType.AsData    ||
        t[0] === PrimType.List      ||
        // ??
        t[0] === PrimType.Alias
    ) return t.length === 2 && isWellFormedType( t[1] as any );

    if( t[0] === PrimType.Struct )
    {
        return t.length === 2 && isStructDefinition( t[1] );
    }

    if(
        t[0] === PrimType.Lambda ||
        t[0] === PrimType.Pair
    ) return (
        t.length === 3 && 
        isWellFormedType( t[1] as any ) &&
        isWellFormedType( t[2] as any )
    );

    return false;
}

export function isWellFormedGenericType( t: GenericTermType ): boolean
{
    if( isTaggedAsAlias( t ) ) return isWellFormedGenericType( t[1] as any );

    if(!( 
        Array.isArray( t ) &&
        t.length > 0
    )) return false;

    if( isTypeParam( t ) ) return true;

    if(!(
        isPrimTypeTag( t[0] )
    )) return false;
    
    // just base type
    if( t.length === 1 ) return true;

    if(
        t[0] === PrimType.Delayed   ||
        t[0] === PrimType.AsData    ||
        t[0] === PrimType.List      ||
        // ??
        t[0] === PrimType.Alias
    ) return t.length === 2 && isWellFormedGenericType( t[1] as any );

    if( t[0] === PrimType.Struct )
    {
        return t.length === 2 && isGenericStructDefinition( t[1] );
    }

    if(
        t[0] === PrimType.Lambda ||
        t[0] === PrimType.Pair
    ) return (
        t.length === 3 && 
        isWellFormedGenericType( t[1] as any ) &&
        isWellFormedGenericType( t[2] as any )
    );

    return false;
}
