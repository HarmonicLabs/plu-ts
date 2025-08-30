import { ConstType, constT } from "@harmoniclabs/uplc";
import { ITirType } from "../../TirType";

export class TirStringT
    implements ITirType
{
    clone(): TirStringT { return new TirStringT(); }
    isConcrete(): boolean { return true; }
    toString(): string { return "string"; }
    toAstName(): string { return "string"; }
    static toTirTypeKey(): string { return "string"; }
    toTirTypeKey(): string { return TirStringT.toTirTypeKey(); }
    toConcreteTirTypeName(): string { return this.toTirTypeKey(); }
    hasDataEncoding(): boolean { return true; }
    toUplcConstType(): ConstType { return constT.str; }
}