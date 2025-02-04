import { fromAscii } from "@harmoniclabs/uint8array-utils";
import { PByteString } from "../../PTypes";
import { TermFn } from "../../PTypes/PFn/PFn";
import { ToPType } from "../../../type_system/ts-pluts-conversion";
import { clearAsData } from "../../../type_system/tyArgs/clearAsData";
import { getDirectFstT } from "../../../type_system/tyArgs/getDirectFstT";
import { getDirectSndT } from "../../../type_system/tyArgs/getDirectSndT";
import { PairT, TermType, bool, bs, lam } from "../../../type_system/types";
import { pfstPair, psndPair } from "../builtins";
import { pfn } from "../pfn";
import { phoist } from "../phoist";
import { pByteString, pstdEq } from "../std";
import { pshow } from "./pshow";

export function pshowPair<T extends PairT<TermType,TermType>>( t: T )
: TermFn<[ ToPType<T>, ToPType<T> ], PByteString>
{
    const fstT = clearAsData( getDirectFstT( t ) );
    const sndT = clearAsData( getDirectSndT( t ) );

    const pfst = pfstPair( fstT, sndT );
    const psnd = psndPair( fstT, sndT );

    return phoist(
        pfn([
            lam( fstT, bs ),
            lam( sndT, bs ),
            t
        ], bs)
        (( showFst, showSnd, p ) =>
            pByteString( fromAscii("( ") )
            .concat(
                showFst.$( pfst.$( p ) )
            )
            .concat( fromAscii(", ") )
            .concat(
                showSnd.$( psnd.$( p ) )
            )
            .concat( fromAscii(" )") )
        )
    )
    .$( pshow( fstT ) )
    .$( pshow( sndT ) ) as any;
}
