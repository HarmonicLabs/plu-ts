import { PBool, TermFn } from "../../../PTypes";
import { PairT, TermType, ToPType, bool } from "../../../../type_system";
import { getDirectFstT } from "../../../../type_system/tyArgs/getDirectFstT";
import { getDirectSndT } from "../../../../type_system/tyArgs/getDirectSndT";
import { pfn } from "../../pfn";
import { pfstPairNoUnwrap, psndPairNoUnwrap } from "../../builtins/pair/noUnwrap";
import { pstdEq } from "../stdEq/pstdEq";
import { phoist } from "../../phoist";

export function peqPair<T extends PairT<TermType,TermType>>( t: T )
: TermFn<[ ToPType<T>, ToPType<T> ], PBool>
{
    const fstT = getDirectFstT( t );
    const sndT = getDirectSndT( t );

    const pfst = pfstPairNoUnwrap( fstT, sndT );
    const psnd = psndPairNoUnwrap( fstT, sndT );

    return phoist(
        pfn([ t, t ], bool)
        (( a, b ) =>
            pstdEq( fstT ).$( pfst.$( a ) ).$( pfst.$( b ) )
            .and(
                pstdEq( sndT ).$( psnd.$( a ) ).$( psnd.$( b ) )
            )
        )
    );
}
