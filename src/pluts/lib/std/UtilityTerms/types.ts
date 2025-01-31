import type { PType } from "../../../PType";
import type { PInt, PBool, PByteString, PString, PList } from "../../../PTypes";
import type { Term } from "../../../Term";
import type { TermBS } from "./TermBS";
import type { TermBool } from "./TermBool";
import type { TermInt } from "./TermInt";
import type { TermList } from "./TermList";
import type { TermStr } from "./TermStr";

export type PTypeWithUtility
    = PInt
    | PBool
    | PByteString
    | PString
    | PList<PType>;

export type UtilityFromPType<PT extends PTypeWithUtility> =
    PT extends PInt ? TermInt :
    PT extends PBool ? TermBool :
    PT extends PByteString ? TermBS :
    PT extends PString ? TermStr :
    PT extends PList<infer PElemsT extends PType> ? TermList<PElemsT> :
    never

export type UtitlityFromTerm<UtilityTerm extends Term<PTypeWithUtility>>
    = UtilityTerm extends Term<infer UtilityPType extends PTypeWithUtility> ?
        UtilityFromPType<UtilityPType> : never;

/**
 * @deprecated use `UtilityTermOf` instead
 */
export type TryUtitlityFromPType<PT extends PType>
    = PT extends infer UtilityPType extends PTypeWithUtility ?
        UtilityFromPType<UtilityPType> :
        Term<PT>; // return the term  with the same PType if it doesn't have utilites

export type TryUtitlityFromTerm<UtilityTerm extends Term<PType>>
    = UtilityTerm extends Term<infer UtilityPType extends PTypeWithUtility> ?
        UtilityFromPType<UtilityPType> :
        UtilityTerm; // return the same term if it doesn't have utilites