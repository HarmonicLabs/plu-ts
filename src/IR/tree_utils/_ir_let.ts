import { IRApp, IRFunc } from "../IRNodes";
import { IRTerm } from "../IRTerm";

export function _ir_let( value: IRTerm, body: IRTerm ): IRApp
{
    return new IRApp(
        new IRFunc(1, body),
        value
    );
}