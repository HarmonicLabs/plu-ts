import { getCallStackAt } from "../../utils/getCallStackAt";
import type { PType } from "../PType";
import type { Term } from "../Term";

export function phoist<PInstance extends PType, SomeExtension extends {}>( closedTerm: Term<PInstance> & SomeExtension ): Term<PInstance> & SomeExtension
{
    /*
    the implementation has been moved to a method of the term
    since all 'phoist' is doing is wrapping whatever UPLC the 'Term' represent
    into an 'HoistedUPLC'

    however proevious implementaiton achieved this by creating a new term and then **copying** eventual extension

    this was a problem since the extension methods are defined using the **raw** UPLC rather than the hoisted
    causing the hoisted result not to be actually hoisted if accessed using the methods

    moving the "wrapping" of the 'toUPLC' method inside the term, preserves the same 'Term' object
    but the same 'Term' object is now properly hoisted

    this also removes the `O(n)` operation of copying the methods; since the methods are already there
    */
    (closedTerm as any).hoist();
    return closedTerm;
}