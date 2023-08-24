import type { PBool } from "../../../PTypes/PBool";
import type { PFn } from "../../../PTypes/PFn/PFn";
import { int, typeExtends, type TermType, type ToPType, bs, str, unit, bool, data } from "../../../type_system";
import { peqBool } from "../../builtins/bool";
import { peqBs } from "../../builtins/bs";
import { peqData } from "../../builtins/data";
import { peqInt } from "../../builtins/int/intBinOpToBool";
import { peqStr } from "../../builtins/str";
import type { UtilityTermOf } from "../UtilityTerms/addUtilityForType";
import { peqUnit } from "../unit/peqUnit";

export function pstdEq<T extends TermType>( t: T ): UtilityTermOf<PFn<[ ToPType<T>, ToPType<T> ], PBool>>
{
    if( typeExtends( t, int ) ) return peqInt as any;
    if( typeExtends( t, bs ) ) return peqBs as any;
    if( typeExtends( t, str ) ) return peqStr as any;
    if( typeExtends( t, unit ) ) return peqUnit as any;
    if( typeExtends( t, bool ) ) return peqBool as any;
    if( typeExtends( t, data ) ) return peqData as any;


} 