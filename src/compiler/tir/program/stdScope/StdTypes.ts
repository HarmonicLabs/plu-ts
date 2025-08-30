import { TirBoolT } from "../../types/TirNativeType/native/bool"
import { TirBytesT } from "../../types/TirNativeType/native/bytes"
import { TirDataT } from "../../types/TirNativeType/native/data"
import { TirIntT } from "../../types/TirNativeType/native/int"
import { TirLinearMapT } from "../../types/TirNativeType/native/linearMap"
import { TirListT } from "../../types/TirNativeType/native/list"
import { TirDataOptT } from "../../types/TirNativeType/native/Optional/data"
import { TirSopOptT } from "../../types/TirNativeType/native/Optional/sop"
import { TirStringT } from "../../types/TirNativeType/native/string"
import { TirVoidT } from "../../types/TirNativeType/native/void"
import { TirType } from "../../types/TirType"
import { TypedProgram } from "../TypedProgram"

export interface IStdTypes {
    readonly void: TirVoidT
    readonly bool: TirBoolT
    readonly int: TirIntT
    readonly bytes: TirBytesT
    readonly string: TirStringT
    readonly data: TirDataT
    dataOptional: ( arg: TirType ) => (TirType | undefined);
    sopOptional : ( arg: TirType ) => (TirType | undefined);
    list: ( arg: TirType ) => (TirType | undefined);
    linearMap: ( keyT: TirType, valT: TirType ) => (TirType | undefined);
}

export class StdTypes
    implements IStdTypes
{
    readonly void: TirVoidT
    readonly bool: TirBoolT
    readonly int: TirIntT
    readonly bytes: TirBytesT
    readonly string: TirStringT
    readonly data: TirDataT

    constructor(
        readonly program: TypedProgram
    ) {
        this.void = program.types.get( TirVoidT.toTirTypeKey() )!;
        this.bool = program.types.get( TirBoolT.toTirTypeKey() )!;
        this.int = program.types.get( TirIntT.toTirTypeKey() )!;
        this.bytes = program.types.get( TirBytesT.toTirTypeKey() )!;
        this.string = program.types.get( TirStringT.toTirTypeKey() )!;
        this.data = program.types.get( TirDataT.toTirTypeKey() )!;
    }

    dataOptional( arg: TirType ): TirType | undefined
    {
        return this.program.getAppliedGeneric(
            TirDataOptT.toTirTypeKey(),
            [ arg ]
        );
    }

    sopOptional( arg: TirType ): TirType | undefined
    {
        return this.program.getAppliedGeneric(
            TirSopOptT.toTirTypeKey(),
            [ arg ]
        );
    }

    list( arg: TirType ): TirType | undefined
    {
        return this.program.getAppliedGeneric(
            TirListT.toTirTypeKey(),
            [ arg ]
        );
    }

    linearMap( keyT: TirType, valT: TirType ): TirType | undefined
    {
        return this.program.getAppliedGeneric(
            TirLinearMapT.toTirTypeKey(),
            [ keyT, valT ]
        );
    }
}