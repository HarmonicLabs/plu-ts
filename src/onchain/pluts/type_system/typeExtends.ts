import { isTaggedAsAlias } from "./kinds/isTaggedAsAlias";
import { isGenericStructType, isStructType, isWellFormedGenericType, isWellFormedType } from "./kinds/isWellFormedType";
import { getFstT, getSndT } from "./tyArgs";
import { unwrapAlias } from "./tyArgs/unwrapAlias";
import { GenericStructCtorDef, GenericStructDefinition, GenericTermType, PrimType, StructCtorDef, StructDefinition, TermType, data } from "./types";
import { termTypeToString } from "./utils";


/**
 * needed for
 * 
 * ```ctorDefExtends```
 * ```structExtends```
 * ```typeExtends```
 */
type TyParam = {
    tyVar: symbol
    tyArg: GenericTermType
};

/**
 * 
 * @param a extending ctor
 * @param b extended ctor
 * @returns 
 */
function ctorDefExtends( a: StructCtorDef, b: GenericStructCtorDef, subs: TyParam[] = [] ): boolean
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

        if( typeof( b[field][0] ) === "symbol" )
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

            if( typeof( tyArg[0] ) === "symbol" )
            {
                if( tyArg[0] === thisTyParam.tyArg[0] ) continue;
                else return false;
            }

            // type argument corresponding to type var doesn't match some of the argument previously found
            // covers case of generic 'tyArg'
            if( !typeExtends( tyArg, thisTyParam.tyArg as any/*, subs */ ) ) return false;

            if( !typeExtends( thisTyParam.tyArg as any, tyArg/*, subs */ ) )
            {
                // this type arument is more general than the previous registered
                thisTyParam.tyArg = tyArg;
                continue;
            }

            continue;
        }

        if( !typeExtends( a[ field ], b[ field ] as any/*, subs */ ) ) return false
    }

    return true;
}

export function structDefExtends( extendingDef: StructDefinition, sDef: GenericStructDefinition, subs: TyParam[] = [] ): boolean
{
    const ctorNames = Object.keys( sDef );
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
export function typeExtends( extending: GenericTermType, extended: GenericTermType ): boolean
{
    if(!(
        isWellFormedType( extending ) &&
        isWellFormedGenericType( extended )
    )) return false;

    function unchecked( a: TermType, b: GenericTermType ): boolean
    {
        if( isTaggedAsAlias( b ) ) return unchecked( a, unwrapAlias( b ) );
        if( isTaggedAsAlias( a ) ) return unchecked( unwrapAlias( a ), b );

        if( typeof b[0] === "symbol" ) return true;

        if( b[0] === PrimType.Data )
        {
            return (
                a[0] === PrimType.Data   ||
                a[0] === PrimType.Struct ||
                a[0] === PrimType.AsData
            );
        }
        if( b[0] === PrimType.AsData )
        {
            return (
                (
                    a[0] === PrimType.AsData &&
                    unchecked( a[1], b[1] )
                ) ||
                a[0] === PrimType.Struct || 
                a[0] === PrimType.Data
            );
        }
        if( b[0] === PrimType.Pair )
        {
            // `getFstT` and `getSndT` unwraps `alias`es and `asData`s
            return (
                a[0] === PrimType.Pair &&
                (
                    unchecked(
                        getFstT(a),
                        getFstT(b)
                    )
                )&&
                (
                    unchecked(
                        getSndT(a),
                        getSndT(b)
                    )
                )
            )
        }
        if( a[0] === PrimType.AsData )
        {
            // checked above
            // if( b[0] === PrimType.Data ) return true;
            // if( b[0] === PrimType.AsData ) return unchecked( a[1], b[1] );
            return b[0] === PrimType.Struct;
        }

        if( isGenericStructType( b ) ) return isStructType( a ) && structDefExtends( a[1], b[1] );

        if( isStructType( a ) ) return unchecked( b as any, data );


        const bTyArgs = b.slice(1) as TermType[];
        return (
            a[0] === b[0] &&
            (a.slice(1) as TermType[]).every( (aTyArg, idx) => {
                return unchecked( aTyArg, bTyArgs[ idx ] )
            })
        )
    }

    return unchecked( extending, extended );
}