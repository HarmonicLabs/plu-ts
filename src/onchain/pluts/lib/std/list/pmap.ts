import type { TermFn, PLam, PList } from "../../../PTypes";
import { ConstantableTermType, fn, lam, list } from "../../../Term";
import { ToPType } from "../../../Term/Type/ts-pluts-conversion";
import { pprepend } from "../../builtins/pprepend";
import { papp } from "../../papp";
import { pfn } from "../../pfn";
import { phoist } from "../../phoist";
import { plam } from "../../plam";
import { pnil } from "./const";
import { pfoldr } from "./pfoldr";



export function pmap<FromT extends ConstantableTermType, ToT extends ConstantableTermType>( fromT: FromT, toT: ToT )
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

        return papp(
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
                            pprepend( toT ).$( papp( mapFunc, elem as any ) )
                        ) 
                    )
                ) 
            )
            .$( f ),
            pnil( toT )
        )
        // .$( _list )
    })
) as any;
}


