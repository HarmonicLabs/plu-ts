import { TirInterfaceImpl } from "./TirInterfaceImpl";
import { TirConcreteType } from "./TirConcreteType";

export class TirConcreteAliasType<AliasedT extends  TirConcreteType = TirConcreteType>
{
    constructor(
        readonly name: string,
        readonly aliased: AliasedT,
        readonly impls: TirInterfaceImpl[]
    ) {}

    clone(): TirConcreteAliasType<AliasedT>
    {
        return new TirConcreteAliasType(
            this.name,
            this.aliased.clone(),
            this.impls.map( i => i.clone() )
        ) as TirConcreteAliasType<AliasedT>;
    }
}