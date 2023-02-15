import { TermFn, PLam, PBool, PList } from "../../../PTypes";
import { TermType, ToPType, lam, bool, list, delayed } from "../../../type_system";
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
    // @ts-ignore
    (( predicate ) => {

        return precursiveList( bool , elemsT )
        .$(
            plam( lam( list( elemsT ), bool ), delayed( bool ) )
            ( _self => pdelay( pBool( true ) ) ) as any
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
                    head as any
                ).or(
                    papp(
                        self,
                        rest
                    )
                )

            ) as any
        )
        // .$( _list )
    })
) as any;
}
