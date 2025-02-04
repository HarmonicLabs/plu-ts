import type { PBool } from "../../../PTypes/PBool";
import type { PFn } from "../../../PTypes/PFn/PFn";
import { int, typeExtends, type TermType, type ToPType, bs, str, unit, bool, data, list, tyVar, termTypeToString, pair } from "../../../../type_system";
import { getElemsT } from "../../../../type_system/tyArgs";
import { peqBool } from "../../builtins/bool";
import { peqBs } from "../../builtins/bs";
import { peqData } from "../../builtins/data";
import { peqInt } from "../../builtins/int/intBinOpToBool";
import { peqStr } from "../../builtins/str";
import type { UtilityTermOf } from "../UtilityTerms/addUtilityForType";
import { peqList } from "../list";
import { peqPair } from "../pair/peqPair";
import { peqUnit } from "../unit/peqUnit";

export function pstdEq<T extends TermType>( t: T ): UtilityTermOf<PFn<[ ToPType<T>, ToPType<T> ], PBool>>
{
    if( typeExtends( t, int ) ) return peqInt as any;
    if( typeExtends( t, bs ) ) return peqBs as any;
    if( typeExtends( t, str ) ) return peqStr as any;
    if( typeExtends( t, unit ) ) return peqUnit as any;
    if( typeExtends( t, bool ) ) return peqBool as any;
    if( typeExtends( t, data ) ) return peqData as any;

    if( typeExtends( t, list( tyVar() ) ) ) return peqList( getElemsT( t ) ) as any;
    if( typeExtends( t, pair( tyVar(), tyVar() ) ) ) return peqPair( t as any ) as any;

    throw new Error("missing standard equality for type: " + termTypeToString( t ));
} 