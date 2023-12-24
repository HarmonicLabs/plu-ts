import { toHex, uint8ArrayEq } from "@harmoniclabs/uint8array-utils";
import { IRApp } from "../../IRNodes/IRApp";
import { IRDelayed } from "../../IRNodes/IRDelayed";
import { IRForced } from "../../IRNodes/IRForced";
import { IRFunc } from "../../IRNodes/IRFunc";
import { IRHoisted } from "../../IRNodes/IRHoisted";
import { IRLetted } from "../../IRNodes/IRLetted";
import { IRTerm } from "../../IRTerm";
import { IRParentTerm } from "../../utils/isIRParentTerm";
import { isIRTerm } from "@harmoniclabs/plu-ts-onchain";
import { prettyIRJsonStr } from "../../utils";

/**
 * 
 * @param parent node to modify the child of
 * @param currentChild mainly passed to distinguish in case of `IRApp`
 * @param newChild new node's child
 */
export function _modifyChildFromTo( parent: IRParentTerm | undefined, currentChild: IRTerm | Uint8Array, newChild: IRTerm ): void
{
    if( parent === undefined )
    {
        throw new Error(
            "'_modifyChildFromTo' received an undefined parent"
        );
    }
    if(
        // currentChild has parent property
        isIRTerm( currentChild ) &&
        // and is not (already) undefined
        currentChild.parent !== undefined &&
        // and the `parent` passed to the function is the parent of the `currentChild`
        currentChild.parent === parent &&
        // and child to be modified is not the same object
        currentChild !== newChild
    )
    {
        // we are modifying the child
        // so we remove the reference
        currentChild.parent = undefined;
    }
    if( parent instanceof IRApp )
    {
        // DO NO USE **ONLY** SHALLOW EQUALITY
        // child might be cloned
        const currChildHash = currentChild instanceof Uint8Array ? currentChild : currentChild.hash;

        // check the argument first as it is more likely to have a smaller tree
        if( currentChild === parent.arg || uint8ArrayEq( parent.arg.hash, currChildHash ) )
        {
            parent.arg = newChild;
        }
        else if( currentChild === parent.fn || uint8ArrayEq( parent.fn.hash, currChildHash ) )
        {
            parent.fn = newChild;
        }
        else
        {
            console.log(
                "currentChild:", prettyIRJsonStr( currentChild as IRTerm, 2, { hoisted: false } ),
                "\nfn :", prettyIRJsonStr( parent.fn , 2, { hoisted: false } ),
                "\narg:", prettyIRJsonStr( parent.arg, 2, { hoisted: false } ),
            );
            throw new Error(
                "unknown 'IRApp' child to modify; given child to modify hash: " +
                toHex( currChildHash ) +
                "; function child hash: " + toHex( parent.fn.hash ) +
                "; argument child hash: " + toHex( parent.arg.hash )
            );
        }

        
        return;
    }

    if( parent instanceof IRDelayed )
    {
        parent.delayed = newChild;
        return;
    }

    if( parent instanceof IRForced )
    {
        parent.forced = newChild;
        return;
    }

    if( parent instanceof IRFunc )
    {
        parent.body = newChild;
        return;
    }

    if( parent instanceof IRHoisted )
    {
        parent.hoisted = newChild;
        return;
    }

    if( parent instanceof IRLetted )
    {
        parent.value = newChild;
        return;
    }
}