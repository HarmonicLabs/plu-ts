import { toHex, uint8ArrayEq } from "@harmoniclabs/uint8array-utils";
import { IRLettedMissingLCA } from "../../../../../errors/PlutsIRError/IRCompilationError/IRLettedMissingLCA";
import { IRApp } from "../../../IRNodes/IRApp";
import { IRFunc } from "../../../IRNodes/IRFunc";
import { getSortedLettedSet, getLettedTerms, IRLetted, jsonLettedSetEntry } from "../../../IRNodes/IRLetted";
import { IRVar } from "../../../IRNodes/IRVar";
import { IRTerm } from "../../../IRTerm";
import { _addDepth } from "../../_internal/_addDepth";
import { _modifyChildFromTo } from "../../_internal/_modifyChildFromTo";
import { findAll } from "../../_internal/findAll";
import { getDebruijnInTerm } from "../../_internal/getDebruijnInTerm";
import { lowestCommonAncestor } from "../../_internal/lowestCommonAncestor";
import { iterTree } from "../../_internal/iterTree";
import { groupByScope } from "./groupByScope";
import { logJson } from "../../../../../utils/ts/ToJson";
import { getRoot } from "../../../tree_utils/getRoot";


export function handleLettedAndReturnRoot( term: IRTerm ): IRTerm
{
    let root = term;
    root.parent = undefined; // make root;

    const allLetteds = getLettedTerms( root );

    const groupedLetteds = groupByScope( allLetteds );

    for( const { maxScope, group } of groupedLetteds )
    {
        const lettedSet = getSortedLettedSet( group );
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
            const thisLettedEntry = lettedSet[i];
            // console.log( thisHoistedEntry.nReferences, thisHoistedEntry.letted.parent )
            if(
                thisLettedEntry.nReferences === 1 &&
                thisLettedEntry.letted.parent
            )
            {
                // inline hoisted with single reference
                lettedToInline[ b++ ] = thisLettedEntry.letted
            }
            else letteds[ a++ ] = thisLettedEntry.letted;
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
                letted.parent,
                letted,
                letted.value
            );
        }

        // assign new root
        lettedToInline.length > 0 && (root = getRoot( lettedToInline[0] ));

        // add depths to every node
        _addDepth( maxScope ?? term );

        for( let i = letteds.length - 1; i >= 0; i-- )
        {
            letted = letteds[i];

            const refs: IRTerm[] = findAll(
                maxScope ?? term,
                elem => 
                    elem instanceof IRLetted &&
                    uint8ArrayEq( elem.hash, letted.hash )
            );

            // group by scope

            let lca: IRTerm | undefined = refs[0];
            for(let i = 1; i < refs.length; i++)
            {
                lca = lowestCommonAncestor( lca, refs[i] );
            }

            if( lca === undefined )
            {
                throw new IRLettedMissingLCA( letted );
            }

            // add 1 to every var's DeBruijn already present
            // in the maxScope that can access the letted value 
            // that is not closed ( that accesses stuff outside the maxScope )
            // (this is because we added a new lambda in between)
            iterTree( lca, ( node, dbn ) => {
                if(
                    node instanceof IRVar &&
                    node.dbn >= dbn
                )
                {
                    // there's a new variable in town
                    node.dbn++;
                    // (the town is the scope. Did you get it?)
                    // (please help...)
                }
            })
            //*/

            // save parent so when replacing we don't create a circular ref
            const parent = lca.parent;
            const newNode = new IRApp(
                new IRFunc(
                    1,
                    lca
                ),
                letted.value
            );

            _modifyChildFromTo(
                parent,
                lca,
                newNode
            );

            root = getRoot( lca.parent as any );

            for( const ref of refs )
            {
                _modifyChildFromTo(
                    ref?.parent,
                    ref as any,
                    new IRVar( getDebruijnInTerm( lca, ref as any ) )
                )
            }
            
        }
        
    }

    return root;
}