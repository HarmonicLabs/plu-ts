import { equalIrHash } from "../../IRHash";
import { IRCase, IRConstr, IRHoisted } from "../../IRNodes";
import { IRApp } from "../../IRNodes/IRApp";
import { IRDelayed } from "../../IRNodes/IRDelayed";
import { IRForced } from "../../IRNodes/IRForced";
import { IRFunc } from "../../IRNodes/IRFunc";
import { IRLetted } from "../../IRNodes/IRLetted";
import { IRRecursive } from "../../IRNodes/IRRecursive";
import { mapArrayLike } from "../../IRNodes/utils/mapArrayLike";
import { IRTerm } from "../../IRTerm";
import { prettyIRJsonStr } from "../../utils";


export function getDebruijnInTerm( root: IRTerm, termToFind: IRTerm ): number
{
    const termTofindHash = termToFind.hash
    const stack: { term: IRTerm, dbn: number }[] = [{ term: root, dbn: 0 }];

    while( stack.length > 0 )
    {
        const { term, dbn } = stack.pop() as { term: IRTerm, dbn: number };

        if( term === termToFind || equalIrHash( term.hash, termTofindHash ) ) return dbn;

        if(
            term instanceof IRFunc
            || term instanceof IRRecursive
        ) {
            // new variable in scope
            stack.push({ term: term.body, dbn: dbn + term.arity });
            continue;
        }

        if( term instanceof IRHoisted ) { continue; } // skip hoisted since closed

        stack.push(
            ...term.children().map( t => ({ term: t, dbn }) )
        );
    }

    return -1;
}