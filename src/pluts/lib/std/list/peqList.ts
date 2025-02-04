import { PBool, PList, TermFn } from "../../../PTypes";
import { ToPType } from "../../../../type_system";
import { TermType, bool, lam, list } from "../../../../type_system/types";
import { pisEmpty } from "../../builtins/list";
import { pfn } from "../../pfn";
import { phoist } from "../../phoist";
import { punsafeConvertType } from "../../punsafeConvertType";
import { pBool } from "../bool/pBool";
import { pstdEq } from "../stdEq/pstdEq";
import { pcompareList } from "./pcompareList";

/**
 * @since v0.5.0
 * @param {TermType} t type of the elements of the list 
 */
export function peqList<ElemsT extends TermType>( t: ElemsT )
: TermFn<[ PList<ToPType<ElemsT>>, PList<ToPType<ElemsT>> ], PBool>
{
    return phoist(
        pcompareList( t, t )
        .$( punsafeConvertType( pisEmpty, lam( list( t ), bool ) ) )
        // if rest second is matched then restFst is not empty
        .$(( _restFst ) => pBool( false ) )
        .$( pstdEq( t ) )
    )
}