import { getAppliedTypeInternalName } from "../../AstCompiler/scope/Scope";
import { TirInterfaceImpl } from "./TirInterfaceImpl";
import { TirType } from "./TirType";

export class TirAliasType<AliasedT extends  TirType = TirType>
{
    constructor(
        readonly name: string,
        readonly aliased: AliasedT,
        readonly impls: TirInterfaceImpl[]
    ) {}

    toString(): string {
        return this.name;
    }

    toInternalName(): string {
        return getAppliedTypeInternalName(
            "Alias",
            [ this.aliased.toInternalName() ]
        );
    }

    private _isConcrete: boolean | undefined = undefined;
    isConcrete(): boolean {
        if( typeof this._isConcrete !== "boolean" )
            this._isConcrete = this.aliased.isConcrete();
        return this._isConcrete;
    }

    clone(): TirAliasType<AliasedT>
    {
        return new TirAliasType(
            this.name,
            this.aliased.clone(),
            this.impls.map( i => i.clone() )
        ) as TirAliasType<AliasedT>;
    }
}