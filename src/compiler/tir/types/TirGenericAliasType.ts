import { TirInterfaceImpl } from "./TirInterfaceImpl";
import { TirConcreteType } from "./TirConcreteType";

export class TirGenericAliasType
{
    constructor(
        readonly name: string,
        readonly aliased: TirConcreteType,
        readonly impls: TirInterfaceImpl[]
    ) {}
}