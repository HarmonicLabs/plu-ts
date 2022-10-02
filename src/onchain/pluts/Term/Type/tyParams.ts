import Type, { TermTypeParameter, FixedTermType, TermType, PrimType } from ".";
import JsRuntime from "../../../../utils/JsRuntime";
import { typeExtends } from "./extension";
import { isTypeParam } from "./kinds";
import { termTypeToString } from "./utils";


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

    function unchecked( param: Readonly<TermTypeParameter>, toReplace: Readonly<FixedTermType>, toBeReplaced: Readonly<TermType> ): TermType
    {
        if( toBeReplaced[ 0 ] === param ) // 'symbol' equality
        {
            return toReplace; // replacing here
        }

        if( toBeReplaced.length === 1 ) return Object.freeze([ ...toBeReplaced ]);
        if( toBeReplaced.length === 2 )
        {
            if( toBeReplaced[ 0 ] === PrimType.List )
                return Type.List(
                    unchecked( param, toReplace, toBeReplaced[ 1 ] )
                );
            if( toBeReplaced[ 0 ] === PrimType.Delayed )
                return Type.Delayed(
                    unchecked( param, toReplace, toBeReplaced[ 1 ] )
                );
            
            throw JsRuntime.makeNotSupposedToHappenError(
                "unexpected type while replacing parameter, " +
                "'toBeReplaced' was expected to have one type argument " +
                "but none of the types that require one matched the type;" +
                "\n'toBeReplaced' was : " + toBeReplaced
            );
        }
        if( toBeReplaced.length === 3 )
        {
            if( toBeReplaced[ 0 ] === PrimType.Lambda )
                return Type.Lambda(
                    unchecked( param, toReplace, toBeReplaced[ 1 ] ),
                    unchecked( param, toReplace, toBeReplaced[ 2 ] )
                );
            if( toBeReplaced[ 0 ] === PrimType.Pair )
                return Type.Pair(
                    unchecked( param, toReplace, toBeReplaced[ 1 ] ),
                    unchecked( param, toReplace, toBeReplaced[ 2 ] )
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

type TySubsEntry = {
    tyVar: symbol
    tyArg: TermType
};

export function findSubsToRestrict( restriction: Readonly<TermType>, toBeRestricted: Readonly<TermType> ): TySubsEntry[] 
{
    /* checked in ```typeExtends```
    if(!(
        isWellFormedType( restriction ) &&
        isWellFormedType( toBeRestricted  )
    )) return undefined;
    */
    if( !typeExtends( restriction, toBeRestricted ) ) return [];

    const subs: TySubsEntry[] = [];

    function findSym( tVar: symbol ): TySubsEntry | undefined
    {
        return subs.find( pair => pair.tyVar === tVar )
    }

    function assignSub( k: symbol, value: TermType, tyPair: TySubsEntry | undefined = undefined ): void
    {
        const thisTyPair = tyPair !== undefined && tyPair.tyVar === k ? tyPair : findSym( k );

        if( thisTyPair !== undefined && !typeExtends( value, thisTyPair.tyArg ) )
        {
            console.log(
                termTypeToString(value) + " extends "
                + termTypeToString(thisTyPair.tyArg) + ": ",
                typeExtends( value, thisTyPair.tyArg )
            );

            throw JsRuntime.makeNotSupposedToHappenError(
                "sub type (" + termTypeToString( value ) + ") does not extends other subtype (" + termTypeToString( thisTyPair.tyArg ) + ") to be restircted; " +
                "this case suld have already returned 'undefined' at the initial check of 'restrictExtensionWith'"
            );
        }

        if( thisTyPair === undefined )
        {
            subs.push({
                tyVar: k,
                tyArg: value
            });
        }
        else if( typeExtends( thisTyPair.tyArg, value ) )
        {
            // this type arument is more general than the previous registered
            thisTyPair.tyArg = value;
        }
    }

    function findSubs( a: Readonly<TermType>, b: Readonly<TermType> ): void
    {
        if( isTypeParam( b[0] ) )
        {
            assignSub( b[0], a );
        }

        (b.slice(1) as TermType[])
        .forEach( (bTyArg, i) =>
            findSubs( a[ i + 1 ] as TermType, bTyArg )
        );
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
 