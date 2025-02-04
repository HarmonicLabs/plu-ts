import type { TermFn, PLam, PBool, PList } from "../../../PTypes";
import { ToPType, lam, bool, list, TermType } from "../../../../type_system";
import { papp } from "../../papp";
import { pdelay } from "../../pdelay";
import { pfn } from "../../pfn";
import { phoist } from "../../phoist";
import { plam } from "../../plam";
import { pBool } from "../bool/pBool";
import { precursiveList } from "./precursiveList";


export function pevery<ElemsT extends TermType>( elemsT: ElemsT )
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

            return precursiveList( bool, elemsT )
            .$( _self => pdelay( pBool( true ) ) )
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
                    ).and(
                        papp(
                            self,
                            rest
                        )
                    )

                )
            )
            // .$( _list )
        }, "pevery")
    ) as any;
}