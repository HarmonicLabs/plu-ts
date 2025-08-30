import { ConstType, constT } from "@harmoniclabs/uplc";
import { ITirType } from "../../TirType";

export class TirBytesT
    implements ITirType
{
    clone(): TirBytesT { return new TirBytesT(); }
    isConcrete(): boolean { return true; }
    toString(): string { return "bytes"; }
    toAstName(): string { return "bytes"; }
    static toTirTypeKey(): string { return "bytes"; }
    toTirTypeKey(): string { return TirBytesT.toTirTypeKey(); }
    toConcreteTirTypeName(): string { return this.toTirTypeKey(); }
    hasDataEncoding(): boolean { return true; }
    toUplcConstType(): ConstType { return constT.byteStr; }
}