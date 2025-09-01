import { ConstType } from "@harmoniclabs/uplc";
import { ITirType, TirType } from "../../TirType";

export class TirFuncT
    implements ITirType
{
    constructor(
        // readonly genericTyArgsName: TirTypeParam[],
        readonly argTypes: TirType[],
        readonly returnType: TirType
    ) {}

    hasDataEncoding(): boolean { return false; }

    toTirTypeKey(): string {
        return "func_" + this.argTypes.map( t => t.toConcreteTirTypeName() ).join("_") + "_" + this.returnType.toConcreteTirTypeName();
    }
    toConcreteTirTypeName(): string {
        return this.toTirTypeKey();
    }

    toAstName(): string {
        return this.toTirTypeKey();
    }

    toString(): string {
        return `(${this.argTypes.map( t => t.toString() ).join(",")}) => ${this.returnType.toString()}`;
    }

    private _isConcrete: boolean | undefined = undefined;
    isConcrete(): boolean {
        if( typeof this._isConcrete !== "boolean" )
            this._isConcrete = (
                this.argTypes.every( t => t.isConcrete() )
                && this.returnType.isConcrete()
            );
        return this._isConcrete ?? false;
    }

    clone(): TirFuncT {
        const result = new TirFuncT(
            this.argTypes.map( t => t.clone() ),
            this.returnType.clone()
        );
        result._isConcrete = this._isConcrete;
        return result;
    }

    toUplcConstType(): ConstType {
        throw new Error("TirFuncT cannot be represented as uplc const type");
    }
}