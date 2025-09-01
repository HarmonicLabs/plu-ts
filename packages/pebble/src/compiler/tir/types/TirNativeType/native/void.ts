import { ConstType, constT } from "@harmoniclabs/uplc";
import { ITirType } from "../../TirType";

export class TirVoidT
    implements ITirType
{
    clone(): TirVoidT { return new TirVoidT(); }
    isConcrete(): boolean { return true; }
    toString(): string { return "void"; }
    toAstName(): string { return "void"; }
    static toTirTypeKey(): string { return "void"; }
    toTirTypeKey(): string { return TirVoidT.toTirTypeKey(); }
    toConcreteTirTypeName(): string { return this.toTirTypeKey(); }
    hasDataEncoding(): boolean { return true; }
    toUplcConstType(): ConstType { return constT.unit; }
}