import { PType } from "../../../PType";
import type { TermFn, PLam, PBool, PList } from "../../../PTypes";
import { Term } from "../../../Term";
import { ToPType, lam, bool, list, TermType } from "../../../type_system";
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
        // @ts-ingore
        ((( predicate: Term<PLam<PType, PType>> ) => {

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
                    // @ts-ignore
                    ).and(
                        papp(
                            self,
                            rest
                        )
                    )

                ) as any
            )
            // .$( _list )
        }) as any)
    ) as any;
}