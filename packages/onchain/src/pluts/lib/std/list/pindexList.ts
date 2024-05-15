import type { TermFn, PList, PInt, PLam } from "../../../PTypes";
import { Term } from "../../../Term";
import { TermType, ToPType, fn, int, list } from "../../../type_system";
import { pif, pisEmpty, plessInt, phead, ptail } from "../../builtins";
import { papp } from "../../papp";
import { perror } from "../../perror";
import { pfn } from "../../pfn";
import { phoist } from "../../phoist";
import { precursive } from "../../precursive";
import { pInt } from "../int/pInt";


export function pindexList<ElemsT extends TermType>( elemsT: ElemsT )
: TermFn<[ PList<ToPType<ElemsT>>, PInt ], ToPType<ElemsT>>
{
    return phoist(
        precursive<PList<ToPType<ElemsT>>, PLam<PInt,ToPType<ElemsT>>>(

            pfn([
                fn([list( elemsT ), int ], elemsT),
                list( elemsT ),
                int
            ],elemsT)
            (( self, list, idx ) => 
                // TODO this "pif" is useless
                pif( elemsT ).$(

                    pisEmpty.$( list )
                    .strictOr(
                        plessInt.$( idx ).$( pInt( 0 ) ) 
                    )
                    
                )
                .then( perror( elemsT, "pindexList" ) )
                .else(

                    pif( elemsT ).$( pInt( 0 ).eq( idx ) )
                    .then( phead( elemsT ).$( list )  as any )
                    .else(
                        papp(
                            papp(
                                self,
                                ptail( elemsT ).$( list )
                            ),
                            pInt( -1 ).add( idx )
                        ) as Term<ToPType<ElemsT>>
                    )

                ),
                "pindexList"
            )

        )
    )
}
