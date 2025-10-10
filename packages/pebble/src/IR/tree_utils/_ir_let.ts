import { IRApp, IRFunc } from "../IRNodes";
import { IRTerm } from "../IRTerm";

export function _ir_let( value: IRTerm, mkBody: ( varName: symbol ) => IRTerm ): IRApp
{
    const name = Symbol("lettedVar");
    return new IRApp(
        new IRFunc([ name ], mkBody( name )),
        value
    );
}