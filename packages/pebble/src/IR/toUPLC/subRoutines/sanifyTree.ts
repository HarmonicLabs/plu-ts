import { IRApp, IRFunc, IRLetted, IRHoisted, IRDelayed, IRForced, IRConstr, IRCase } from "../../IRNodes";
import { IRRecursive } from "../../IRNodes/IRRecursive";
import { IRTerm } from "../../IRTerm";

/**
 * makes sure all the childrens in a tree are pointing to the correct parent 
 */
export function sanifyTree(ir: IRTerm): void
{
    if (ir instanceof IRApp)
    {
        if (ir.fn.parent !== ir) ir.fn = ir.fn.clone();
        else sanifyTree(ir.fn);

        if (ir.arg.parent !== ir) ir.arg = ir.arg.clone();
        else sanifyTree(ir.arg);

        return;
    }
    else if (ir instanceof IRFunc)
    {
        if( ir.body.parent !== ir ) ir.body = ir.body.clone();
        else sanifyTree(ir.body);
        return;
    }
    else if (ir instanceof IRRecursive)
    {
        if( ir.body.parent !== ir ) ir.body = ir.body.clone();
        else sanifyTree(ir.body);
        return;
    }
    else if (ir instanceof IRLetted)
    {
        if( ir.value.parent !== ir ) ir.value = ir.value.clone();
        else sanifyTree(ir.value);

        return;
    }
    else if (ir instanceof IRHoisted)
    {
        if( ir.hoisted.parent !== ir ) ir.hoisted = ir.hoisted.clone();
        else sanifyTree(ir.hoisted);
        return;
    }
    else if (ir instanceof IRDelayed)
    {
        if( ir.delayed.parent !== ir ) ir.delayed = ir.delayed.clone();
        else sanifyTree(ir.delayed);
        return;
    }
    else if (ir instanceof IRForced)
    {
        if( ir.forced.parent !== ir ) ir.forced = ir.forced.clone();
        else sanifyTree(ir.forced);
        return;
    }
    else if (ir instanceof IRConstr)
    {

        for( let i = 0; i < ir.fields.length; i++ )
        {
            const field: IRTerm = ir.fields[i];
            if( field.parent !== ir ) ir.fields[i] = field.clone();
            else sanifyTree( ir.fields[i] );
        }
        return;
    }
    else if (ir instanceof IRCase)
    {
        if( ir.constrTerm.parent !== ir ) ir.constrTerm = ir.constrTerm.clone();
        else sanifyTree(ir.constrTerm);

        for( let i = 0; i < ir.continuations.length; i++ )
        {
            const continuation: IRTerm = ir.continuations[i];
            if( continuation.parent !== ir ) ir.continuations[i] = continuation.clone();
            else sanifyTree( ir.continuations[i] );
        }
        return;
    }
}