import type { TermFn, PLam, PList } from "../../../../PTypes";
import { TermType, ToPType, fn, lam, list } from "../../../../../type_system";
import { pprepend } from "../../../builtins/pprepend";
import { papp } from "../../../papp";
import { phoist } from "../../../phoist";
import { plam } from "../../../plam";
import { _papp } from "../../data/conversion/minimal_common";
import { pnil } from "../const";
import { pfoldr } from "../pfoldr";


export function pmap<FromT extends TermType, ToT extends TermType>( fromT: FromT, toT: ToT )
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
                phoist(
                    plam(
                        lam( fromT, toT ),
                        fn([ list( toT ), list( fromT )], list( toT ))
                    )
                    ( mapFunc =>
                        pfoldr( fromT, list( toT ) )
                        .$(
                            plam(
                                fromT,
                                lam( 
                                    list( toT ),
                                    list( toT )
                                )
                            )
                            ( (elem) =>
                                _papp(
                                    pprepend( toT ),
                                    papp( mapFunc, elem as any )
                                )
                            ) 
                        )
                    ) 
                )
                .$( f ),
                pnil( toT )
            )
            // .$( _list )
        }, "pmap")
    ) as any;
}


