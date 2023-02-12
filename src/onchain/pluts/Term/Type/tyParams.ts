import JsRuntime from "../../../../utils/JsRuntime";
import { Type, TermTypeParameter, FixedTermType, TermType, PrimType, anyStruct, struct, GenericStructDefinition, data } from "./base";
import { typeExtends } from "./extension";
import { isAliasType, isConstantableStructDefinition, isConstantableTermType, isStructType, isTypeParam } from "./kinds";
import { termTypeToString } from "./utils";
import { cloneStructDef } from "../../PTypes/PStruct/cloneStructDef";


/**
 * **pure**
 */
export function replaceTypeParam( tyParam: Readonly<TermTypeParameter> | [ Readonly<TermTypeParameter> ] , withTermType: Readonly<FixedTermType>, toBeReplacedIn: Readonly<TermType> ): TermType
{
    // JsRuntime.assert(
    //     isFixedType( withTermType ),
    //     "cannot replace a type paramter with a non fixed TermType"
    // );

    if( typeof tyParam !== "symbol" ) tyParam = tyParam[0];

    function unchecked( param: Readonly<TermTypeParameter>, replacement: Readonly<FixedTermType>, toBeReplaced: Readonly<TermType> ): TermType
    {
        if( typeExtends( toBeReplaced, data ) ) return toBeReplaced;
        if( isAliasType( toBeReplaced ) ) return unchecked( param, replacement, toBeReplaced[1].type );
        if( toBeReplaced[ 0 ] === param ) // 'symbol' equality
        {
            return replacement; // replacing here
        }

        if( toBeReplaced.length === 1 ) return Object.freeze([ ...toBeReplaced ]);
        if( toBeReplaced.length === 2 )
        {
            if( toBeReplaced[ 0 ] === PrimType.List )
                return Type.List(
                    unchecked( param, replacement, toBeReplaced[ 1 ] )
                );
            if( toBeReplaced[ 0 ] === PrimType.Delayed )
                return Type.Delayed(
                    unchecked( param, replacement, toBeReplaced[ 1 ] )
                );
            
            if( isStructType( toBeReplaced ) )
            {
                const _sDef = toBeReplaced[1];
                if( _sDef === anyStruct || isConstantableStructDefinition( _sDef ) ) return toBeReplaced;

                const sDef = cloneStructDef( _sDef );

                const ctors = Object.keys( sDef );

                for( let i = 0; i < ctors.length; i++ )
                {
                    const thisCtor = sDef[ ctors[i] ];
                    const fields = Object.keys( thisCtor );

                    for( let j = 0; j < fields.length; j++ )
                    {
                        const thisFieldName = fields[j];

                        thisCtor[ thisFieldName ] = unchecked( param, replacement, thisCtor[ thisFieldName ] ) as any;
                    }
                }

                return struct( sDef );
            }
            
            throw JsRuntime.makeNotSupposedToHappenError(
                "unexpected type while replacing parameter, " +
                "'toBeReplaced' was expected to have one type argument " +
                "but none of the types that may require type parameters matched the 'toBeReplacedType';" +
                "\n'toBeReplaced' was : " + termTypeToString( toBeReplaced )
            );
        }
        if( toBeReplaced.length === 3 )
        {
            if( toBeReplaced[ 0 ] === PrimType.Lambda )
                return Type.Lambda(
                    unchecked( param, replacement, toBeReplaced[ 1 ] ),
                    unchecked( param, replacement, toBeReplaced[ 2 ] )
                );
            if( toBeReplaced[ 0 ] === PrimType.Pair )
                return Type.Pair(
                    unchecked( param, replacement, toBeReplaced[ 1 ] ),
                    unchecked( param, replacement, toBeReplaced[ 2 ] )
                );
            if( toBeReplaced[ 0 ] === PrimType.PairAsData )
                return Type.PairAsData(
                    unchecked( param, replacement, toBeReplaced[ 1 ] ),
                    unchecked( param, replacement, toBeReplaced[ 2 ] )
                );

            throw JsRuntime.makeNotSupposedToHappenError(
                "unexpected type while replacing parameter, " +
                "'toBeReplaced' was expected to have two type argument " +
                "but none of the types that require two matched the type;" +
                "\n'toBeReplaced' was : " + toBeReplaced
            );
        }

        throw JsRuntime.makeNotSupposedToHappenError(
            "unexpected type while replacing parameter, " +
            "'toBeReplaced' required more than two type argumetns, " +
            "but none are defined so;" +
            "\n'toBeReplaced' was : " + toBeReplaced
        );
    }

    return unchecked( tyParam, withTermType, toBeReplacedIn );
}

type TyParam = {
    tyVar: symbol
    tyArg: TermType
};

export function findSubsToRestrict( restriction: Readonly<TermType>, toBeRestricted: Readonly<TermType> ): TyParam[] 
{
    /* checked in ```typeExtends```
    if(!(
        isWellFormedType( restriction ) &&
        isWellFormedType( toBeRestricted  )
    )) return undefined;

    ```isConstantableTermType``` covers all aliases too
    */
    if(
        isConstantableTermType( toBeRestricted ) ||
        !typeExtends( restriction, toBeRestricted )
    ) return [];

    const subs: TyParam[] = [];

    function findSym( tVar: symbol ): TyParam | undefined
    {
        return subs.find( pair => pair.tyVar === tVar )
    }

    function assignSub( k: symbol, value: TermType, tyParam: TyParam | undefined = undefined ): void
    {
        const thisTyParam =
            // previously found tyParam was passed
            tyParam !== undefined &&
            // AND the type variable corresponds to the symbol to substitute
            tyParam.tyVar === k ? tyParam : findSym( k );

        // tyParams could not be present, causing findSym to return undefined
        if( thisTyParam !== undefined && !typeExtends( value, thisTyParam.tyArg ) )
        {
            console.error(
                termTypeToString(value) + " extends "
                + termTypeToString(thisTyParam.tyArg) + ": ",
                typeExtends( value, thisTyParam.tyArg )
            );

            throw JsRuntime.makeNotSupposedToHappenError(
                "sub type (" + termTypeToString( value ) + ") does not extends other subtype (" + termTypeToString( thisTyParam.tyArg ) + ") to be restircted; " +
                "this case suld have already returned 'undefined' at the initial check of 'restrictExtensionWith'"
            );
        }

        if( thisTyParam === undefined )
        {
            subs.push({
                tyVar: k,
                tyArg: value
            });
        }
        else if( typeExtends( thisTyParam.tyArg, value ) )
        {
            // this type arument is more general than the previous registered
            thisTyParam.tyArg = value;
        }
    }

    function findSubs( a: Readonly<TermType>, b: Readonly<TermType> ): void
    {
        if( isTypeParam( b[0] ) )
        {
            assignSub( b[0], a );
        }

        if( isAliasType( b ) ) return;
        if( isStructType( b ) )
        {
            if( b[1] === anyStruct ) return;
            const _b = b[1] as GenericStructDefinition;
            // a extends b; so it must be the same or more specific struct
            const _a = a[1] as GenericStructDefinition;

            const ctors = Object.keys( _b );

            for( let i = 0; i < ctors.length; i++ )
            {
                const thisCtor = _b[ ctors[i] ];
                const fields = Object.keys( thisCtor );

                for( let j = 0; j < fields.length; j++ )
                {
                    const thisField_b = thisCtor[ fields[j] ];
                    const thisField_a = _a[ ctors[i] ][ fields[j] ];

                    findSubs( thisField_a, thisField_b );
                }
            }
        }
        else
        {
            (b.slice(1) as TermType[])
            .forEach( (bTyArg, i) => {
                findSubs( a[ i + 1 ] as TermType, bTyArg )
            });
        }
    }

    findSubs( restriction, toBeRestricted );

    return subs;
}

/**
 * **pure**
 * @param restriction 
 * @param toBeRestricted 
 * @returns {TermType | undefined} ```TermType | undefined```; the least generic type that can extend the ```restriction``` param;
 *  ```undefined``` if ```toBeRestricted``` is not an extension of ```restriction``` **OR**
 *  if the result would be MORE generic than the already generic type
 * 
 * @example
 * ```ts
 * restrictExtensionWith( Type.Int, Type.Var() ) // -> Type.Int
 * 
 * restrictExtensionWith(
 *      Type.Pair( Type.Int, Type.Var("something") ),
 *      Type.Pair( Type.Var("a"), Type.Var("b") )
 * ) // -> Type.Pair( Type.Int, Type.Var("some_other_b") )
 * 
 * restrictExtensionWith(
 *      Type.Pair( Type.Int, Type.Int ),
 *      Type.Pair( Type.Var("a"), Type.Var("b") )
 * ) // -> Type.Pair( Type.Int, Type.Int )
 * 
 * const same_a = Type.Var("same_a");
 * restrictExtensionWith(
 *      Type.Pair( Type.Int, Type.Any ),
 *      Type.Pair( same_a , same_a  )
 * ) // -> undefined
 * 
 * restrictExtensionWith(
 *      Type.Str,
 *      Type.Int
 * ) // -> undefined // first type cannot be assigned to the second
 * 
 * restrictExtensionWith(
 *      Type.Pair( Type.Int, Type.Any ),
 *      Type.Pair( Type.Int, Type.Int )
 * ) // -> undefined // first type cannot be assigned to the second
 * 
 * ```
 */
export function restrictExtensionWith( restriction: Readonly<TermType>, toBeRestricted: Readonly<TermType> ): TermType
{
    const subs = findSubsToRestrict( restriction, toBeRestricted );

    let result = toBeRestricted;
    for(const sub of subs)
    {
        result = replaceTypeParam( sub.tyVar, sub.tyArg as any, result );
    }

    return result;
}
 