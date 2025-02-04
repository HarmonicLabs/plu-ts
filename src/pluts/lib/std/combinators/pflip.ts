import { PFn, TermFn } from "../../../PTypes"
import { Term } from "../../../Term"
import { TermType, ToPType, fn } from "../../../../type_system"
import { papp } from "../../papp"
import { pfn } from "../../pfn"
import { phoist } from "../../phoist"

export function pflip<A extends TermType, B extends TermType, C extends TermType>( a: A, b: B, c: C ):
    Term<PFn<[ PFn<[ToPType<B>, ToPType<A>], ToPType<C>>, ToPType<A>, ToPType<B> ], ToPType<C>>>
    & {
        $: ( termFn: Term<PFn<[ ToPType<B>, ToPType<A> ], ToPType<C> >>) =>
            TermFn<[ ToPType<A>, ToPType<B> ], ToPType<C>>
    }
{
    return phoist(
        pfn([
            fn([ b, a ], c ),
            a,
            b
        ],  c)
        (( toFlip, _b, _a ) =>
            papp( papp( toFlip, _a ), _b )
        , "pflip")
    ) as any
}