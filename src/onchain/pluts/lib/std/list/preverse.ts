import { TermFn, PList } from "../../../PTypes";
import { ConstantableTermType, list } from "../../../Term";
import { ToPType } from "../../../Term/Type/ts-pluts-conversion";
import { pprepend } from "../../builtins";
import { phoist } from "../../phoist";
import { pflip } from "../combinators/pflip";
import { pnil } from "./const";
import { pfoldl } from "./pfoldl";

export function preverse<ElemsT extends ConstantableTermType>( elemsT: ElemsT )
: TermFn<[ PList<ToPType<ElemsT>> ], PList<ToPType<ElemsT>>>
{
    return phoist(
        pfoldl( elemsT, list( elemsT ) )
        .$( pflip.$( pprepend( elemsT ) ) )
        .$( pnil( elemsT ) )
    ) as any;
}