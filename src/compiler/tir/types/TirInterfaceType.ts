import { TirFuncT } from "./TirNativeType";

/**
 * represents interface declaraions
 */
export class TirInterfaceType
{
    constructor(
        // anonymous interface for custom type methods
        readonly name:  string,
        readonly methods: TirInterfaceMethod[]
    ) {
    }

    clone(): TirInterfaceType
    {
        return new TirInterfaceType(
            this.name,
            this.methods.map( m => m.clone() )
        );
    }
}

/**
 * only represents the method signature declared in the interface
 * 
 * this is not the method implementation
 */
export class TirInterfaceMethod
{
    constructor(
        /**
         * method name used by the developer
         */
        readonly frontendName: string,
        readonly funcSingature: TirFuncT,
    ) {}

    clone(): TirInterfaceMethod
    {
        return new TirInterfaceMethod(
            this.frontendName,
            this.funcSingature.clone()
        );
    }
}