import { PType } from "../PType";
import type { PFn, TermFn } from "../PTypes/PFn/PFn";
import { PLam } from "../PTypes/PFn/PLam";
import { papp, pfn, phoist } from "../Syntax/syntax";
import { Term } from "../Term";
import { fn, lam, tyVar } from "../Term/Type/base";

export const pcompose
: Term<PFn<[
    PLam<PType,PType>,
    PLam<PType,PType>,
    PType
],  PType>> & {
    $: <B extends PType, C extends PType>( bToC: Term<PLam<B,C>> )
        => Term<PFn<[
            PLam<PType,B>,
            PType
        ],  C>> & {
        $: <A extends PType>( aToB: Term<PLam<A,B>> )
            => TermFn<[ A ], C>
    }
}= (( a, b, c ) => phoist(
    pfn([
        lam( b, c ),
        lam( a, b ),
        a
    ],  c)
    // @ts-ignore Type instantiation is excessively deep and possibly infinite
    (( bToC, aToB, _a ) => {
        return papp( bToC, papp( aToB, _a ) ) as any;
    })
))( tyVar("pcompose_a"), tyVar("pcompose_b"), tyVar("pcompose_c")) as any


export const pflip
: Term<PFn<[ PFn<[PType, PType], PType>, PType, PType ], PType>> & {
    $: <A extends PType, B extends PType, C extends PType>( termFn: Term<PFn<[ A, B ], C >>) =>
    TermFn<[ B, A ], C>
} = (( a, b, c ) => phoist(
    pfn([
        fn([ a, b ], c ),
        b,
        a
    ],  c)
    (( toFlip, _b, _a ) =>
        papp( papp( toFlip, _a ), _b )
    )
))( tyVar("pflip_a"), tyVar("pflip_b"), tyVar("pflip_c")) as any