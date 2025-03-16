import { isObject } from "@harmoniclabs/obj-utils";
import { getAppliedTypeInternalName } from "../../AstCompiler/scope/Scope";
import { TirType } from "./TirType";

export type TirNativeType
    = TirVoidT 
    | TirBoolT
    | TirIntT
    | TirBytesT
    | TirStringT
    | TirDataT
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
        || t instanceof TirIntT
        || t instanceof TirBytesT
        || t instanceof TirStringT
        || t instanceof TirDataT
        || t instanceof TirOptT
        || t instanceof TirListT
        || t instanceof TirLinearMapT
        || t instanceof TirFuncT
    );
}

export type TirNamedDestructableNativeType
    = TirDataT
    | TirOptT<TirType>
    ;

export function isTirNamedDestructableNativeType( t: any ): t is TirNamedDestructableNativeType
{
    return isObject( t ) && (
        t instanceof TirDataT
        || t instanceof TirOptT
    );
}

export class TirVoidT {
    clone(): TirVoidT { return new TirVoidT(); }
    isConcrete(): boolean { return true; }
    toString(): string { return "void"; }
    toInternalName(): string { return "void"; }
}
export class TirBoolT {
    clone(): TirBoolT { return new TirBoolT(); }
    isConcrete(): boolean { return true; }
    toString(): string { return "boolean"; }
    toInternalName(): string { return "boolean"; }
}
export class TirIntT {
    clone(): TirIntT { return new TirIntT(); }
    isConcrete(): boolean { return true; }
    toString(): string { return "int"; }
    toInternalName(): string { return "int"; }
}
export class TirBytesT {
    clone(): TirBytesT { return new TirBytesT(); }
    isConcrete(): boolean { return true; }
    toString(): string { return "bytes"; }
    toInternalName(): string { return "bytes"; }
}
export class TirStringT {
    clone(): TirStringT { return new TirStringT(); }
    isConcrete(): boolean { return true; }
    toString(): string { return "string"; }
    toInternalName(): string { return "string"; }
}
export class TirDataT {
    clone(): TirDataT { return new TirDataT(); }
    isConcrete(): boolean { return true; }
    toString(): string { return "data"; }
    toInternalName(): string { return "data"; }
}

export class TirOptT<T extends TirType = TirType>
{
    constructor(
        readonly typeArg: T
    ) {}

    toString(): string {
        return `Optional<${this.typeArg.toString()}>`;
    }

    toInternalName(): string {
        return getAppliedTypeInternalName(
            "Optional",
            [ this.typeArg.toInternalName() ]
        )
    }

    private _isConcrete: boolean | undefined = undefined;
    isConcrete(): boolean {
        if( typeof this._isConcrete !== "boolean" )
            this._isConcrete = this.typeArg.isConcrete();
        return this._isConcrete;
    }

    clone(): TirOptT<T> {
        const result = new TirOptT(
            this.typeArg.clone()
        ) as TirOptT<T>;
        result._isConcrete = this._isConcrete;
        return result;
    }
}

export class TirListT<T extends TirType = TirType>
{
    constructor(
        readonly typeArg: T
    ) {}

    toString(): string {
        return `List<${this.typeArg.toString()}>`;
    }

    toInternalName(): string {
        return getAppliedTypeInternalName(
            "List",
            [ this.typeArg.toInternalName() ]
        )
    }

    private _isConcrete: boolean | undefined = undefined;
    isConcrete(): boolean {
        if( typeof this._isConcrete !== "boolean" )
            this._isConcrete = this.typeArg.isConcrete();
        return this._isConcrete;
    }

    clone(): TirListT<T> { 
        const result = new TirListT(
            this.typeArg.clone()
        ) as TirListT<T>;
        result._isConcrete = this._isConcrete;
        return result;
    }
}

/**
 * TODO:
 * 
 * add in native types and export class 
 */
class TirLinearMapEntry<K extends TirType,V extends TirType = TirType>
{
    constructor(
        readonly keyTypeArg: K,
        readonly valTypeArg: V
    ) {}

    toString(): string {
        return `LinearMapEntry<${this.keyTypeArg.toString()},${this.valTypeArg.toString()}>`;
    }

    toInternalName(): string {
        return getAppliedTypeInternalName(
            "LinearMapEntry",
            [ this.keyTypeArg.toInternalName(), this.valTypeArg.toInternalName() ]
        );
    }

    private _isConcrete: boolean | undefined = undefined;
    isConcrete(): boolean {
        if( typeof this._isConcrete !== "boolean" )
            this._isConcrete = (
                this.keyTypeArg.isConcrete()
                && this.valTypeArg.isConcrete()
            );
        return this._isConcrete;
    }

    clone(): TirLinearMapEntry<K,V> {
        const result = new TirLinearMapEntry(
            this.keyTypeArg.clone(),
            this.valTypeArg.clone()
        ) as TirLinearMapEntry<K,V>;
        result._isConcrete = this._isConcrete;
        return result;
    }
}

export class TirLinearMapT<K extends TirType = TirType,V extends TirType = TirType>
{
    constructor(
        readonly keyTypeArg: K,
        readonly valTypeArg: V
    ) {}

    toString(): string {
        return `LinearMap<${this.keyTypeArg.toString()},${this.valTypeArg.toString()}>`;
    }

    toInternalName(): string {
        return getAppliedTypeInternalName(
            "LinearMap",
            [ this.keyTypeArg.toInternalName(), this.valTypeArg.toInternalName() ]
        );
    }

    private _isConcrete: boolean | undefined = undefined;
    isConcrete(): boolean {
        if( typeof this._isConcrete !== "boolean" )
            this._isConcrete = (
                this.keyTypeArg.isConcrete()
                && this.valTypeArg.isConcrete()
            );
        return this._isConcrete;
    }

    clone(): TirLinearMapT<K,V> {
        const result = new TirLinearMapT(
            this.keyTypeArg.clone(),
            this.valTypeArg.clone()
        ) as TirLinearMapT<K,V>;
        result._isConcrete = this._isConcrete;
        return result;
    }
}

export class TirFuncT
{
    constructor(
        // readonly genericTyArgsName: TirTypeParam[],
        readonly argTypes: TirType[],
        readonly returnType: TirType
    ) {}

    toString(): string {
        return `(${this.argTypes.map( t => t.toString() ).join(",")}) => ${this.returnType.toString()}`;
    }

    toInternalName(): string {
        return getAppliedTypeInternalName(
            "Func",
            [
                ...this.argTypes.map( t => t.toInternalName() ),
                this.returnType.toInternalName()
            ]
        );
    }

    private _isConcrete: boolean | undefined = undefined;
    isConcrete(): boolean {
        if( typeof this._isConcrete !== "boolean" )
            this._isConcrete = (
                this.argTypes.every( t => t.isConcrete() )
                && this.returnType.isConcrete()
            );
        return this._isConcrete;
    }

    clone(): TirFuncT {
        const result = new TirFuncT(
            this.argTypes.map( t => t.clone() ),
            this.returnType.clone()
        );
        result._isConcrete = this._isConcrete;
        return result;
    }
}