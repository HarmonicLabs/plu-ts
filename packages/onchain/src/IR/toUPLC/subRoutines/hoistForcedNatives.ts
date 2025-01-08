import { IRApp, IRVar } from "../../IRNodes";
import { IRFunc } from "../../IRNodes/IRFunc";
import { IRNative } from "../../IRNodes/IRNative";
import { IRNativeTag } from "../../IRNodes/IRNative/IRNativeTag";
import { isForcedNative } from "../../IRNodes/IRNative/isForcedNative";
import { IRRecursive } from "../../IRNodes/IRRecursive";
import { IRTerm } from "../../IRTerm";
import { showIRText } from "../../utils";
import { isIRParentTerm } from "../../utils/isIRParentTerm";
import { _modifyChildFromTo } from "../_internal/_modifyChildFromTo";
import { iterTree } from "../_internal/iterTree";
import { sanifyTree } from "./sanifyTree";

export function hoistForcedNatives( term: IRTerm ): IRTerm
{
    if( !isIRParentTerm(term) ) return term;

    const toHoist: { [tag: number]: IRNative[] } = {
        [IRNativeTag.strictIfThenElse]: [],
        [IRNativeTag.chooseUnit]: [],
        [IRNativeTag.trace]: [],
        [IRNativeTag.mkCons]: [],
        [IRNativeTag.headList]: [],
        [IRNativeTag.tailList]: [],
        [IRNativeTag.nullList]: [],
        [IRNativeTag.chooseData]: [],
        [IRNativeTag.fstPair]: [],
        [IRNativeTag.sndPair]: [],
        [IRNativeTag.strictChooseList]: [],
    };

    sanifyTree( term );

    // console.log( showIRText( term ) );

    // collect all forced natives
    iterTree( term, ( node ) => {
        if( isForcedNative( node ) )
        {
            toHoist[node.tag].push( node );
        }
    });
    
    const tags = Object.keys( toHoist );

    for( const tagStr of tags )
    {
        const tag = Number( tagStr );
        const nodes = toHoist[tag];
        if( nodes.length <= 0 ) continue; // also single use (might be inside loop)
        for( const node of nodes )
        {
            _modifyChildFromTo(
                node.parent,
                node,
                new IRVar( getDbnToRoot( node ) )
            );
        }
        term = new IRApp(
            new IRFunc( 1, term ),
            new IRNative( tag )
        );
    }

    return term;
}

function getDbnToRoot( node: IRNative ): number
{
    let dbn = 0; // if no IRFunc is found, the node is at dbn 0 (the new func will be added)
    let current: IRTerm | undefined = node;
    while( current )
    {
        if(
            current instanceof IRFunc ||
            current instanceof IRRecursive
        ) dbn += current.arity;
        current = current.parent;
    }
    return dbn;
}