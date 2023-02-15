import { PAlias } from "../../../PTypes"
import { Term } from "../../../Term"
import { TermType, AliasT, ToPType } from "../../../type_system"
import { UtilityTermOf } from "../../addUtilityForType"


/**
 * basically unwraps the alias until it finds an actual type
**/
type NotUtilityOfAlias<T extends TermType> =
    T extends AliasT<infer ActualT extends TermType> ?
        NotUtilityOfAlias<ActualT> :
        UtilityTermOf<ToPType<T>>

export type TermAlias<T extends TermType> =
    T extends AliasT<infer ActualT extends TermType> ?
        Term<PAlias<ActualT>> & NotUtilityOfAlias<ActualT>:
        Term<PAlias<T>> & NotUtilityOfAlias<T>