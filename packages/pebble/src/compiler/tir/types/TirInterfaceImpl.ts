import { TirInterfaceType } from "./TirInterfaceType";
import { TirCustomType } from "./TirType";


export class TirInterfaceImpl
{
    constructor(
        /**
         * type that implements the interface
         */
        readonly thisType: TirCustomType,
        /**
         * interface type being implemented
         * 
         * `undefined` for anonymous interfaces
         * eg. `type MyType implements { ... }`
         */
        readonly interfaceType: TirInterfaceType | undefined,
        /**
         * method implementations are
         * compiled as functions external to the type being implemented
         * 
         * here we map the `frontendName`
         * to the external function ast name stored in the scope
         */
        readonly methodImplExternalFunctionName: Map<string, string>
    ) {}

    clone(): TirInterfaceImpl
    {
        return new TirInterfaceImpl(
            this.thisType,
            this.interfaceType?.clone(),
            new Map( this.methodImplExternalFunctionName ),
        );
    }
} 