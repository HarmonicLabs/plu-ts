import { isTypeParam } from "./kinds";
import { isTaggedAsAlias } from "./kinds/isTaggedAsAlias";
import { isGenericStructType, isSopType, isStructType, isWellFormedGenericType, isWellFormedType } from "./kinds/isWellFormedType";
import { getFstT, getSndT } from "./tyArgs";
import { unwrapAlias } from "./tyArgs/unwrapAlias";
import { GenericStructCtorDef, GenericStructDefinition, GenericTermType, PrimType, SopCtorDef, SopDefinition, StructCtorDef, StructDefinition, TermType, data } from "./types";
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

function isSymbol( stuff: any ): stuff is Symbol
{
    return typeof stuff === "symbol";
}
/**
 * 
 * @param a extending ctor
 * @param b extended ctor
 * @returns 
 */
function ctorDefExtends( a: SopCtorDef, b: SopCtorDef | GenericStructCtorDef, subs: TyParam[] = [] ): boolean
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

        if( isSymbol( b[field][0] ) )
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

            if( isSymbol( tyArg[0] ) )
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

export function sopDefExtends( extendingDef: SopDefinition, sDef: SopDefinition | GenericStructDefinition, subs: TyParam[] = [] ): boolean
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

    return uncheckedTypeExtends( extending, extended );
}

function uncheckedTypeExtends( a: TermType, b: GenericTermType ): boolean
{
    if( isTaggedAsAlias( b ) ) return uncheckedTypeExtends( a, unwrapAlias( b ) );
    if( isTaggedAsAlias( a ) ) return uncheckedTypeExtends( unwrapAlias( a ), b );

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
                uncheckedTypeExtends( a[1], b[1] )
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
                uncheckedTypeExtends(
                    getFstT(a),
                    getFstT(b)
                )
            )&&
            (
                uncheckedTypeExtends(
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
        // if( b[0] === PrimType.AsData ) return uncheckedTypeExtends( a[1], b[1] );
        return b[0] === PrimType.Struct;
    }

    if( b[0] === PrimType.Sop ) return isSopType( a ) && sopDefExtends( a[1], b[1] );
    if( a[0] === PrimType.Sop ) return false; // b must have been a SoP too

    if( b[0] === PrimType.Struct ) return isStructType( a ) && sopDefExtends( a[1], b[1] );

    // if a is a sturct but b is not
    // make sure b extends `data` at least
    if( isStructType( a ) ) return uncheckedTypeExtends( b as any, data );

    const bTyArgs = b.slice(1) as TermType[];
    const aTyArgs = a.slice(1) as TermType[];
    return (
        // any other prim type that requires parameters
        a[0] === b[0] &&
        // same n parameters
        aTyArgs.length === bTyArgs.length &&
        // must have correct parameters following
        aTyArgs.every( (aTyArg, idx) => {
            return uncheckedTypeExtends( aTyArg, bTyArgs[ idx ] )
        })
    );
}