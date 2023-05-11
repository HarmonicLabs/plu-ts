import { toHex, uint8ArrayEq } from "@harmoniclabs/uint8array-utils";
import { BasePlutsError } from "../../../../errors/BasePlutsError";
import { PlutsIRError } from "../../../../errors/PlutsIRError";
import { IRApp } from "../../IRNodes/IRApp";
import { IRDelayed } from "../../IRNodes/IRDelayed";
import { IRForced } from "../../IRNodes/IRForced";
import { IRFunc } from "../../IRNodes/IRFunc";
import { IRHoisted } from "../../IRNodes/IRHoisted";
import { IRLetted } from "../../IRNodes/IRLetted";
import { IRTerm } from "../../IRTerm";
import { logJson } from "../../../../utils/ts/ToJson";


/**
 * 
 * @param parent node to modify the child of
 * @param currentChild mainly passed to distinguish in case of `IRApp`
 * @param newChild new node's child
 */
export function _modifyChildFromTo( parent: IRTerm | undefined, currentChild: IRTerm | Uint8Array, newChild: IRTerm ): void
{
    if( parent === undefined )
    {
        throw new PlutsIRError(
            "'_modifyChildFromTo' received an undefined parent"
        );
    }
    if( parent instanceof IRApp )
    {
        if( parent.fn === parent.arg )
        throw new BasePlutsError(
            "while calling '_modifyChildFromTo' on a 'IRApp' node; teh two childrens where the same"
        );

        // DO NO USE SHALLOW EQUALITY
        // child might be cloned

        const currChildHash = currentChild instanceof Uint8Array ? currentChild : currentChild.hash;

        if( // if the function is likely to already have an hash
            parent.fn instanceof IRLetted ||
            parent.fn instanceof IRHoisted
        )
        {   // then check the function first

            if( uint8ArrayEq( parent.fn.hash, currChildHash ) )
            {
                parent.fn = newChild;
            }
            else if( uint8ArrayEq( parent.arg.hash, currChildHash ) )
            {
                parent.arg = newChild;
            }
            else
            {
                // logJson( currentChild as any )
                // logJson( parent.fn )
                throw new PlutsIRError(
                    "unknown 'IRApp' child to modify; given child to modify hash: " +
                    toHex( currChildHash ) +
                    "; function child hash: " + toHex( parent.fn.hash ) +
                    "; argument child hash: " + toHex( parent.arg.hash )
                );
            }
        }
        else // check the argument first as it is more likely to have a smaller tree
        {
            if( uint8ArrayEq( parent.arg.hash, currChildHash ) )
            {
                parent.arg = newChild;
            }
            else if( uint8ArrayEq( parent.fn.hash, currChildHash ) )
            {
                parent.fn = newChild;
            }
            else
            {
                throw new PlutsIRError(
                    "unknown 'IRApp' child to modify; given child to modify hash: " +
                    toHex( currChildHash ) +
                    "; function child hash: " + toHex( parent.fn.hash ) +
                    "; argument child hash: " + toHex( parent.arg.hash )
                );
            }
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