import { TirInterfaceType } from "./TirInterfaceType";
import { TirConcreteCustomType } from "./TirConcreteType";


export class TirInterfaceImpl
{
    constructor(
        readonly targetType: TirConcreteCustomType,
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