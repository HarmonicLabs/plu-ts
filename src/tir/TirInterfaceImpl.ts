import { TirInterfaceType } from "./TirInterfaceType";
import { TirCustomType } from "./TirType";


export class TirInterfaceImpl
{
    constructor(
        readonly targetType: TirCustomType,
        readonly interf: TirInterfaceType
    ) {}
} 