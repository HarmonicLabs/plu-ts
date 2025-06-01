import { AstFuncName, TirFuncName } from "../../AstCompiler/scope/Scope";
import { TirInterfaceImpl } from "./TirInterfaceImpl";
import { TirType } from "./TirType";

export class TirAliasType<AliasedT extends  TirType = TirType>
{
    constructor(
        readonly name: string,
        readonly fileUid: string,
        readonly aliased: AliasedT,
        /**
         * Maps AstFuncName to TirFuncName for methods defined in this alias type.
         * This is used to resolve method calls on the aliased type.
         * 
         * @type {Map<AstFuncName, TirFuncName>}
         */
        readonly methodsNamesPtr: Map<AstFuncName, TirFuncName>,
    ) {}

    hasDataEncoding(): boolean {
        return this.aliased.hasDataEncoding();
    }

    toTirTypeKey(): string {
        return this.name + "_" + this.fileUid;
    }
    toConcreteTirTypeName(): string {
        return this.toTirTypeKey();
    }

    toString(): string {
        return this.name;
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
            this.fileUid,
            this.aliased.clone(),
            this.methodsNamesPtr
        ) as TirAliasType<AliasedT>;
    }
}