import { PType } from "../../PType";
import { PBool } from "../../PTypes/PBool";
import { PByteString } from "../../PTypes/PByteString";
import { PInt } from "../../PTypes/PInt";
import { PList } from "../../PTypes/PList";
import { PString } from "../../PTypes/PString";
import { Term } from "../../Term";
import { TermBool } from "./TermBool";
import { TermBS } from "./TermBS";
import { TermInt } from "./TermInt";
import { TermList } from "./TermList";
import { TermStr } from "./TermStr";


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