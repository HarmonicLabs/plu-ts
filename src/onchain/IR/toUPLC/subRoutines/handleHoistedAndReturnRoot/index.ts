import { toHex, uint8ArrayEq } from "@harmoniclabs/uint8array-utils";
import { IRApp } from "../../../IRNodes/IRApp";
import { IRDelayed } from "../../../IRNodes/IRDelayed";
import { IRForced } from "../../../IRNodes/IRForced";
import { IRFunc } from "../../../IRNodes/IRFunc";
import { getSortedHoistedSet, getHoistedTerms, IRHoisted, cloneHoistedSetEntry } from "../../../IRNodes/IRHoisted";
import { IRLetted } from "../../../IRNodes/IRLetted";
import { IRVar } from "../../../IRNodes/IRVar";
import { IRTerm } from "../../../IRTerm";
import { _modifyChildFromTo } from "../../_internal/_modifyChildFromTo";
import { PlutsIRError } from "../../../../../errors/PlutsIRError";
import { logJson } from "../../../../../utils/ts/ToJson";
import { IHash } from "../../../interfaces/IHash";
import { showIR } from "../../../utils/showIR";

function toHashArr( arr: IHash[] ): string[]
{
    return arr.map( h => toHex( h.hash ) );
}

export function handleHoistedAndReturnRoot( term: IRTerm ): IRTerm
{
    // unwrap;
    if( term instanceof IRHoisted )
    {
        return handleHoistedAndReturnRoot( term.hoisted.clone() );
    }

    const directHoisteds = getHoistedTerms( term );
    const allHoisteds = getSortedHoistedSet( directHoisteds );
    let n = allHoisteds.length;
    
    // nothing to do; shortcut.
    if( n === 0 ) return term;

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
            hoistedsToInline[ b++ ] = thisHoistedEntry.hoisted;
        }
        else hoisteds[ a++ ] = thisHoistedEntry.hoisted;
    }

    // drop unused space
    hoisteds.length = a;
    hoistedsToInline.length = b;
    const hoistedsToInlineHashes = hoistedsToInline.map( h => h.hash );

    // console.log( "hoisteds", hoisteds.map( h => ({ ...showIR( h.hoisted ), hash: toHex( h.hash ) }) ) );
    // console.log( "hoistedsToInline", hoistedsToInline.map( h => ({ ...showIR( h.hoisted ), hash: toHex( h.hash ) }) ) );

    let root: IRTerm = term;
    while( root.parent !== undefined ) root = root.parent;

    let prevRoot: IRTerm;

    function getIRVarForHoistedAtLevel( _hoistedHash: Uint8Array, level: number ): IRVar
    {
        let levelOfTerm = hoisteds.findIndex( sortedH => uint8ArrayEq( sortedH.hash, _hoistedHash ) );
        if( levelOfTerm < 0 )
        {
            throw new PlutsIRError(
                `missing hoisted with hash ${toHex(_hoistedHash)} between hoisteds [\n\t${
                    hoisteds.map( h => toHex( h.hash ) )
                    .join(",\n\t")
                }\n]; can't replace with IRVar`
            );
        }
        return new IRVar( level - (levelOfTerm + 1) );
    }

    // adds the actual terms
    // from last to first
    for( let i = hoisteds.length - 1; i >= 0; i-- )
    {
        const thisHoisted = hoisteds[i];
        prevRoot = root;
        root = new IRApp(
            new IRFunc(
                1,
                root
            ),
            thisHoisted.hoisted.clone()
        );
    }

    // replace hoisted references with variables
    const stack: { irTerm: IRTerm, dbn: number }[] = [{ irTerm: root, dbn: 0 }];
    while( stack.length > 0 )
    {
        const { irTerm, dbn }  = stack.pop() as { irTerm: IRTerm, dbn: number };

        const irTermHash = irTerm.hash;
        if(
            // is hoiseted
            irTerm instanceof IRHoisted &&
            // is not one to be inlined
            !hoistedsToInlineHashes.some( h => uint8ArrayEq( h, irTermHash ) )
        )
        {
            const irvar = getIRVarForHoistedAtLevel( irTermHash, dbn );
            if( irvar.dbn >= dbn )
            {
                throw new PlutsIRError(
                    `out of bound hoisted term; hash: ${toHex( irTerm.hash )}; var's DeBruijn: ${irvar.dbn} (starts from 0); tot hoisted in scope: ${dbn}`
                )
            }
            _modifyChildFromTo(
                irTerm.parent as IRTerm,
                irTerm,
                irvar
            );
            // don't push anything
            // because we just replaced with a variable
            // so we know there's not a tree to explore
            continue;
        }
        else if( irTerm instanceof IRHoisted )
        {
            const toInline = irTerm.hoisted;
            _modifyChildFromTo(
                irTerm.parent as IRTerm,
                irTerm,
                toInline
            );
            stack.push({ irTerm: toInline, dbn });
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
                { irTerm: irTerm.body, dbn: dbn + irTerm.arity }
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
