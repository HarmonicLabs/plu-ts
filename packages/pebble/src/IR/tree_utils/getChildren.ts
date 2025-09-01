import { IRCase } from "../IRNodes/IRCase";
import { IRApp } from "../IRNodes/IRApp";
import { IRDelayed } from "../IRNodes/IRDelayed";
import { IRForced } from "../IRNodes/IRForced";
import { IRFunc } from "../IRNodes/IRFunc";
import { IRHoisted } from "../IRNodes/IRHoisted";
import { IRLetted } from "../IRNodes/IRLetted";
import { IRTerm } from "../IRTerm";
import { IRConstr } from "../IRNodes/IRConstr";
import { IRRecursive } from "../IRNodes/IRRecursive";

export function getChildren( term: IRTerm ): IRTerm[]
{
    if( term instanceof IRApp ) return [ term.fn, term.arg ];
    if( term instanceof IRCase ) return [ term.constrTerm, ...term.continuations ];
    if( term instanceof IRConstr ) return [ ...term.fields ];
    if( term instanceof IRFunc ) return [ term.body ];
    if( term instanceof IRRecursive ) return [ term.body ];
    if( term instanceof IRDelayed ) return [ term.delayed ];
    if( term instanceof IRForced ) return [ term.forced ];
    if( term instanceof IRHoisted ) return [ term.hoisted ];
    if( term instanceof IRLetted ) return [ term.value ];
    
    // term
    // IRVar | IRConst | IRNative | IRError | IRSelfCall
    // none have children
    return [];
}