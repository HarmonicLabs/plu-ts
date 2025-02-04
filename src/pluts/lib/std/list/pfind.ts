import type { TermFn, PLam, PBool, PList } from "../../../PTypes";
import { TermType, ToPType, lam, bool, list, asData } from "../../../../type_system";
import { pif } from "../../builtins/bool";
import { pisEmpty, ptail } from "../../builtins/list";
import { papp } from "../../papp";
import { pfn } from "../../pfn";
import { phoist } from "../../phoist";
import { precursive } from "../../precursive";
import { PMaybeT, PMaybe } from "../PMaybe/PMaybe";
import { _ptoData } from "../data/conversion/toData_minimal";

export function pfind<ElemsT extends TermType, PElemsT extends ToPType<ElemsT> = ToPType<ElemsT>>( elemsT: ElemsT )
: TermFn<[ PLam<PElemsT,PBool>, PList<PElemsT> ], PMaybeT<PElemsT>>
{
    const PMaybeElem = PMaybe( elemsT ) as any as PMaybeT<PElemsT>;

    return phoist(
        phoist(
            
            pfn([
                lam( elemsT, asData( elemsT ) ),
                lam( elemsT, bool )
            ], lam(
                list( elemsT ),
                PMaybeElem.type
            ))
            (( elemToData, predicate ) => 

                precursive(
                    pfn([
                        lam(
                            list( elemsT ),  PMaybeElem.type
                        ),
                        list( elemsT )
                    ],  PMaybeElem.type )
            
                    (( self, _list ) => 
                        pif( PMaybeElem.type ).$( pisEmpty.$( _list ) )
                        .then(
                            PMaybeElem.Nothing({})
                        )
                        .else(

                            pif( PMaybeElem.type ).$( papp( predicate, _list.head ) )
                            .then(
                                PMaybeElem.Just({ 
                                    // "as any" because of 
                                    // "Type 'Term<PAsData<ToPType<ElemsT>>>' is not assignable to type 'Term<PAsData<ToPType<FromPType<PElemsT>>>>'"
                                    val: papp( elemToData, _list.head ) as any
                                })
                            )
                            .else(
                                papp( self, ptail( elemsT ).$( _list ) )
                            )

                        )
                    )
                ),
                "make_pfind"
            )

        ).$( _ptoData( elemsT ) ) as any
    );
}