import { anyStruct, DataConstructor, DataType, StructType, TermType } from ".";
import { StructCtorDef } from "../../PTypes/PStruct";
import { isAliasType, isDataType, isStructType, isTypeNameOfData, isTypeParam, isWellFormedType } from "./kinds";

export function dataTypeExtends<ExtendedDataTy extends DataType>( extending: DataType, extended: ExtendedDataTy ): extending is ExtendedDataTy
{
    if(!(
        isDataType( extended  ) &&
        isDataType( extending )
    )) return false;

    function unchecked( a: DataType, b: DataType ): boolean
    {
        if( b[ 0 ] === DataConstructor.Any ) return true;
        if( a[ 0 ] === DataConstructor.Any ) return false;

        const bTyArgs = b.slice( 1 ) as DataType[];
        return (
            a[ 0 ] === b[ 0 ] &&
            a.length === b.length &&
            ( a.slice( 1 ) as DataType[] ).every( (aTyArg, idx) => dataTypeExtends( aTyArg, bTyArgs[ idx ] ) )
        );
    }

    return unchecked( extending, extended );
}

/**
 * needed for
 * 
 * ```ctorDefExtends```
 * ```structExtends```
 * ```typeExtends```
 */
type TyParam = {
    tyVar: symbol
    tyArg: TermType
};

/**
 * 
 * @param a extending ctor
 * @param b extended ctor
 * @returns 
 */
function ctorDefExtends( a: StructCtorDef, b: StructCtorDef, subs: TyParam[] = [] ): boolean
{
    const aFields = Object.keys( a );
    const bFields = Object.keys( b );

    if( aFields.length !== bFields.length ) return false

    function findSym( tVar: symbol ): TyParam | undefined
    {
        return subs.find( pair => pair.tyVar === tVar )
    }

    for( let i = 0; i < aFields.length; i++ )
    {
        // fields have to have the same order;
        // oterwhise it would imply a different order in the `Data` onchain
        if( aFields[i] !== bFields[i] ) return false;
        const field = aFields[i];

        if( (typeof b[field][0]) === "symbol" )
        {
            const tyVar = b[field][0] as symbol;
            const tyArg = a[field];
            const thisTyParam = findSym( tyVar );

            if( thisTyParam === undefined )
            {
                subs.push({
                    tyVar: tyVar,
                    tyArg: tyArg
                });
                continue;
            }

            if( isTypeParam( tyArg[0] ) )
            {
                if( tyArg[0] === thisTyParam.tyArg[0] ) continue;
                else return false;
            }

            // type argument corresponding to type var doesn't match some of the argument previously found
            // covers case of generic 'tyArg'
            if( !typeExtends( tyArg, thisTyParam.tyArg, subs ) ) return false;

            if( !typeExtends( thisTyParam.tyArg, tyArg, subs ) )
            {
                // this type arument is more general than the previous registered
                thisTyParam.tyArg = tyArg;
                continue;
            }

            continue;
        }

        if( !typeExtends( a[ field ], b[ field ], subs ) ) return false
    }

    return true;
}

export function structExtends( t: TermType, struct: StructType, subs: TyParam[] = [] ): t is StructType
{
    if( isAliasType( t ) ) return structExtends( t[1].type, struct, subs );

    // should this throw?
    if( !isStructType( struct ) ) return false;
    
    if( !isStructType( t ) ) return false;

    if( struct[1] === anyStruct ) return true;
    if( t[1] === anyStruct ) return false;

    const sDef = struct[1];
    const ctorNames = Object.keys( sDef );

    const extendingDef = t[1];
    const extendingCtors = Object.keys( extendingDef );

    if( ctorNames.length !== extendingCtors.length ) return false;

    // first check the names only in order
    // not to do useless (potentially expensive)
    // ctor definiton extension checks
    for( let i = 0; i < ctorNames.length; i++ )
    {
        if(
            // ctors have to be in the same position; otherwhise is a different struct;
            ctorNames[i] !== extendingCtors[i]
        ) return false;
    }

    for( let i = 0; i < ctorNames.length; i++ )
    {
        if(
            // check for the same fields and the extending types to extend the given struct ones
            !ctorDefExtends(
                extendingDef[ extendingCtors[i] ],
                sDef[ ctorNames[i] ],
                subs
            )
        ) return false
    }

    return true;
}

/*
 * equivalent to ```A extends B``` but at plu-ts level
 */
export function typeExtends<ExtendedTy extends TermType>( extending: TermType, extended: ExtendedTy, subs: TyParam[] = [] ): extending is ExtendedTy
{
    if( isAliasType( extended ) )
    {
        return (
            isAliasType( extending )                        &&
            // same alias id
            extending[1].id === extended[1].id              &&
            typeExtends( extending[1].type, extended[1].type, subs )
        );
    }
    
    if( isAliasType( extending ) )
    {
        return typeExtends( extending[1].type, extended, subs );
    }

    if(!(
        isWellFormedType( extending ) &&
        isWellFormedType( extended  )
    )) return false;

    function findSym( tVar: symbol ): TyParam | undefined
    {
        return subs.find( pair => pair.tyVar === tVar )
    }

    function unchecked( a: TermType, b: TermType ): boolean
    {
        if( isStructType( b ) )
        {
            return structExtends( a, b, subs );
        }

        if( isTypeParam( b[0] ) )
        {
            if( b[0] === a[0] ) return true; // same symbol

            const thisTyParam = findSym( b[0] );
            
            // type paramteter never found before
            if( thisTyParam === undefined )
            {
                subs.push({
                    tyVar: b[0],
                    tyArg: a
                });
                return true;
            }

            // type parameter was found and is a parameter
            if( isTypeParam( thisTyParam.tyArg[0] ) )
            {
                // if this value is a parameter (just like the one found before)
                if( isTypeParam( a[0] ) )
                {
                    // make sure is the same paramter since
                    // is corresponding to the same paramter in the extended type ('b')
                    return a[0] === thisTyParam.tyArg[0];
                }
                // else should update with more specific one

                // check if previous type is still assignable to new (more specific) argument
                // return false if not, since the previous is too genreic
                if( !unchecked( thisTyParam.tyArg, a ) ) return false;
                
                // update with specific type
                thisTyParam.tyArg = a;
                return true;
            }

            // thisTyParam.tyArg is a fixed type
            return unchecked( a, thisTyParam.tyArg )
        }

        if( isTypeParam( a[0] ) ) return false;

        if( isTypeNameOfData( b[0] ) )
        {
            if( isStructType( a ) ) return b[0] === DataConstructor.Any || b[0] === DataConstructor.Constr;
            if( !isTypeNameOfData( a[0] ) ) return false;

            // checks for correct data type construction;
            // actually already checked in the ```isWellFormedType``` call above
            return dataTypeExtends( a as any, b as any );
        }

        const bTyArgs = b.slice(1) as TermType[];
        return (
            a[ 0 ] === b[ 0 ] &&
            // a.length === b.length && // not a check because of possible ```Type.Var()``` as type arguments
            ( a.slice( 1 ) as TermType[] ).every( (aTyArg, idx) => unchecked( aTyArg, bTyArgs[ idx ] ) )
        );
    }

    return unchecked( extending, extended );
}