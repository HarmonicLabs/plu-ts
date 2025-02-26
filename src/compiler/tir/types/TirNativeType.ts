import { TirConcreteAliasType } from "./TirConcreteAliasType";
import { TirConcreteStructType } from "./TirConcreteStructType";
import { TirConcreteType } from "./TirConcreteType";

export type TirNativeType
    = TirVoidT 
    | TirBoolT
    | TirIntT
    | TirBytesT
    | TirDataT
    | TirOptT<TirConcreteType>
    | TirListT<TirConcreteType>
    | TirLinearMapT<TirConcreteType,TirConcreteType>
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

export class TirVoidT {
    clone(): TirVoidT { return new TirVoidT(); }
}
export class TirBoolT {
    clone(): TirBoolT { return new TirBoolT(); }
}
export class TirIntT {
    clone(): TirIntT { return new TirIntT(); }
}
export class TirBytesT {
    clone(): TirBytesT { return new TirBytesT(); }
}
export class TirDataT {
    clone(): TirDataT { return new TirDataT(); }
}

export class TirOptT<T extends TirConcreteType = TirConcreteType>
{
    constructor(
        readonly typeArg: T
    ) {}

    clone(): TirOptT<T> {
        return new TirOptT(
            this.typeArg.clone()
        ) as TirOptT<T>;
    }
}

export class TirListT<T extends TirConcreteType = TirConcreteType>
{
    constructor(
        readonly typeArg: T
    ) {}

    clone(): TirListT<T> { 
        return new TirListT(
            this.typeArg.clone()
        ) as TirListT<T>;
    }
}

export class TirLinearMapT<K extends TirConcreteType,V extends TirConcreteType = TirConcreteType>
{
    constructor(
        readonly keyTypeArg: K,
        readonly valTypeArg: V
    ) {}

    clone(): TirLinearMapT<K,V> {
        return new TirLinearMapT(
            this.keyTypeArg.clone(),
            this.valTypeArg.clone()
        ) as TirLinearMapT<K,V>;
    }
}

export class TirFuncT
{
    constructor(
        // readonly genericTyArgsName: TirTypeParam[],
        readonly argTypes: TirConcreteType[],
        readonly returnType: TirConcreteType
    ) {}

    clone(): TirFuncT {
        return new TirFuncT(
            this.argTypes.map( t => t.clone() ),
            this.returnType.clone()
        );
    }
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
        readonly typeDef: TirConcreteStructType | TirConcreteAliasType<TirConcreteStructType>
    ) {}

    clone(): TirSopT {
        return new TirSopT(this.typeDef.clone());
    }
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
        readonly typeDef: TirConcreteStructType | TirConcreteAliasType<TirConcreteStructType>
    ) {}

    clone(): TirAsDataT {
        return new TirAsDataT(this.typeDef.clone());
    }
}