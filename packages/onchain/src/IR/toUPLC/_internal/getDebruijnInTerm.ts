import { equalIrHash } from "../../IRHash";
import { IRApp } from "../../IRNodes/IRApp";
import { IRDelayed } from "../../IRNodes/IRDelayed";
import { IRForced } from "../../IRNodes/IRForced";
import { IRFunc } from "../../IRNodes/IRFunc";
import { IRLetted } from "../../IRNodes/IRLetted";
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

        if( term instanceof IRApp )
        {
            stack.push(
                { term: term.fn , dbn },
                { term: term.arg, dbn },
            );
            continue;
        }

        if( term instanceof IRDelayed )
        {
            stack.push(
                { term: term.delayed, dbn }
            );
            continue;
        }

        if( term instanceof IRForced )
        {
            stack.push(
                { term: term.forced, dbn }
            );
            continue;
        }

        if( term instanceof IRFunc )
        {
            stack.push(
                { term: term.body, dbn: dbn + term.arity }
            );
            continue;
        }

        if( term instanceof IRLetted )
        {
            stack.push(
                { term: term.value, dbn }
            );
            continue;
        }
    }

    return -1;
}