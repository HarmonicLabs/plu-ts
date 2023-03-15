import { toHex, uint8ArrayEq } from "@harmoniclabs/uint8array-utils";
import { IRLettedMissingLCA } from "../../../../errors/PlutsIRError/IRCompilationError/IRLettedMissingLCA";
import { IRApp } from "../../IRNodes/IRApp";
import { IRFunc } from "../../IRNodes/IRFunc";
import { getSortedLettedSet, getLettedTerms, IRLetted, jsonLettedSetEntry } from "../../IRNodes/IRLetted";
import { IRVar } from "../../IRNodes/IRVar";
import { IRTerm } from "../../IRTerm";
import { _addDepth } from "../_internal/_addDepth";
import { _modifyChildFromTo } from "../_internal/_modifyChildFromTo";
import { findAll } from "../_internal/findAll";
import { getDebruijnInTerm } from "../_internal/getDebruijnInTerm";
import { lowestCommonAncestor } from "../_internal/lowestCommonAncestor";


export function handleLetted( term: IRTerm ): void
{
    const lettedSet = getSortedLettedSet( getLettedTerms( term ) );
    let n = lettedSet.length;
    let a = 0;
    let b = 0;
    const letteds: IRLetted[] = new Array( n );
    const lettedToInline: IRLetted[] = new Array( n );

    // console.log( lettedSet.map( jsonLettedSetEntry ) );
    // console.log( lettedSet.map( letted => letted.letted.dependencies ) );
    
    // filter out hoisted terms with single reference
    for( let i = 0; i < n; i++ )
    {
        const thisHoistedEntry = lettedSet[i];
        // console.log( thisHoistedEntry.nReferences, thisHoistedEntry.letted.parent )
        if(
            thisHoistedEntry.nReferences === 1 &&
            thisHoistedEntry.letted.parent
        )
        {
            // inline hoisted with single reference
            lettedToInline[ b++ ] = thisHoistedEntry.letted
        }
        else letteds[ a++ ] = thisHoistedEntry.letted;
    }

    // drop unused space
    letteds.length = a;
    lettedToInline.length = b;

    // console.log( letteds.map( l => toHex( l.hash ) ) );
    // console.log( lettedToInline.map( l => toHex( l.hash ) ) );
    
    // inline single references from last to first
    // needs to be from last to first so that hashes will not change
    let letted: IRLetted;
    for( let i = lettedToInline.length - 1; i >= 0 ; i-- )
    {
        letted = lettedToInline[i] as IRLetted;
        _modifyChildFromTo(
            letted.parent as IRTerm,
            letted,
            letted.value
        );
    }

    // add depths to every node
    _addDepth( term );

    for( let i = letteds.length - 1; i >= 0; i-- )
    {
        letted = letteds[i];

        const refs: (IRTerm | undefined)[] = findAll(
            term,
            elem => 
                elem instanceof IRLetted &&
                uint8ArrayEq( elem.hash, letted.hash )
        );

        let lca: IRTerm | undefined = refs[0];
        for(let i = 1; i < refs.length; i++)
        {
            lca = lowestCommonAncestor( lca, refs[i] );
        }

        if( lca === undefined )
        {
            throw new IRLettedMissingLCA( letted );
        }

        // TODO add 1 to every var's DeBruijn already present that is not closed in the term

        _modifyChildFromTo(
            lca.parent as IRTerm,
            lca,
            new IRApp(
                new IRFunc(
                    1,
                    lca
                ),
                letted.value
            )
        );

        for( const ref of refs )
        {
            _modifyChildFromTo(
                (ref as any).parent,
                ref as any,
                new IRVar( getDebruijnInTerm( lca, ref as any ) )
            )
        }
        
    }
}