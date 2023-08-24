import { PBool, PList, TermFn } from "../../../PTypes";
import { ToPType } from "../../../type_system";
import { TermType, bool, list } from "../../../type_system/types";
import { pfn } from "../../pfn";
import { phoist } from "../../phoist";

/**
 * @since v0.5.0
 * @param {TermType} t type of the elements of the list 
 */
export function peqList<T extends TermType>( t: T )
: TermFn<[ PList<ToPType<T>>, PList<ToPType<T>> ], PBool>
{
    return phoist(
        pfn([ list( t ), list( t ) ], bool)
        (( a, b ) => {

        })
    )
}