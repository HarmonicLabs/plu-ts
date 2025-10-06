import { IRVar } from "../../../IRNodes/IRVar";
import { IRTerm } from "../../../IRTerm";
import { IRLetted } from "../../../IRNodes/IRLetted";
import { IRApp } from "../../../IRNodes/IRApp";
import { IRDelayed } from "../../../IRNodes/IRDelayed";
import { IRForced } from "../../../IRNodes/IRForced";
import { IRFunc } from "../../../IRNodes/IRFunc";
import { IRCase } from "../../../IRNodes/IRCase";
import { mapArrayLike } from "../../../IRNodes/utils/mapArrayLike";
import { IRConstr } from "../../../IRNodes/IRConstr";
import { IRRecursive } from "../../../IRNodes/IRRecursive";
import { IRSelfCall } from "../../../IRNodes/IRSelfCall";
import { IRHoisted } from "../../../IRNodes";
import { prettyIR, prettyIRInline } from "../../../utils";
import { irHashToHex } from "../../../IRHash";

/**
 *  add 1 to every var's DeBruijn that accesses stuff outside the parent node
 *  not including the `parentNode` node
 *  since the new function introdcued substituting the letted term
 *  is added inside the `parentNode` node
**/
function _incrementUnboundDbns(
    theTerm: IRTerm, 
    shouldNotModifyLetted: (letted: IRLetted, dbn: number ) => boolean
): void
{
    const stack: { term: IRTerm, dbn: number }[] = [{ term: theTerm, dbn: 0 }];
    while( stack.length > 0 )
    {
        const { term: t, dbn } = stack.pop() as { term: IRTerm, dbn: number };

        if(
            t instanceof IRVar
            || t instanceof IRSelfCall
        ) {
            console.log( t.dbn, ">=", dbn, "?", t.dbn >= dbn );
            if( t.dbn >= dbn ) {
                // there's a new variable in scope
                t.dbn++;
            }
            continue;
        }
        if( t instanceof IRLetted )
        {
            if( shouldNotModifyLetted( t, dbn ) )
            {
                console.log( "shouldNotModifyLetted", prettyIR( t.value ).text );
                // don't modify letted to be hoisted
                continue;
            }
            else // other letted to be handled in one of the next cycles
            {
                // `IRLambdas` DeBruijn are tracking the level of instantiation
                // we add a new variable so the dbn of instantiation increments
                t.dbn += 1;
                stack.push({ term: t.value, dbn });
            }
            continue;
        }

        if(
            t instanceof IRFunc
            || t instanceof IRRecursive
        ) {
            // new variable in scope
            stack.push({ term: t.body, dbn: dbn + t.arity });
            continue;
        }

        if( t instanceof IRHoisted ) { continue; } // skip hoisted since closed

        stack.push(
            ...t.children().map( term => ({ term, dbn }) )
        );

        // skip hoisted since closed
    }
}

export function incrementUnboundDbns(
    theTerm: IRTerm,
    shouldNotModifyLetted: (letted: IRLetted, dbn: number ) => boolean
): void
{
    function _loop( term: IRTerm, dbn: number ): void
    {
        const t = term;
        if(
            t instanceof IRVar
            || t instanceof IRSelfCall
        ) {
            console.log( t.dbn, ">=", dbn, "?", t.dbn >= dbn );
            if( t.dbn >= dbn ) {
                // there's a new variable in scope
                t.dbn++;
            }
            return;
        }
        if( t instanceof IRLetted )
        {
            const shouldNotModify = shouldNotModifyLetted( t, dbn );
            const specialLog = irHashToHex( t.hash ) === "00000000000000ea";
            let highestDelayParent: IRTerm = t;
            if( specialLog ) {
                console.log( "!!! working on special letted" );
                while( highestDelayParent.parent ) {
                    highestDelayParent = highestDelayParent.parent;
                    if( highestDelayParent instanceof IRDelayed ) break;
                }
            }
            specialLog && console.log( "special before", prettyIRInline( highestDelayParent ) );

            if( shouldNotModify )
            {
                console.log( "shouldNotModifyLetted", prettyIRInline( t.value ) );
                // don't modify letted to be hoisted
                // return;
            }
            else // other letted to be handled in one of the next cycles
            {
                // `IRLambdas` DeBruijn are tracking the level of instantiation
                // we add a new variable so the dbn of instantiation increments
                t.dbn += 1;
                _loop( t.value, dbn );
            }

            specialLog && console.log( "special after", prettyIRInline( highestDelayParent ) );

            return;
        }

        if(
            t instanceof IRFunc
            || t instanceof IRRecursive
        ) {
            // new variable in scope
            _loop( t.body, dbn + t.arity );
            return;
        }

        if( t instanceof IRHoisted ) { return; } // skip hoisted since closed


        // stack.push(
        //     ...t.children().map( term => ({ term, dbn }) )
        // );
        for( const child of t.children() ) {
            _loop( child, dbn );
        }
    }
    _loop( theTerm, 0 );
}