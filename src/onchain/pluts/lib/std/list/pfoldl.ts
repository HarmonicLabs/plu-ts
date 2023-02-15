import { TermFn, PFn, PList } from "../../../PTypes";
import { TermType, ToPType, fn, list, lam } from "../../../type_system";
import { papp } from "../../papp";
import { pfn } from "../../pfn";
import { phoist } from "../../phoist";
import { plam } from "../../plam";
import { precursive } from "../../precursive";

export function pfoldl<ElemsT extends TermType, ResultT extends TermType>( elemsT: ElemsT, resultT: ResultT )
: TermFn<[
    PFn<[ ToPType<ResultT>, ToPType<ElemsT> ], ToPType<ResultT>>,
    ToPType<ResultT>,
    PList<ToPType<ElemsT>>
],  ToPType<ResultT>>
{
    const a = elemsT;
    const b = resultT;

    const recursivePartType = fn([
        b,
        list( a )
    ],  b);

    return phoist(
        plam(
            fn([ b, a ], b ),
            recursivePartType
        )
        (( reduceFunc ) =>

            precursive(
                pfn([
                    recursivePartType,
                    b
                ],  lam( list( a ), b ))
                (( self, accum ) => 

                    // @ts-ignore Type instantiation is excessively deep and possibly infinite.
                    pmatchList( b, a )
                    .$( accum )
                    .$(
                        pfn([ a, list( a ) ], b )
                        (( head, tail ) =>
                            papp(
                                // @ts-ignore Type instantiation is excessively deep and possibly infinite.
                                papp(
                                    self,
                                    // compute new accumulator
                                    // BEFORE the rest of the list
                                    papp(
                                        reduceFunc,
                                        accum as any
                                    ).$(
                                        head
                                    )
                                ),
                                tail
                            ) as any
                        )
                    ) as any
                    // .$( lst )
                )
            ) as any

        )
    ) as any;
}
