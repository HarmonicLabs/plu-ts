import { TirType } from "./TirType";

export type TirNativeType
    = TirVoidT 
    | TirBoolT
    | TirNumT
    | TirBytesT
    | TirOptT<TirType>
    | TirListT<TirType>
    | TirLinearMapT<TirType,TirType>
    | TirFuncT
    ;

export function isTirNativeType( t: any ): t is TirNativeType
{
    return (
        t instanceof TirVoidT 
        || t instanceof TirBoolT
        || t instanceof TirNumT
        || t instanceof TirBytesT
        || t instanceof TirOptT
        || t instanceof TirListT
        || t instanceof TirLinearMapT
        || t instanceof TirFuncT
    );
}

export class TirVoidT {}
export class TirBoolT {}
export class TirNumT {}
export class TirBytesT {}

export class TirOptT<T extends TirType>
{
    constructor(
        readonly typeArg: T
    ) {}
}

export class TirListT<T extends TirType>
{
    constructor(
        readonly typeArg: T
    ) {}
}

export class TirLinearMapT<K extends TirType,V extends TirType>
{
    constructor(
        readonly keyTypeArg: K,
        readonly valTypeArg: V
    ) {}
}

export class TirFuncT
{
    constructor(
        // readonly genericTyArgsName: TirTypeParam[],
        readonly argTypes: TirType[],
        readonly returnType: TirType
    ) {}
}