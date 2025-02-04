import type { TermFn, PList, PInt, PLam } from "../../../PTypes";
import { Term } from "../../../Term";
import { TermType, ToPType, fn, int, list } from "../../../../type_system";
import { pif } from "../../builtins/bool";
import { pisEmpty, ptail, phead } from "../../builtins/list";
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
        pfn([
            list( elemsT ),
            int
        ],elemsT)
        (( list, idx ) => pdropList( elemsT ).$( list ).$( idx ).head,
            "pindexList"
        )
    ) as TermFn<[ PList<ToPType<ElemsT>>, PInt ], ToPType<ElemsT>>
}

export function pdropList<ElemsT extends TermType>( elemsT: ElemsT )
: TermFn<[ PList<ToPType<ElemsT>>, PInt ], PList<ToPType<ElemsT>>>
{
    return phoist(
        precursive<PList<ToPType<ElemsT>>, PLam<PInt,PList<ToPType<ElemsT>>>>(

            pfn([
                fn([list( elemsT ), int ], list( elemsT )),
                list( elemsT ),
                int
            ],list( elemsT ))
            (( self, lst, idx ) => 
                pif( list( elemsT ) ).$( pInt( 0 ).eq( idx ) )
                .then( lst as any )
                .else(
                    papp(
                        papp(
                            self,
                            ptail( elemsT ).$( lst )
                        ),
                        pInt( -1 ).add( idx )
                    ) as Term<PList<ToPType<ElemsT>>>
                ),
                "pdropList"
            ) as any

        )
    )
}