import type { TermFn, PLam, PBool, PList } from "../../../PTypes";
import { ConstantableTermType, lam, bool, list } from "../../../Term";
import { ToPType } from "../../../Term/Type/ts-pluts-conversion";
import { papp } from "../../papp";
import { pfn } from "../../pfn";
import { phoist } from "../../phoist";
import { plam } from "../../plam";
import { pBool } from "../bool/pBool";


export function pevery<ElemsT extends ConstantableTermType>( elemsT: ElemsT )
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
        // @ts-ignore Type instantiation is excessively deep and possibly infinite.
        (( predicate ) => {

            // @ts-ignore Type instantiation is excessively deep and possibly infinite.
            return precursiveList( bool, elemsT )
            .$(
                plam( lam( list( elemsT ), bool ), bool )
                ( ( _self ) => pBool( true ) )
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
                    ).and(
                        papp(
                            self,
                            rest
                        )
                    )

                )
            )
            // .$( _list )
        })
    ) as any;
}