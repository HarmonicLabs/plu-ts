import { ConstType, constT } from "@harmoniclabs/uplc";
import { ITirType } from "../../TirType";

export class TirIntT
    implements ITirType
{
    clone(): TirIntT { return new TirIntT(); }
    isConcrete(): boolean { return true; }
    toString(): string { return "int"; }
    toAstName(): string { return "int"; }
    static toTirTypeKey(): string { return "int"; }
    toTirTypeKey(): string { return TirIntT.toTirTypeKey(); }
    toConcreteTirTypeName(): string { return this.toTirTypeKey(); }
    hasDataEncoding(): boolean { return true; }
    toUplcConstType(): ConstType { return constT.int; }
}