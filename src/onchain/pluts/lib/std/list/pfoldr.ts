import { TermFn, PFn, PList } from "../../../PTypes";
import { ConstantableTermType, lam, list, fn } from "../../../Term";
import { ToPType } from "../../../Term/Type/ts-pluts-conversion";
import { papp } from "../../papp";
import { pfn } from "../../pfn";
import { phoist } from "../../phoist";
import { plam } from "../../plam";
import { precursiveList } from "./precursiveList";

export function pfoldr<ElemsT extends ConstantableTermType, ResultT extends ConstantableTermType>( elemsT: ElemsT, resultT: ResultT )
: TermFn<[
    PFn<[ ToPType<ElemsT>, ToPType<ResultT> ], ToPType<ResultT>>,
    ToPType<ResultT>,
    PList<ToPType<ElemsT>>
],  ToPType<ResultT>>
{
    const a = elemsT;
    const b = resultT;

    const selfType = lam( list( elemsT ), resultT );

    return phoist(
        pfn([
            fn([ a, b ], b ),
            b
        ],  lam( list( a ), b ))
        (( reduceFunc, accumulator ) => {
            
            return precursiveList( resultT, elemsT )
            .$(
                plam( selfType , resultT )
                ( _foldr => accumulator )
            )
            .$(
                pfn([
                    selfType,
                    elemsT,
                    list( elemsT )
                ],  resultT )
                (( self, head, tail ) =>

                    // compute new result using the result got
                    // AFTER the recursive call on the rest of the list
                    // and the first element of the list
                    papp(
                        reduceFunc,
                        head as any
                    ).$(
                        papp(
                            self,
                            tail
                        )
                    )
                )
            ) as any
        })
    ) as any;
}
