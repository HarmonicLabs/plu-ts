import { ConstantableTermType, Alias } from "../../Term/Type";

export default function unwrapAlias<T extends ConstantableTermType>( aliasedType: Alias<symbol, T> ): T
{
    return aliasedType[1].type;
}