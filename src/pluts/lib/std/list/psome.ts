import { TermFn, PLam, PBool, PList } from "../../../PTypes";
import { Term } from "../../../Term";
import { TermType, ToPType, lam, bool, list, delayed } from "../../../../type_system";
import { papp } from "../../papp";
import { pdelay } from "../../pdelay";
import { pfn } from "../../pfn";
import { phoist } from "../../phoist";
import { plam } from "../../plam";
import { pBool } from "../bool/pBool";
import { precursiveList } from "./precursiveList";



export function psome<ElemsT extends TermType>( elemsT: ElemsT )
: TermFn<[ PLam<ToPType<ElemsT>,PBool>, PList<ToPType<ElemsT>> ], PBool>
{
return phoist(
    plam(
        lam( elemsT, bool ),
        lam(
            list( elemsT ),
            bool
        )
    )
    (( predicate ) => {

        return precursiveList( bool , elemsT )
        .$(
            plam( lam( list( elemsT ), bool ), delayed( bool ) )
            ( _self => pdelay( pBool( false ) ) )
        )
        .$(
            pfn([
                lam( list( elemsT ), bool ),
                elemsT,
                list( elemsT )
            ],  bool )
            (( self, head, rest ) =>

                papp(
                    predicate,
                    head
                ).or(
                    papp(
                        self,
                        rest
                    )
                )

            ) as Term<PLam<PLam<PList<ToPType<ElemsT>>, PBool>, PLam<ToPType<ElemsT>, PLam<PList<ToPType<ElemsT>>, PBool>>>>
        )
        // .$( _list )
    }, "psome")
) as any;
}
