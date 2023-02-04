import type { TermFn, PLam, PList } from "../../../PTypes";
import { ConstantableTermType, lam, list } from "../../../Term";
import { ToPType } from "../../../Term/Type/ts-pluts-conversion";
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
    // @ts-ignore Type instantiation is excessively deep and possibly infinite.
    (( f ) => {

        return pfoldr( fromT, list( toT ) )
        .$(
            pfn([
                fromT,
                list( toT )
            ],  list( toT ))
            ( (elem, accum) =>
                accum.prepend( papp( f, elem as any ) )
            ) 
        )
        .$( pnil( toT ) )
        // .$( _list )
    })
) as any;
}
