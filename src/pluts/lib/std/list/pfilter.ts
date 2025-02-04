import type { TermFn, PLam, PBool, PList } from "../../../PTypes";
import { TermType, ToPType, lam, bool, list } from "../../../../type_system";
import { pif } from "../../builtins/bool";
import { papp } from "../../papp";
import { pfn } from "../../pfn";
import { phoist } from "../../phoist";
import { plam } from "../../plam";
import { pnil } from "./const";
import { pfoldr } from "./pfoldr";


export function pfilter<ElemsT extends TermType>( elemsT: ElemsT )
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
                    papp( predicate, elem )
                )
                .then( accum.prepend( elem ) )
                .else( accum )
            )
        ).$( pnil( elemsT ) ) as any
        // .$( lst )
        , "pfilter"

    )
) as any;
}