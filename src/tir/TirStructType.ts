import { TirInterfaceImpl } from "./TirInterfaceImpl";
import { TirType } from "./TirType";

export class TirStructType
{
    constructor(
        readonly name: string,
        readonly constructors: TirStructConstr[],
        readonly impls: TirInterfaceImpl[]
    ) {}
}

export class TirStructConstr
{
    constructor(
        readonly name: string,
        readonly fields: TirStructField[]
    ) {}
}

export class TirStructField
{
    constructor(
        readonly name: string,
        readonly type: TirType
    ) {}
}