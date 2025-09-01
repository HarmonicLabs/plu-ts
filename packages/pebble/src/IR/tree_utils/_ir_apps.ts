import { IRApp } from "../IRNodes/IRApp";
import { IRTerm } from "../IRTerm";

export function _ir_apps( ...terms: [ IRTerm, IRTerm, ...IRTerm[] ] ): IRApp
{
    let term = new IRApp( terms[0], terms[1] );
    for( let i = 2; i < terms.length; i++ )
    {
        term = new IRApp(
            term,
            terms[i]
        );
    }
    return term;
}