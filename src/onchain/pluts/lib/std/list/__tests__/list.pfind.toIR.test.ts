import { TermFn, PBool, PList, PData } from "../../../../..";
import { IRHoisted, getHoistedTerms } from "../../../../../IR/IRNodes/IRHoisted";
import { compileIRToUPLC } from "../../../../../IR/toUPLC/compileIRToUPLC";
import { showIR } from "../../../../../IR/utils/showIR";
import { PLam } from "../../../../PTypes";
import { TermType, ToPType, asData, bool, int, lam, list } from "../../../../type_system"
import { pif, pisEmpty, phead, ptail } from "../../../builtins";
import { papp } from "../../../papp";
import { pfn } from "../../../pfn";
import { plet } from "../../../plet";
import { precursive } from "../../../precursive";
import { PMaybeT, PMaybe } from "../../PMaybe";
import { _ptoData } from "../../data/conversion/toData_minimal";
import { pfind } from "../pfind"


function innerPFind<ElemsT extends TermType, PElemsT extends ToPType<ElemsT> = ToPType<ElemsT>>( elemsT: ElemsT )
: TermFn<[ PLam<PElemsT,PData>, PLam<PElemsT,PBool>, PList<PElemsT> ], PMaybeT<PElemsT>>
{
    const PMaybeElem = PMaybe( elemsT ) as any as PMaybeT<PElemsT>;

    return pfn([
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
        ) as any;
}

describe("pfind.toIR", () => {

    test("pfind( int )", () => {

        const term = innerPFind( int );
        const ir: IRHoisted = term.toIR() as any;

        console.log( showIR( ir ).text );
        console.log( getHoistedTerms( ir ).map( h => showIR( h.hoisted ).text ) )

        const uplc = compileIRToUPLC( ir );

    })
})