import { PAlias } from "../../PTypes";
import Term from "../../Term";
import { AliasTermType, ConstantableTermType, ToPType } from "../../Term/Type";
import { UtilityTermOf } from "./addUtilityForType";

type NotUtilityOfAlias<T extends ConstantableTermType> =
    T extends AliasTermType<any,infer ActualT extends ConstantableTermType> ?
        NotUtilityOfAlias<ActualT> :
        UtilityTermOf<ToPType<T>>

type TermAlias<T extends ConstantableTermType, Sym extends symbol = symbol> =
    Term<PAlias<T,Sym>> & NotUtilityOfAlias<T>

export default TermAlias;