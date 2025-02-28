import { TirInterfaceType } from "./TirInterfaceType";
import { TirCustomType } from "./TirType";


export class TirInterfaceImpl
{
    constructor(
        readonly targetType: TirCustomType,
        readonly interf: TirInterfaceType
    ) {}

    clone(): TirInterfaceImpl
    {
        return new TirInterfaceImpl(
            this.targetType,
            this.interf.clone()
        );
    }
} 