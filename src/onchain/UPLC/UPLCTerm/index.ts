import JsRuntime from "../../../utils/JsRuntime";
import { UPLCVar } from "../UPLCTerms/UPLCVar";
import { Delay } from "../UPLCTerms/Delay";
import { Lambda } from "../UPLCTerms/Lambda";
import { Application } from "../UPLCTerms/Application";
import { UPLCConst } from "../UPLCTerms/UPLCConst";
import { Force } from "../UPLCTerms/Force";
import { ErrorUPLC } from "../UPLCTerms/ErrorUPLC";
import { Builtin } from "../UPLCTerms/Builtin";
import { HoistedUPLC } from "../UPLCTerms/HoistedUPLC";
import { ConstType, constListTypeUtils, constPairTypeUtils, constTypeEq, constTypeToStirng, ConstTyTag } from "../UPLCTerms/UPLCConst/ConstType";
import { builtinTagToString, getNRequiredForces } from "../UPLCTerms/Builtin/UPLCBuiltinTag";
import { ConstValue } from "../UPLCTerms/UPLCConst/ConstValue";
import { Integer } from "../../../types/ints/Integer";
import { ByteString } from "../../../types/HexString/ByteString";
import { isData } from "../../../types/Data/Data";
import { dataToCbor } from "../../../types/Data/toCbor";
import { Pair } from "../../../types/structs/Pair";
import { replaceHoistedTermsInplace } from "../UPLCEncoder";

export type PureUPLCTerm 
    = UPLCVar
    | Delay
    | Lambda
    | Application
    | UPLCConst
    | Force
    | ErrorUPLC
    | Builtin;
    
export type UPLCTerm
    = PureUPLCTerm
    // not part of specification
    | HoistedUPLC; // replaced by a UPLCVar pointing to the term hoisted

/**
 * **_O(1)_**
 * @param {UPLCTerm} t ```UPLCTerm``` to check 
 * @returns {boolean} ```true``` if the argument is instance of any of the ```UPLCTerm``` constructors, ```false``` otherwise
 */
export function isUPLCTerm( t: UPLCTerm ): t is UPLCTerm
{
    const proto = Object.getPrototypeOf( t );

    // only strict instances
    return (
        proto === UPLCVar.prototype        ||
        proto === Delay.prototype          ||
        proto === Lambda.prototype         ||
        proto === Application.prototype    ||
        proto === UPLCConst.prototype      ||
        proto === Force.prototype          ||
        proto === ErrorUPLC.prototype      ||
        proto === Builtin.prototype        ||
        proto === HoistedUPLC.prototype
    );
}

/**
 * **_O(n)_**
 * @param {UPLCTerm} t ```UPLCTerm``` to check 
 * @returns {boolean} ```true``` if the AST contains only plutus-core terms, ```false``` otherwise
 */
export function isPureUPLCTerm( t: UPLCTerm ): t is PureUPLCTerm
{
    if( !isUPLCTerm( t ) ) return false;

    if( t instanceof UPLCVar )      return true;
    if( t instanceof Delay )        return isPureUPLCTerm( t.delayedTerm );
    if( t instanceof Lambda )       return isPureUPLCTerm( t.body );
    if( t instanceof Application )  return ( isPureUPLCTerm( t.argTerm ) && isPureUPLCTerm( t.funcTerm ) );
    if( t instanceof UPLCConst )    return true;
    if( t instanceof Force )        return isPureUPLCTerm( t.termToForce );
    if( t instanceof ErrorUPLC )    return true;
    if( t instanceof Builtin )      return true;
    if( t instanceof HoistedUPLC )  return false;

    return false;
}

export function isClosedTerm( term: UPLCTerm ): boolean
{
    function _isClosedTerm( maxDeBruijn: bigint, t: UPLCTerm ): boolean
    {
        JsRuntime.assert(
            isUPLCTerm( t ),
            "'isClosedTerm' functions only works on **raw** UPLCTerms"
        );

        if( t instanceof UPLCVar )
            // deBruijn variables are 0 indexed (as arrays)
            return maxDeBruijn > t.deBruijn.asBigInt;

        else if( t instanceof Delay )
            return _isClosedTerm( maxDeBruijn , t.delayedTerm );
        
        else if( t instanceof Lambda )
            // increment max debruijn
            return _isClosedTerm( maxDeBruijn + BigInt( 1 ), t.body );

        else if( t instanceof Application )
            return _isClosedTerm( maxDeBruijn , t.funcTerm ) && _isClosedTerm( maxDeBruijn , t.argTerm )
        
        else if( t instanceof UPLCConst )
            // `UPLCConst` has no variables in it, ence always closed
            return true;
        
        else if( t instanceof Force )
            return _isClosedTerm( maxDeBruijn, t.termToForce );

        else if( t instanceof ErrorUPLC )
            // `ErrorUPLC` has no variables in it, ence always closed
            return true;

        else if( t instanceof Builtin )
            // builtin per-se is just the function (ence a valid value),
            // arguments are passed using the `Apply` Term
            // so it is the `t instanceof Apply` case job
            // to be sure the arguments are closed
            return true;
        else if( t instanceof HoistedUPLC )
            // in order to hoist a trem it has to be closed;
            // the condition is checked in the constructor (kinda mutually recursive).
            return true;
        else
            throw JsRuntime.makeNotSupposedToHappenError(
                "unexpected execution flow in 'isClodeTerm'; all possibilieties should have already been handled; input term is: " + (t as any).toString()
            )

    }

    return _isClosedTerm( BigInt( 0 ) , term );
}

export function showUPLCConstValue( v: ConstValue ): string
{
    if( v === undefined ) return "()";
    if( v instanceof Integer ) return v.asBigInt.toString();
    if( typeof v === "string" ) return `"${v}"`;
    if( typeof v === "boolean" )  return v ? "True" : "False";
    if( v instanceof ByteString ) return "#" + v.toString();
    if( isData( v ) ) return "#" + dataToCbor( v ).toString();
    if( Array.isArray( v ) ) return "[" + v.map( showUPLCConstValue ).join(',') + "]";
    if( v instanceof Pair ) return `(${showUPLCConstValue(v.fst)},${showUPLCConstValue(v.snd)})`;
    
    throw JsRuntime.makeNotSupposedToHappenError(
        "'showUPLCConstValue' did not matched any possible constant value"
    );
}

export function showConstType( t: ConstType ): string
{
    if( t[0] === ConstTyTag.list )
    {
        return `list( ${showConstType( constListTypeUtils.getTypeArgument( t as any ) )} )`;
    }
    if( t[0] === ConstTyTag.pair )
    {
        return `pair( ${
            showConstType( 
                constPairTypeUtils.getFirstTypeArgument( t as any ) 
            )
        }, ${
            showConstType( 
                constPairTypeUtils.getSecondTypeArgument( t as any )
            )
        } )`;
    }

    return constTypeToStirng( t );
}

export function showUPLC( term: UPLCTerm ): string
{
    const vars = "abcdefghilmopqrstuvzwxyjkABCDEFGHILJMNOPQRSTUVZWXYJK".split('');

    function getVarNameForDbn( dbn: number ): string
    {
        if( dbn < 0 ) return `(${dbn})`;
        if( dbn < vars.length ) return vars[ dbn ];
        return vars[ Math.floor( dbn / vars.length ) ] + getVarNameForDbn( dbn - vars.length )
    }

    function loop( t: UPLCTerm, dbn: number ): string
    {
        if( t instanceof UPLCVar )
        {
            return getVarNameForDbn( dbn - 1 - Number( t.deBruijn.asBigInt ) )
        }
        if( t instanceof Delay ) return `(delay ${ loop( t.delayedTerm, dbn ) })`;
        if( t instanceof Lambda ) 
        {
            return `(lam ${getVarNameForDbn( dbn )} ${ loop( t.body, dbn + 1 ) })`;
        }
        if( t instanceof Application ) return `[${ loop( t.funcTerm, dbn ) } ${ loop( t.argTerm, dbn ) }]`;
        if( t instanceof UPLCConst ) return `( con ${showConstType(t.type)} ${ showUPLCConstValue( t.value ) } )`;
        if( t instanceof Force ) return `(force ${ loop( t.termToForce, dbn ) })`;
        if( t instanceof ErrorUPLC ) return "(error)";
        if( t instanceof Builtin )
        {
            const nForces = getNRequiredForces( t.tag );
    
            return "(force ".repeat( nForces ) +`(builtin ${builtinTagToString( t.tag )})` + ')'.repeat( nForces )
        }
        if( t instanceof HoistedUPLC ) return loop( t.UPLC, dbn )
        
        return "";
    }

    return loop(
        replaceHoistedTermsInplace( term.clone() ),
        0
    );

}

function isVarImSearchingFor( uplcVar: UPLCTerm, dbn: bigint ): boolean
{
    return uplcVar instanceof UPLCVar && uplcVar.deBruijn.asBigInt === dbn;
}

/**
 * 
 * @param {number | bigint} varDeBruijn ```number | bigint```; debruijn level (at the term level) of the variable to search for
 * @param {UPLCTerm} t ```UPLCTerm``` to search in
 * @returns {boolean} ```true``` if the variable has **at least** 1 or more references; ```false``` otherwise 
 */
export function hasAnyRefsInTerm( varDeBruijn: number | bigint, t: UPLCTerm ): boolean
{
    JsRuntime.assert(
        isUPLCTerm( t ),
        "'getUPLCVarRefsInTerm' expects an UPLCTerms"
    );

    const dbn = BigInt( varDeBruijn );

    if( t instanceof UPLCVar )      return t.deBruijn.asBigInt === dbn;
    if( t instanceof Delay )        return hasAnyRefsInTerm( dbn, t.delayedTerm );
    if( t instanceof Lambda )       return hasAnyRefsInTerm( dbn + BigInt(1), t.body );
    if( t instanceof Application )  return hasAnyRefsInTerm( dbn, t.funcTerm ) || hasAnyRefsInTerm( dbn, t.argTerm );
    if( t instanceof UPLCConst )    return false;
    if( t instanceof Force )        return hasAnyRefsInTerm( dbn, t.termToForce );
    if( t instanceof ErrorUPLC )    return false;
    if( t instanceof Builtin )      return false
    // hoisted terms are closed, ence do not have references to external variables for sure
    if( t instanceof HoistedUPLC )  return false;

    throw JsRuntime.makeNotSupposedToHappenError(
        "'hasAnyRefsInTerm' did not matched any possible 'UPLCTerm' constructor"
    );
}

/**
 * 
 * @param {number | bigint} varDeBruijn ```number | bigint```; debruijn level (at the term level) of the variable to search for
 * @param {UPLCTerm} term ```UPLCTerm``` to search in
 * @returns {boolean} ```true``` if the variable has 2 or more references; ```false``` otherwise 
 */
export function hasMultipleRefsInTerm( varDeBruijn: number | bigint, t: Readonly<UPLCTerm> ): boolean
{
    JsRuntime.assert(
        isUPLCTerm( t ),
        "'getUPLCVarRefsInTerm' expects an UPLCTerms"
    );

    const dbn = BigInt( varDeBruijn );

    if( t instanceof UPLCVar )      return false; // single ref; case of multple refs is handled in 'Application' using 'hasAnyRefsInTerm'
    if( t instanceof Delay )        return hasMultipleRefsInTerm( dbn, t.delayedTerm );
    if( t instanceof Lambda )       return hasMultipleRefsInTerm( dbn + BigInt(1), t.body );
    if( t instanceof Application ) 
        return (
            ( hasAnyRefsInTerm( dbn, t.funcTerm ) && hasAnyRefsInTerm( dbn, t.argTerm ) )   ||  // referenced at least once in both terms
            hasMultipleRefsInTerm( dbn, t.funcTerm )                                        ||  // referenced multiple times in func 
            hasMultipleRefsInTerm( dbn, t.argTerm )                                             // referenced multiple times in arg
        );
    if( t instanceof UPLCConst )    return false;
    if( t instanceof Force )        return hasMultipleRefsInTerm( dbn, t.termToForce )
    if( t instanceof ErrorUPLC )    return false;
    if( t instanceof Builtin )      return false;
    // hoisted terms are closed, ence do not have references to external variables for sure
    if( t instanceof HoistedUPLC )  return false;;

    throw JsRuntime.makeNotSupposedToHappenError(
        "getUPLCVarRefsInTerm did not matched any possible 'UPLCTerm' constructor"
    );
}

/**
 * 
 * @param {number | bigint} varDeBruijn ```number | bigint```; debruijn level (at the term level) of the variable to search for
 * @param {UPLCTerm} term ```UPLCTerm``` to search in
 * @returns {number} number of references to the variable
 */
export function getUPLCVarRefsInTerm( term: UPLCTerm, varDeBruijn: number | bigint = 0 ): number
{
    function _getUPLCVarRefsInTerm( dbn: bigint, t: UPLCTerm, countedUntilNow: number ): number
    {
        JsRuntime.assert(
            isUPLCTerm( t ),
            "'getUPLCVarRefsInTerm' expects an UPLCTerms"
        );

        if( t instanceof UPLCVar )      return countedUntilNow + (t.deBruijn.asBigInt === dbn ? 1 : 0);
        if( t instanceof Delay )        return _getUPLCVarRefsInTerm( dbn, t.delayedTerm, countedUntilNow );
        if( t instanceof Lambda )       return _getUPLCVarRefsInTerm( dbn + BigInt( 1 ) , t.body, countedUntilNow );
        if( t instanceof Application )  return _getUPLCVarRefsInTerm( dbn , t.funcTerm, countedUntilNow ) + _getUPLCVarRefsInTerm( dbn , t.argTerm, countedUntilNow );
        if( t instanceof UPLCConst )    return countedUntilNow;
        if( t instanceof Force )        return _getUPLCVarRefsInTerm( dbn, t.termToForce, countedUntilNow );
        if( t instanceof ErrorUPLC )    return countedUntilNow;
        if( t instanceof Builtin )      return countedUntilNow;
        // hoisted terms are closed, ence do not have references to external variables for sure
        if( t instanceof HoistedUPLC )  return countedUntilNow;

        throw JsRuntime.makeNotSupposedToHappenError(
            "getUPLCVarRefsInTerm did not matched any possible 'UPLCTerm' constructor"
        );
    }

    return _getUPLCVarRefsInTerm( BigInt( varDeBruijn ), term, 0 );
}

export function getHoistedTerms( t: Readonly<UPLCTerm> ): HoistedUPLC[]
{
    if( !isUPLCTerm( t ) ) return [];

    /*
    ```Application``` adds sub terms dependecies
    ```HoistedUPLC``` adds itself and it's own dependecies if any
    */

    if( t instanceof UPLCVar )      return [];
    if( t instanceof Delay )        return getHoistedTerms( t.delayedTerm );
    if( t instanceof Lambda )       return getHoistedTerms( t.body );
    if( t instanceof Application )  return [ ...getHoistedTerms( t.argTerm ), ...getHoistedTerms( t.funcTerm ) ];
    if( t instanceof UPLCConst )    return [];
    if( t instanceof Force )        return getHoistedTerms( t.termToForce );
    if( t instanceof ErrorUPLC )    return [];
    if( t instanceof Builtin )      return [];
    if( t instanceof HoistedUPLC )  return [ ...t.dependencies.map( dep => dep.clone() ), t.clone() ];

    return [];
}

/* experimental: getHoistedTermsAndRefs

type HoistedRef = {
    compiled: BitStream,
    number: number
};

type HoistedRefs = HoistedRef[]

function mergeRefs( a: HoistedRefs, b: HoistedRefs ): HoistedRefs
{
    const aCompiled = a.map( ref => ref.compiled );
    const bCompiled = b.map( ref => ref.compiled );
    const result: HoistedRefs = a;

    for( const bComp of bCompiled )
    {
        if( aCompiled.some( aComp => BitStream.eq( aComp, bComp ) ) )
        {
            // b hoisted already present between a's ones
            const idx = result.findIndex( href => BitStream.eq( href.compiled, bComp ) )
            
            // add number to exsisting ref
            result[ idx ] = {
                compiled: result[ idx ].compiled,
                number: result[ idx ].number +
                    ( b.find( bRef => BitStream.eq( bRef.compiled, bComp ) )?.number ?? 0 ) 
            }
        }
        else // hoisted not present in the a refs
        {
            // add new entry from b;
            result.push({
                compiled: bComp.clone(),
                number: b.find( bRef => BitStream.eq( bRef.compiled, bComp ) )?.number ?? 0
            })
        }
    }

    return result;
}


just like ```getHoistedTerms``` but returns also the number of references per hoisted term found

@fixme ```HoistedUPLC``` currently "hides" the number of refernces of its dependecies

export function getHoistedTermsAndRefs( t: UPLCTerm )
    : {
        terms: HoistedUPLC[],
        refs: HoistedRefs
    }
{
    const empty: {
        terms: HoistedUPLC[],
        refs: HoistedRefs
    } = {
        terms: [],
        refs: []
    };

    if( !isUPLCTerm( t ) ) return empty;

    if( t instanceof UPLCVar )
        return empty;
    if( t instanceof Delay )        return getHoistedTermsAndRefs( t.delayedTerm );
    if( t instanceof Lambda )       return getHoistedTermsAndRefs( t.body );
    if( t instanceof Application )
    {
        const argResult = getHoistedTermsAndRefs( t.argTerm ) ;
        const funcResult = getHoistedTermsAndRefs( t.funcTerm ); 
        return {
            terms: [ ...argResult.terms , ...funcResult.terms ],
            refs:  mergeRefs( argResult.refs, funcResult.refs )
        };
    }
    if( t instanceof UPLCConst )    return empty;
    if( t instanceof Force )        return getHoistedTermsAndRefs( t.termToForce );
    if( t instanceof ErrorUPLC )    return empty;
    if( t instanceof Builtin )      return empty;
    if( t instanceof HoistedUPLC )  return [ t, ...t.dependencies ];

    return empty;
}
// experimental: getHoistedTermsAndRefs */
