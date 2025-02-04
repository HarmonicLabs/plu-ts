import { PByteString, PString, TermFn } from "../../PTypes";
import { TermType, ToPType, bool, bs, data, int, list, pair, str, termTypeToString, tyVar, typeExtends, unit } from "../../../type_system";
import { getElemsT } from "../../../type_system/tyArgs";
import { pshowBool } from "./bool";
import { pshowBs } from "./bs";
import { pshowData } from "./data";
import { pshowInt } from "./int";
import { pshowPair } from "./pair";
import { pshowList } from "./list";
import { pshowStr } from "./str";
import { pshowUnit } from "./unit";

export function pshow<T extends TermType>( t: T )
    : TermFn<[ ToPType<T> ], PByteString>
{
    if( typeExtends( t, int  ) ) return pshowInt  as any;
    if( typeExtends( t, bs   ) ) return pshowBs   as any;
    if( typeExtends( t, str  ) ) return pshowStr  as any;
    if( typeExtends( t, unit ) ) return pshowUnit as any;
    if( typeExtends( t, bool ) ) return pshowBool as any;
    if( typeExtends( t, data ) ) return pshowData as any;

    if( typeExtends( t, list( tyVar() ) ) ) return pshowList( getElemsT( t ) ) as any;
    if( typeExtends( t, pair( tyVar(), tyVar() ) ) ) return pshowPair( t as any ) as any;

    throw new Error("missing standard show for type: " + termTypeToString( t ));
}