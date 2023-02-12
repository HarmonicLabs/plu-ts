import { PType } from "../../../PType";
import { PFn, PLam, TermFn } from "../../../PTypes";
import { Term, lam, tyVar } from "../../../Term";
import { papp } from "../../papp";
import { pfn } from "../../pfn";
import { phoist } from "../../phoist";

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
    (( bToC, aToB, _a ) => {
        return papp( bToC, papp( aToB, _a ) ) as any;
    })
))( tyVar("pcompose_a"), tyVar("pcompose_b"), tyVar("pcompose_c")) as any

