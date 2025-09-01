import { IRNative } from "./index";
import { IRTerm } from "../../IRTerm";
import { IRNativeTag } from "./IRNativeTag";

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

export function isForcedNative( node: IRTerm ): node is IRNative
{
    return node instanceof IRNative && isForcedNativeTag( node.tag );
}