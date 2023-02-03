import type { ConstantableTermType, AliasTermType } from "../../Term/Type/base";

export function unwrapAlias<T extends ConstantableTermType>( aliasedType: AliasTermType<symbol, T> ): T
{
    return aliasedType[1].type;
}