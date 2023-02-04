import type { TermFn, PLam, PBool, PList } from "../../../PTypes";
import { ConstantableTermType, lam, bool, list } from "../../../Term";
import { ToPType } from "../../../Term/Type/ts-pluts-conversion";
import { pif } from "../../builtins";
import { pfn } from "../../pfn";
import { phoist } from "../../phoist";
import { plam } from "../../plam";
import { pnil } from "./const";
import { pfoldr } from "./pfoldr";



export function pfilter<ElemsT extends ConstantableTermType>( elemsT: ElemsT )
: TermFn<[ PLam<ToPType<ElemsT>,PBool>, PList<ToPType<ElemsT>> ], PList<ToPType<ElemsT>>>
{
return phoist(
    plam(
        lam( elemsT, bool ),
        lam(
            list( elemsT ),
            list( elemsT )
        )
    )(( predicate ) => 
        
        pfoldr( elemsT, list( elemsT ) )
        .$(
            pfn([
                elemsT,
                list( elemsT )
            ],  list( elemsT ))
            (( elem, accum ) =>
                pif( list(elemsT) ).$(
                    // @ts-ignore Type instantiation is excessively deep and possibly infinite.
                    papp( predicate, elem )
                )
                .then( accum.prepend( elem ) )
                .else( accum )
            )
        ).$( pnil( elemsT ) ) as any
        // .$( lst )

    )
) as any;
}