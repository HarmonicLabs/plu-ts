import { TirType } from "./TirType";
import { TirTypeParam } from "./TirTypeParam";

export class TirInterfaceType
{
    constructor(
        // anonymos interface for custom type methods
        readonly name: string | undefined,
        readonly typeParams: TirTypeParam[],
        readonly methods: TirInterfaceMethod[]
    ) {
        for( const method of methods )
        {
            method.parentInterface = this;
        }
    }
}

export class TirInterfaceMethod
{
    constructor(
        public parentInterface: TirInterfaceType,
        readonly name: string,
        readonly params: TirType[],
        readonly returnType: TirType
    ) {}
}