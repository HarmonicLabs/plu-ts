import { IRApp } from "../../IRNodes/IRApp";
import { IRCase } from "../../IRNodes/IRCase";
import { IRConstr } from "../../IRNodes/IRConstr";
import { IRTerm } from "../../IRTerm";

export interface ApplicationTerms {
    func: IRTerm,
    args: IRTerm[],
}

export function getApplicationTerms( term: IRTerm ): ApplicationTerms | undefined
{
    const args: IRTerm[] = [];
    while(
        term instanceof IRApp
        || (
            term instanceof IRCase
            && term.continuations.length === 1
            && term.constrTerm instanceof IRConstr
            && Number( term.constrTerm.index ) === 0
        )
        // go "through" letted and hoisted
        // || term instanceof IRLetted
        // || term instanceof IRHoisted
    ) {
        if( term instanceof IRApp ) {
            args.unshift( term.arg );
            term = term.fn;
            continue;
        }
        if(
            term instanceof IRCase
            && term.continuations.length === 1
            && term.constrTerm instanceof IRConstr
            && Number( term.constrTerm.index ) === 0
        ) {
            args.push( ...term.constrTerm.fields );
            term = term.continuations[0];
            continue;
        }
        // if( term instanceof IRLetted ) term = term.value;
        // else if( term instanceof IRHoisted ) term = term.hoisted;
    }
    if( args.length === 0 ) return undefined;
    return {
        func: term,
        args,
    };
}