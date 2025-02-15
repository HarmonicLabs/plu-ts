import { TirInterfaceImpl } from "./TirInterfaceImpl";
import { TirType } from "./TirType";
import { TirTypeParam } from "./TirTypeParam";

export class TirAliasType<AliasedT extends TirType = TirType>
{
    constructor(
        readonly name: string,
        readonly tyArgs: TirTypeParam[],
        readonly aliased: AliasedT,
        readonly impls: TirInterfaceImpl[]
    ) {}
}