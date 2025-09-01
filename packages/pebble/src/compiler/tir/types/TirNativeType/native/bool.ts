import { ConstType, constT } from "@harmoniclabs/uplc";
import type { ITirType } from "../../TirType";

export class TirBoolT
    implements ITirType
{
    clone(): TirBoolT { return new TirBoolT(); }
    isConcrete(): boolean { return true; }
    toString(): string { return "boolean"; }
    toAstName(): string { return "boolean"; }
    static toTirTypeKey(): string { return "boolean"; }
    toTirTypeKey(): string { return TirBoolT.toTirTypeKey(); }
    toConcreteTirTypeName(): string { return this.toTirTypeKey(); }
    hasDataEncoding(): boolean { return true; }
    toUplcConstType(): ConstType { return constT.bool; }
}