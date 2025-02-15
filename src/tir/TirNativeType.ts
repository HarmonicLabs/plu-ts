import { TirAliasType } from "./TirAliasType";
import { TirStructType } from "./TirStructType";
import { TirType } from "./TirType";

export type TirNativeType
    = TirVoidT 
    | TirBoolT
    | TirIntT
    | TirBytesT
    | TirDataT
    | TirOptT<TirType>
    | TirListT<TirType>
    | TirLinearMapT<TirType,TirType>
    | TirFuncT
    | TirSopT
    | TirAsDataT
    ;

export function isTirNativeType( t: any ): t is TirNativeType
{
    return (
        t instanceof TirVoidT 
        || t instanceof TirBoolT
        || t instanceof TirIntT
        || t instanceof TirBytesT
        || t instanceof TirDataT
        || t instanceof TirOptT
        || t instanceof TirListT
        || t instanceof TirLinearMapT
        || t instanceof TirFuncT
        || t instanceof TirSopT
        || t instanceof TirAsDataT
    );
}

export class TirVoidT {}
export class TirBoolT {}
export class TirIntT {}
export class TirBytesT {}
export class TirDataT {}

export class TirOptT<T extends TirType = TirType>
{
    constructor(
        readonly typeArg: T
    ) {}
}

export class TirListT<T extends TirType = TirType>
{
    constructor(
        readonly typeArg: T
    ) {}
}

export class TirLinearMapT<K extends TirType,V extends TirType = TirType>
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

/**
 * compiler utility
 * 
 * indicates that a struct type (or an alias of it)
 * must be represented only as SoP (Sum of Products)
**/
export class TirSopT
{
    constructor(
        readonly typeDef: TirStructType | TirAliasType<TirStructType>
    ) {}
}

/**
 * compiler utility
 * 
 * indicates that a struct type (or an alias of it)
 * must be represented only as data `Constr`
**/
export class TirAsDataT
{
    constructor(
        readonly typeDef: TirStructType | TirAliasType<TirStructType>
    ) {}
}