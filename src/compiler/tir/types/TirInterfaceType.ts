import { TirConcreteType } from "./TirConcreteType";

export class TirInterfaceType
{
    constructor(
        // anonymous interface for custom type methods
        readonly name: string | undefined,
        readonly methods: TirInterfaceMethod[]
    ) {
        for( const method of methods )
        {
            method.parentInterface = this;
        }
    }

    clone(): TirInterfaceType
    {
        return new TirInterfaceType(
            this.name,
            this.methods.map( m => m.clone() )
        );
    }
}

export class TirInterfaceMethod
{
    constructor(
        public parentInterface: TirInterfaceType,
        readonly name: string,
        readonly params: TirConcreteType[],
        readonly returnType: TirConcreteType
    ) {}

    clone(): TirInterfaceMethod
    {
        return new TirInterfaceMethod(
            this.parentInterface,
            this.name,
            this.params.map( p => p.clone() ),
            this.returnType.clone()
        );
    }
}