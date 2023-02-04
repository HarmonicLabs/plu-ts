import type { TermFn, PList, PInt, PLam } from "../../../PTypes";
import { ConstantableTermType, Type, Term } from "../../../Term";
import { ToPType } from "../../../Term/Type/ts-pluts-conversion";
import { pif, pisEmpty, plessInt, phead, ptail } from "../../builtins";
import { papp } from "../../papp";
import { perror } from "../../perror";
import { pfn } from "../../pfn";
import { phoist } from "../../phoist";
import { precursive } from "../../precursive";
import { pInt } from "../int/pInt";


export function pindexList<ElemsT extends ConstantableTermType>( elemsT: ElemsT )
: TermFn<[ PList<ToPType<ElemsT>>, PInt ], ToPType<ElemsT>>
{
    return phoist(
        precursive<PList<ToPType<ElemsT>>, PLam<PInt,ToPType<ElemsT>>>(

            pfn(
                [
                    Type.Fn([ Type.List( elemsT ), Type.Int ], elemsT),
                    Type.List( elemsT ),
                    Type.Int
                ],
                elemsT
            )(
                ( self, list, idx ) => 

                    pif( elemsT ).$(

                        pisEmpty.$( list )
                        .strictOr(
                            plessInt.$( idx ).$( pInt( 0 ) ) 
                        )
                        
                    )
                    .then( perror( elemsT, "pindexList" ) )
                    .else(

                        pif( elemsT ).$( pInt( 0 ).eq( idx ) )
                        .then( phead( elemsT ).$( list ) as any )
                        .else(
                            papp(
                                papp(
                                    self,
                                    ptail( elemsT ).$( list )
                                ),
                                pInt( -1 ).add( idx )
                            ) as Term<ToPType<ElemsT>>
                        )

                    )
            )

        )
    )
}
