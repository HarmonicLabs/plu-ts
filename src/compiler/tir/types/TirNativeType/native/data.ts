import { ConstType, constT } from "@harmoniclabs/uplc";
import { ITirType } from "../../TirType";

export class TirDataT
    implements ITirType
{
    clone(): TirDataT { return new TirDataT(); }
    isConcrete(): boolean { return true; }
    toString(): string { return "data"; }
    toAstName(): string { return "data"; }
    static toTirTypeKey(): string { return "data"; }
    toTirTypeKey(): string { return TirDataT.toTirTypeKey(); }
    toConcreteTirTypeName(): string { return this.toTirTypeKey(); }
    hasDataEncoding(): boolean { return true; }
    toUplcConstType(): ConstType { return constT.data; }
}