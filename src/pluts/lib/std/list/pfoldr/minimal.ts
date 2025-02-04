import { TermFn, PFn, PList } from "../../../../PTypes";
import { TermType, ToPType, lam, list, fn, delayed } from "../../../../../type_system";
import { pdelay } from "../../../pdelay";
import { pfn } from "../../../pfn";
import { phoist } from "../../../phoist";
import { plam } from "../../../plam";
import { _papp } from "../../data/conversion/minimal_common";
import { _precursiveList } from "../precursiveList/minimal";

export function _pfoldr<ElemsT extends TermType, ResultT extends TermType>( elemsT: ElemsT, resultT: ResultT )
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

            return _papp(
                _papp(
                    _precursiveList( resultT, elemsT ),
                    plam( selfType , delayed( resultT ) )
                    ( _foldr => pdelay( accumulator ) )
                ),
                pfn([
                    selfType,
                    elemsT,
                    list( elemsT )
                ],  resultT )
                (( self, head, tail ) =>

                    // compute new result using the result got
                    // AFTER the recursive call on the rest of the list
                    // and the first element of the list
                    _papp(
                        _papp(
                            reduceFunc,
                            head as any
                        ),
                        _papp(
                            self,
                            tail
                        )
                    )
                )
            ) as any;
        }, "_pfoldr")
    ) as any;
}
