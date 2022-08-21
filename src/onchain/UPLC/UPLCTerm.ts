import UPLCVar from "./UPLCTerms/UPLCVar";
import Delay from "./UPLCTerms/Delay";
import Lambda from "./UPLCTerms/Lambda";
import Application from "./UPLCTerms/Application";
import UPLCConst from "./UPLCTerms/UPLCConst";
import Force from "./UPLCTerms/Force";
import ErrorUPLC from "./UPLCTerms/ErrorUPLC";
import Builtin from "./UPLCTerms/Builtin";
import JsRuntime from "../../utils/JsRuntime";

type UPLCTerm 
    = UPLCVar
    | Delay
    | Lambda
    | Application
    | UPLCConst
    | Force
    | ErrorUPLC
    | Builtin;

export default UPLCTerm;

export function isUPLCTerm( t: UPLCTerm ): t is UPLCTerm
{
    const proto = Object.getPrototypeOf( t );

    // only strict instances
    return (
        proto === UPLCVar.prototype        ||
        proto === Delay.prototype          ||
        proto === Lambda.prototype         ||
        proto === Application.prototype    ||
        proto === UPLCConst.prototype          ||
        proto === Force.prototype          ||
        proto === ErrorUPLC.prototype      ||
        proto === Builtin.prototype
    );
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
            return maxDeBruijn >= t.deBruijn.asBigInt;

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
        else
            throw JsRuntime.makeNotSupposedToHappenError(
                "unexpected execution flow in 'isClodeTerm'; all possibilieties should have already been handled; input term is: " + (t as any).toString()
            )

    }

    return _isClosedTerm( BigInt( 0 ) , term );
}