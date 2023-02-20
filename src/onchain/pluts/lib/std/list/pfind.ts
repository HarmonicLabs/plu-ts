import { TermFn, PLam, PBool, PList } from "../../../PTypes";
import { TermType, ToPType, fn, lam, bool, list, asData } from "../../../type_system";
import { pif, pisEmpty, phead, ptail } from "../../builtins";
import { papp } from "../../papp";
import { pfn } from "../../pfn";
import { phoist } from "../../phoist";
import { plet } from "../../plet";
import { precursive } from "../../precursive";
import { PMaybeT, PMaybe } from "../PMaybe/PMaybe";
import { ptoData_minimal } from "../data/conversion/toData_minimal";

export function pfind<ElemsT extends TermType, PElemsT extends ToPType<ElemsT> = ToPType<ElemsT>>( elemsT: ElemsT )
: TermFn<[ PLam<PElemsT,PBool>, PList<PElemsT> ], PMaybeT<PElemsT>>
{
    const PMaybeElem = PMaybe( elemsT ) as any as PMaybeT<PElemsT>;

    return phoist(
        
        pfn([
            lam( elemsT, asData( elemsT ) ),
            lam( elemsT, bool )
        ], lam(
            list( elemsT ),
            PMaybeElem.type
        ))
        ( (elemToData, predicate) => 

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

                        plet( phead( elemsT ).$( _list ) ).in( head => 

                            pif( PMaybeElem.type ).$( papp( predicate, head ) )
                            .then(
                                PMaybeElem.Just({ 
                                    // "as any" because of 
                                    // "Type 'Term<PAsData<ToPType<ElemsT>>>' is not assignable to type 'Term<PAsData<ToPType<FromPType<PElemsT>>>>'"
                                    val: papp( elemToData, head ) as any
                                })
                            )
                            .else(
                                papp( self, ptail( elemsT ).$( _list ) )
                            )

                        )

                    )
                )
            )
        )

    ).$( ptoData_minimal( elemsT ) ) as any ;
}