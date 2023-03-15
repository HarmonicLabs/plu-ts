import { uint8ArrayEq } from "@harmoniclabs/uint8array-utils";
import { lam, tyVar } from "../../../pluts";
import { IRApp } from "../../IRNodes/IRApp";
import { IRDelayed } from "../../IRNodes/IRDelayed";
import { IRForced } from "../../IRNodes/IRForced";
import { IRFunc } from "../../IRNodes/IRFunc";
import { getSortedHoistedSet, getHoistedTerms, IRHoisted } from "../../IRNodes/IRHoisted";
import { IRLetted } from "../../IRNodes/IRLetted";
import { IRVar } from "../../IRNodes/IRVar";
import { IRTerm } from "../../IRTerm";
import { _modifyChildFromTo } from "../_internal/_modifyChildFromTo";

export function handleHoistedAndReturnRoot( term: IRTerm ): IRTerm
{
    const allHoisteds = getSortedHoistedSet( getHoistedTerms( term ) );
    let n = allHoisteds.length;
    let a = 0;
    let b = 0;
    const hoisteds: IRHoisted[] = new Array( n );
    const hoistedsToInline: IRHoisted[] = new Array( n );

    // filter out hoisted terms with single reference
    for( let i = 0; i < n; i++ )
    {
        const thisHoistedEntry = allHoisteds[i];
        if(
            thisHoistedEntry.nReferences === 1 &&
            thisHoistedEntry.hoisted.parent
        )
        {
            // inline hoisted with single reference
            hoistedsToInline[ b++ ] = thisHoistedEntry.hoisted
        }
        else hoisteds[ a++ ] = thisHoistedEntry.hoisted;
    }

    // drop unused space
    hoisteds.length = a;
    hoistedsToInline.length = b;
    
    // inline single references from last to first
    let hoisted : IRHoisted;
    for( let i = hoistedsToInline.length - 1; i >= 0; i-- )
    {
        hoisted = hoistedsToInline.pop() as IRHoisted;
        _modifyChildFromTo(
            hoisted.parent as IRTerm,
            hoisted,
            hoisted.hoisted
        );
    }

    let root: IRTerm = term;
    while( root.parent !== undefined ) root = root.parent;

    // const unHoistedRoot = root;

    // adds the actual terms
    for( let i = hoisteds.length - 1; i >= 0; i-- )
    {
        root = new IRApp(
            new IRFunc(
                1,
                root
            ),
            hoisteds[i].hoisted
        )
    }

    function getIRVarForHoistedAtLevel( _hoisted: IRHoisted, level: number ): IRVar
    {
        const levelOfTerm = hoisteds.findIndex( sortedH => uint8ArrayEq( sortedH.hash, _hoisted.hash ) );
        return new IRVar( level - (levelOfTerm + 1) );
    }

    // start form root since we need to replace hoisted dependecies too
    const stack: { irTerm: IRTerm, dbn: number }[] = [{ irTerm: root, dbn: 0 }];
    while( stack.length > 0 )
    {
        const { irTerm, dbn }  = stack.pop() as { irTerm: IRTerm, dbn: number };
        if( irTerm instanceof IRHoisted )
        {
            _modifyChildFromTo(
                irTerm.parent as IRTerm,
                irTerm,
                getIRVarForHoistedAtLevel( irTerm, dbn )
            );
            continue;
        }

        if( irTerm instanceof IRApp )
        {
            stack.push(
                { irTerm: irTerm.fn , dbn },
                { irTerm: irTerm.arg, dbn },
            );
            continue;
        }

        if( irTerm instanceof IRDelayed )
        {
            stack.push(
                { irTerm: irTerm.delayed, dbn }
            );
            continue;
        }

        if( irTerm instanceof IRForced )
        {
            stack.push(
                { irTerm: irTerm.forced, dbn }
            );
            continue;
        }

        if( irTerm instanceof IRFunc )
        {
            stack.push(
                { irTerm: irTerm.body, dbn }
            );
            continue;
        }

        if( irTerm instanceof IRLetted )
        {
            stack.push(
                { irTerm: irTerm.value, dbn }
            );
            continue;
        }
    }

    return root;
}

