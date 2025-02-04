import { PByteString, PList, TermFn } from "../../PTypes";
import { TermType, bs, lam, list } from "../../../type_system/types";
import { pshow } from "./pshow";
import { ToPType } from "../../../type_system";
import { phoist } from "../phoist";
import { pfn } from "../pfn";
import { pfoldl } from "../std/list/pfoldl";
import { fromAscii } from "@harmoniclabs/uint8array-utils";

export function pshowList<ElemsT extends TermType>( elems_t: ElemsT )
    : TermFn<[ PList<ToPType<ElemsT>> ], PByteString>
{
    return phoist(
        pfn([
            lam( elems_t, bs ),
            list( elems_t )
        ],  bs )
        (( pshowElem, lst ) =>
            pfoldl( elems_t, bs )
            .$(( accum, elem ) => 
                accum
                .concat( pshowElem.$( elem as any ) )
                .concat( fromAscii(",") ) 
            )
            .$( fromAscii("[") )
            .$( lst )
            .concat( fromAscii("]") )
        )
    ).$( pshow( elems_t ) )
}