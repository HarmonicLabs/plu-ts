import type { TermFn, PLam, PList } from "../../../../PTypes";
import { TermType, ToPType, fn, lam, list } from "../../../../../type_system";
import { _pprepend } from "../../../builtins/pprepend/minimal";
import { phoist } from "../../../phoist";
import { plam } from "../../../plam";
import { _papp } from "../../data/conversion/minimal_common";
import { _pnil } from "../const/minimal";
import { _pfoldr } from "../pfoldr/minimal";


export function _pmap<FromT extends TermType, ToT extends TermType>( fromT: FromT, toT: ToT )
: TermFn<[ PLam<ToPType<FromT>, ToPType<ToT>>, PList<ToPType<FromT>> ], PList<ToPType<ToT>>>
{
    return phoist(
        plam(
            lam( fromT, toT ),
            lam(
                list( fromT ),
                list( toT )
            )
        )
        (( f ) => {

            return _papp(
                _papp(
                    phoist(
                        plam(
                            lam( fromT, toT ),
                            fn([ list( toT ), list( fromT )], list( toT ))
                        )
                        ( mapFunc =>
                            _papp(
                                _pfoldr( fromT, list( toT ) ),
                                plam(
                                    fromT,
                                    lam( 
                                        list( toT ),
                                        list( toT )
                                    )
                                )
                                ( (elem) =>
                                    _papp(
                                        _pprepend( toT ) as any,
                                        _papp( mapFunc, elem as any )
                                    )
                                ) 
                            )
                        ) 
                    ) as any,
                    f
                ) as any,
                _pnil( toT )
            )
            // .$( _list )
        }, "pmap")
    ) as any;
}