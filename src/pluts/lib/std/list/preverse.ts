import { TermFn, PList } from "../../../PTypes";
import { TermType, ToPType, list } from "../../../../type_system";
import { pprepend } from "../../builtins/pprepend";
import { phoist } from "../../phoist";
import { pflip } from "../combinators/pflip";
import { pnil } from "./const";
import { pfoldl } from "./pfoldl";

export function preverse<ElemsT extends TermType>( elemsT: ElemsT )
: TermFn<[ PList<ToPType<ElemsT>> ], PList<ToPType<ElemsT>>>
{
    return phoist(
        pfoldl( elemsT, list( elemsT ) )
        .$(
            pflip( list( elemsT ), elemsT, list( elemsT ) )
            .$( pprepend( elemsT ) )
        )
        .$( pnil( elemsT ) )
    );
}