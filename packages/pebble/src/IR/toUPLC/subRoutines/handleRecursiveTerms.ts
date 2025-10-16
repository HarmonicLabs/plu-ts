import { IRApp } from "../../IRNodes/IRApp";
import { IRFunc } from "../../IRNodes/IRFunc";
import { IRHoisted } from "../../IRNodes/IRHoisted";
import { IRRecursive } from "../../IRNodes/IRRecursive";
import { IRSelfCall } from "../../IRNodes/IRSelfCall";
import { IRVar } from "../../IRNodes/IRVar";
import { IRTerm } from "../../IRTerm";
import { getChildren } from "../../tree_utils/getChildren";
import { _modifyChildFromTo } from "../_internal/_modifyChildFromTo";

export function handleRecursiveTerms( term: IRTerm ): void
{
    if( term instanceof IRRecursive )
    {
        const bodyPtr = term.body;
        const recBody = Symbol("recBody");
        const self = term.name;
        _modifyChildFromTo(
            term.parent!,
            term,
            new IRApp(
                new IRHoisted(
                    new IRFunc( [ recBody ],
                        new IRApp( new IRVar( recBody ), new IRVar( recBody ) )
                    )
                ),
                new IRFunc( [ self ], bodyPtr )
            )
        );
        handleRecursiveTerms( bodyPtr );
        return;
    }
    if( term instanceof IRSelfCall )
    {
        _modifyChildFromTo(
            term.parent!,
            term,
            new IRApp( new IRVar( term.name ), new IRVar( term.name ) )
        );
        return;
    }
    getChildren( term ).forEach( handleRecursiveTerms );
}

export function handleRootRecursiveTerm( term: IRTerm ): IRTerm
{
    if( term instanceof IRRecursive )
    {
        const bodyPtr = term.body;
        const recBody = Symbol("recBody");
        const self = term.name;
        const newRoot = new IRApp(
            new IRHoisted(
                new IRFunc( [ recBody ],
                    new IRApp( new IRVar( recBody ), new IRVar( recBody ) )
                )
            ),
            new IRFunc( [ self ], bodyPtr )
        );
        handleRecursiveTerms( bodyPtr );
        return newRoot;
    }
    // else
    handleRecursiveTerms( term );
    return term;
}