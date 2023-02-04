import { PType } from "../../../PType"
import { PFn, TermFn } from "../../../PTypes"
import { Term, fn, tyVar } from "../../../Term"
import { papp } from "../../papp"
import { pfn } from "../../pfn"
import { phoist } from "../../phoist"

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