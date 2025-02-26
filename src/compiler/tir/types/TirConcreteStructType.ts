import { TirInterfaceImpl } from "./TirInterfaceImpl";
import { TirConcreteType } from "./TirConcreteType";

export class TirConcreteStructType
{
    constructor(
        readonly name: string,
        readonly constructors: TirConcreteStructConstr[],
        readonly impls: TirInterfaceImpl[]
    ) {}

    clone(): TirConcreteStructType
    {
        return new TirConcreteStructType(
            this.name,
            this.constructors.map( c => c.clone() ),
            this.impls.map( i => i.clone() )
        );
    }
}

export class TirConcreteStructConstr
{
    constructor(
        readonly name: string,
        readonly fields: TirConcreteStructField[]
    ) {}

    clone(): TirConcreteStructConstr
    {
        return new TirConcreteStructConstr(
            this.name,
            this.fields.map( f => f.clone() )
        );
    }
}

export class TirConcreteStructField
{
    constructor(
        readonly name: string,
        readonly type: TirConcreteType
    ) {}

    clone(): TirConcreteStructField
    {
        return new TirConcreteStructField(
            this.name,
            this.type.clone()
        );
    }
}