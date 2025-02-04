import type { PDataRepresentable } from "../../../PType/PDataRepresentable";
import type { PBool, PDelayed, PList, TermFn } from "../../../PTypes";
import { PAlias, palias } from "../../../PTypes/PAlias/palias";
import { TermType, list, lam, bool, delayed, AliasT, ListT, ToPType } from "../../../../type_system";
import { punsafeConvertType } from "../../punsafeConvertType";
import { pfn } from "../../pfn";
import { phoist } from "../../phoist";
import { perror } from "../../perror";
import { pforce } from "../../pforce";
import { pdelay } from "../../pdelay";
import { pisEmpty } from "../../builtins/list";
import { pif, pstrictIf } from "../../builtins/bool";

export type ListMaybeT<T extends TermType> =
    AliasT<ListT<T>,{
        isNothing: TermFn<[ PList<ToPType<T>> ], PBool>,
        unwarpOrFail: TermFn<[ PList<ToPType<T>> ], ToPType<T>>
        unwarpOrElse: TermFn<[ PList<ToPType<T>>, PDelayed<ToPType<T>> ], ToPType<T>>
    }>

export type PListMaybeT<PTy extends PDataRepresentable> =
    PAlias<PList<PTy>,{
        isNothing: TermFn<[ PList<PTy> ], PBool>,
        unwarpOrFail: TermFn<[ PList<PTy> ], PTy>
        unwarpOrElse: TermFn<[ PList<PTy>, PDelayed<PTy> ], PTy>
    }>

export function PListMaybe<T extends TermType>(tyArg: T): PListMaybeT<ToPType<T>>
{
    return palias(
        list( tyArg ),
        self_t => {

            return {
                isNothing: punsafeConvertType( pisEmpty, lam( self_t, bool ) ),
                unwrapOrFail: phoist(
                    pfn([ self_t ], tyArg)
                    ( self =>
                        pif( tyArg ).$( pisEmpty.$( self ) )
                        .then( perror( tyArg ) )
                        .else( self.head )
                    )
                ),
                unwarpOrElse: phoist(
                    pfn([ self_t, delayed( tyArg ) ], tyArg)
                    (( self, weDontLikeThat ) =>
                        pforce(
                            pstrictIf( delayed( tyArg ) ).$( pisEmpty.$( self ) )
                            .$( weDontLikeThat )
                            .$( pdelay( self.head ) )
                        )
                    )
                )
            }
        }
    ) as any;
}