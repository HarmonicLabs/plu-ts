import { TirInterfaceImpl } from "./TirInterfaceImpl";
import { TirType } from "./TirType";
import { TirTypeParam } from "./TirTypeParam";

export class TirAliasType
{
    constructor(
        readonly name: string,
        readonly tyArgs: TirTypeParam[],
        readonly aliased: TirType,
        readonly impls: TirInterfaceImpl[]
    ) {}
}