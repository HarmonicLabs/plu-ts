import { PFn, PLam, TermFn } from "../../../PTypes";
import { Term } from "../../../Term";
import { ToPType } from "../../../../type_system";
import { TermType, lam } from "../../../../type_system/types";
import { papp } from "../../papp";
import { pfn } from "../../pfn";
import { phoist } from "../../phoist";

export const pcompose: <A extends TermType, B extends TermType, C extends TermType>( a: A, b: B, c: C ) =>
Term<PFn<[
    PLam<ToPType<B>,ToPType<C>>,
    PLam<ToPType<A>,ToPType<B>>,
    ToPType<A>
],  ToPType<C>>> & {
    $: ( bToC: Term<PLam<ToPType<B>,ToPType<C>>> )
        => Term<PFn<[
            PLam<ToPType<A>,ToPType<B>>,
            ToPType<A>
        ],  ToPType<C>>> & {
        $: ( aToB: Term<PLam<ToPType<A>,ToPType<B>>> )
            => TermFn<[ ToPType<A> ], ToPType<C>>
    }
} = (( a: TermType, b: TermType, c: TermType ) => phoist(
    pfn([
        lam( b, c ),
        lam( a, b ),
        a
    ],  c)
    (( bToC, aToB, _a ) => {
        return papp( bToC, papp( aToB, _a ) ) as any;
    }, "pcompose")
)) as any

