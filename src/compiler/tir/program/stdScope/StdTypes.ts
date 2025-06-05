import { AstScope } from "../../../AstCompiler/scope/AstScope"
import { TirVoidT, TirBoolT, TirIntT, TirBytesT, TirStringT, TirDataT, TirDataOptT, TirSopOptT, TirListT, TirLinearMapT } from "../../types/TirNativeType"
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