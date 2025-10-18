import { IRApp } from "../../../IRNodes/IRApp";
import { IRDelayed } from "../../../IRNodes/IRDelayed";
import { IRForced } from "../../../IRNodes/IRForced";
import { IRFunc } from "../../../IRNodes/IRFunc";
import { getSortedHoistedSet, getHoistedTerms, IRHoisted } from "../../../IRNodes/IRHoisted";
import { IRLetted } from "../../../IRNodes/IRLetted";
import { IRVar } from "../../../IRNodes/IRVar";
import { IRTerm } from "../../../IRTerm";
import { _modifyChildFromTo } from "../../_internal/_modifyChildFromTo";
import { showIR } from "../../../utils/showIR";
import { markRecursiveHoistsAsForced } from "../markRecursiveHoistsAsForced";
import { equalIrHash, IRHash, irHashToHex } from "../../../IRHash";
import { mapArrayLike } from "../../../IRNodes/utils/mapArrayLike";
import { IRCase } from "../../../IRNodes/IRCase";
import { IRConstr } from "../../../IRNodes/IRConstr";
import { stringify } from "../../../../utils/stringify";
import { IRRecursive } from "../../../IRNodes/IRRecursive";

export function handleHoistedAndReturnRoot( term: IRTerm ): IRTerm
{
    // unwrap;
    // if( term instanceof IRHoisted )
    while( term instanceof IRHoisted )
    {
        // we know `handleHoistedAndReturnRoot` modifies the term
        // so we are probably ok not cloning here
        // top level hoisted terms should be handled in `compileIRToUPLC` anyway
        term = term.hoisted;

        // we still need to remove this parent otherhwise there will be an unknown hoisted to handle
        term.parent = undefined;
        // return handleHoistedAndReturnRoot(
        //     theTerm
        // );
    }

    // TODO: should probably merge `markRecursiveHoistsAsForced` inside `getHoistedTerms` to iter once
    markRecursiveHoistsAsForced( term );
    const directHoisteds = getHoistedTerms( term );
    const allHoisteds = getSortedHoistedSet( directHoisteds );
    let n = allHoisteds.length;

    // evaluating constants
    if( n === 0 )
    {
        return term;
    }
    
    // nothing to do; shortcut.
    if( n === 0 ) return term;

    let a = 0;
    let b = 0;
    const toHoist: IRHoisted[] = new Array( n );
    const toInline: IRHoisted[] = new Array( n );

    // filter out hoisted terms with single reference
    for( let i = 0; i < n; i++ )
    {
        const thisHoistedEntry = allHoisteds[i];
        
        if( thisHoistedEntry.hoisted.meta.forceHoist === true )
        {
            toHoist[ a++ ] = thisHoistedEntry.hoisted;
            continue;
        }

        if(
            thisHoistedEntry.nReferences === 1 &&
            thisHoistedEntry.hoisted.parent
        )
        {
            // inline hoisted with single reference
            toInline[ b++ ] = thisHoistedEntry.hoisted;
        }
        else toHoist[ a++ ] = thisHoistedEntry.hoisted;
    }

    // drop unused space
    toHoist.length = a;
    toInline.length = b;
    const hoistedsToInlineHashes = toInline.map( h => h.hash );

    // console.log( "toHoist", toHoist.map( h => ({ ...showIR( h.hoisted ), hash: toHex( h.hash ) }) ) );
    // console.log( "toInline", toInline.map( h => ({ ...showIR( h.hoisted ), hash: toHex( h.hash ) }) ) );

    let root: IRTerm = term;
    while( root.parent !== undefined ) root = root.parent;

    // adds the actual terms
    // from last to first
    for( let i = toHoist.length - 1; i >= 0; i-- )
    {
        const thisHoisted = toHoist[i];
        root = new IRApp(
            new IRFunc(
                [ thisHoisted.name ],
                root
            ),
            thisHoisted.hoisted.clone()
        );
    }

    // replace hoisted references with variables
    const stack: { irTerm: IRTerm, dbn: number }[] = [{ irTerm: root, dbn: 0 }];
    while( stack.length > 0 )
    {
        const { irTerm, dbn }  = stack.pop() as { irTerm: IRTerm, dbn: number };

        const irTermHash = irTerm.hash;
        const isHoistedToinline = hoistedsToInlineHashes.some( h => equalIrHash( h, irTermHash ) ); 
        if(
            // is hoiseted
            irTerm instanceof IRHoisted &&
            // is not one to be inlined
            !isHoistedToinline
        )
        {
            const irvar = new IRVar( irTerm.name ); // getIRVarForHoistedAtLevel( irTermHash, dbn );

            // console.log(
            //     showIRText( irTerm.parent as IRTerm ),
            //     "\n\n",
            //     showIRText( irTerm ),
            // )
            _modifyChildFromTo(
                irTerm.parent,
                irTerm,
                irvar
            );
        
            irTerm.meta.handled = true;

            // don't push anything
            // because we just replaced with a variable
            // so we know there's not a tree to explore
            continue;
        }
        else if( irTerm instanceof IRHoisted )
        {
            if( !isHoistedToinline )
            {
                throw new Error(
                    "unexpected hoisted term found with hash: " + irHashToHex( irTermHash ) +
                    "\n showIR of the term: " + stringify(
                        showIR( irTerm ),
                        undefined,
                        2
                    )
                )
            }
            
            const toInline = irTerm.hoisted;
            _modifyChildFromTo(
                irTerm.parent,
                irTerm,
                toInline
            );
            stack.push({ irTerm: toInline, dbn });
            continue;
        }


        if(
            irTerm instanceof IRFunc
            || irTerm instanceof IRRecursive
        ) {
            stack.push(
                { irTerm: irTerm.body, dbn: dbn + irTerm.arity }
            );
            continue;
        }

        stack.push(
            ...irTerm.children()
            .map( child => ({ irTerm: child, dbn }))
        );
    }

    return root;
}
