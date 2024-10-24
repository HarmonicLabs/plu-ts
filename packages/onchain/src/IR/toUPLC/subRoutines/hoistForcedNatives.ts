import { IRApp, IRVar } from "../../IRNodes";
import { IRFunc } from "../../IRNodes/IRFunc";
import { IRNative } from "../../IRNodes/IRNative";
import { IRNativeTag } from "../../IRNodes/IRNative/IRNativeTag";
import { IRRecursive } from "../../IRNodes/IRRecursive";
import { IRTerm } from "../../IRTerm";
import { _modifyChildFromTo } from "../_internal/_modifyChildFromTo";
import { iterTree } from "../_internal/iterTree";

export function hoistForcedNatives( term: IRTerm ): IRTerm
{
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

    // collect all forced natives
    iterTree( term, ( node ) => {
        if( node instanceof IRNative && isForcedNativeTag( node.tag ) )
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
                node.parent!,
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

function isForcedNativeTag( tag: IRNativeTag ): boolean
{
    return (
        tag === IRNativeTag.strictIfThenElse    ||
        tag === IRNativeTag.chooseUnit          ||
        tag === IRNativeTag.trace               ||
        tag === IRNativeTag.mkCons              ||
        tag === IRNativeTag.headList            ||
        tag === IRNativeTag.tailList            ||
        tag === IRNativeTag.nullList            ||
        tag === IRNativeTag.chooseData          ||
        tag === IRNativeTag.fstPair             ||
        tag === IRNativeTag.sndPair             ||
        tag === IRNativeTag.strictChooseList
    );
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