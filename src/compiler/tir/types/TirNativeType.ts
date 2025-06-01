import { TirType } from "./TirType";
import { getAppliedTirTypeName } from "../program/TirProgram";

export type TirNamedDestructableNativeType
    = TirDataT
    | TirDataOptT<TirType>
    | TirSopOptT<TirType>
    | TirListT<TirType>
    | TirLinearMapT<TirType,TirType>
    ;

export function isTirNamedDestructableNativeType( t: any ): t is TirNamedDestructableNativeType
{
    return (
        t instanceof TirDataT
        || t instanceof TirDataOptT
        || t instanceof TirSopOptT
        || t instanceof TirListT
        || t instanceof TirLinearMapT
    );
}

export type TirNativeType
    = TirVoidT
    | TirBoolT
    | TirIntT
    | TirBytesT
    | TirStringT
    | TirDataT
    | TirDataOptT<TirType>
    | TirSopOptT<TirType>
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
        || t instanceof TirDataOptT
        || t instanceof TirSopOptT
        || t instanceof TirListT
        || t instanceof TirLinearMapT
        || t instanceof TirFuncT // =>
    );
}

export class TirVoidT {
    clone(): TirVoidT { return new TirVoidT(); }
    isConcrete(): boolean { return true; }
    toString(): string { return "void"; }
    static toTirTypeKey(): string { return "void"; }
    toTirTypeKey(): string { return TirVoidT.toTirTypeKey(); }
    toConcreteTirTypeName(): string { return this.toTirTypeKey(); }
    hasDataEncoding(): boolean { return true; }
}
export class TirBoolT {
    clone(): TirBoolT { return new TirBoolT(); }
    isConcrete(): boolean { return true; }
    toString(): string { return "boolean"; }
    static toTirTypeKey(): string { return "boolean"; }
    toTirTypeKey(): string { return TirBoolT.toTirTypeKey(); }
    toConcreteTirTypeName(): string { return this.toTirTypeKey(); }
    hasDataEncoding(): boolean { return true; }
}
export class TirIntT {
    clone(): TirIntT { return new TirIntT(); }
    isConcrete(): boolean { return true; }
    toString(): string { return "int"; }
    static toTirTypeKey(): string { return "int"; }
    toTirTypeKey(): string { return TirIntT.toTirTypeKey(); }
    toConcreteTirTypeName(): string { return this.toTirTypeKey(); }
    hasDataEncoding(): boolean { return true; }
}
export class TirBytesT {
    clone(): TirBytesT { return new TirBytesT(); }
    isConcrete(): boolean { return true; }
    toString(): string { return "bytes"; }
    static toTirTypeKey(): string { return "bytes"; }
    toTirTypeKey(): string { return TirBytesT.toTirTypeKey(); }
    toConcreteTirTypeName(): string { return this.toTirTypeKey(); }
    hasDataEncoding(): boolean { return true; }
}
export class TirStringT {
    clone(): TirStringT { return new TirStringT(); }
    isConcrete(): boolean { return true; }
    toString(): string { return "string"; }
    static toTirTypeKey(): string { return "string"; }
    toTirTypeKey(): string { return TirStringT.toTirTypeKey(); }
    toConcreteTirTypeName(): string { return this.toTirTypeKey(); }
    hasDataEncoding(): boolean { return true; }
}
export class TirDataT {
    clone(): TirDataT { return new TirDataT(); }
    isConcrete(): boolean { return true; }
    toString(): string { return "data"; }
    static toTirTypeKey(): string { return "data"; }
    toTirTypeKey(): string { return TirDataT.toTirTypeKey(); }
    toConcreteTirTypeName(): string { return this.toTirTypeKey(); }
    hasDataEncoding(): boolean { return true; }
}


export function isTirOptType( t: any ): t is TirDataOptT<TirType> | TirSopOptT<TirType>
{
    return (
        t instanceof TirDataOptT
        || t instanceof TirSopOptT
    );
}

export class TirDataOptT<T extends TirType = TirType>
{
    constructor(
        readonly typeArg: T
    ) {}

    hasDataEncoding(): boolean { return this.typeArg.hasDataEncoding(); }

    toAstName(): string {
        return "Optional"
    }

    toString(): string {
        return `${this.toAstName()}<${this.typeArg.toString()}>`;
    }

    static toTirTypeKey(): string {
        return "data_opt";
    }
    toTirTypeKey(): string {
        return TirDataOptT.toTirTypeKey();
    }

    toConcreteTirTypeName(): string {
        return getAppliedTirTypeName(
            this.toTirTypeKey(),
            [ this.typeArg.toConcreteTirTypeName() ]
        );
    }

    private _isConcrete: boolean | undefined = undefined;
    isConcrete(): boolean {
        if( typeof this._isConcrete !== "boolean" )
            this._isConcrete = this.typeArg.isConcrete();
        return this._isConcrete!;
    }

    clone(): TirDataOptT<T> {
        const result = new TirDataOptT(
            this.typeArg.clone()
        ) as TirDataOptT<T>;
        result._isConcrete = this._isConcrete;
        return result;
    }
}
export class TirSopOptT<T extends TirType = TirType>
{
    constructor(
        readonly typeArg: T
    ) {}

    hasDataEncoding(): boolean { return false; }

    toAstName(): string {
        return "Optional"
    }

    toString(): string {
        return `${this.toAstName()}<${this.typeArg.toString()}>`;
    }

    static toTirTypeKey(): string {
        return "sop_opt";
    }
    toTirTypeKey(): string {
        return TirSopOptT.toTirTypeKey();
    }

    toConcreteTirTypeName(): string {
        return getAppliedTirTypeName(
            this.toTirTypeKey(),
            [ this.typeArg.toConcreteTirTypeName() ]
        );
    }

    private _isConcrete: boolean | undefined = undefined;
    isConcrete(): boolean {
        if( typeof this._isConcrete !== "boolean" )
            this._isConcrete = this.typeArg.isConcrete();
        return this._isConcrete!;
    }

    clone(): TirSopOptT<T> {
        const result = new TirSopOptT(
            this.typeArg.clone()
        ) as TirSopOptT<T>;
        result._isConcrete = this._isConcrete;
        return result;
    }
}

export class TirListT<T extends TirType = TirType>
{
    constructor(
        readonly typeArg: T
    ) {}

    hasDataEncoding(): boolean { return this.typeArg.hasDataEncoding(); }

    static toTirTypeKey(): string {
        return "List";
    }
    toTirTypeKey(): string {
        return TirListT.toTirTypeKey();
    }

    toConcreteTirTypeName(): string {
        return getAppliedTirTypeName(
            this.toTirTypeKey(),
            [ this.typeArg.toConcreteTirTypeName() ]
        );
    }

    toString(): string {
        return `${this.toTirTypeKey()}<${this.typeArg.toString()}>`;
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

export class TirLinearMapT<K extends TirType = TirType,V extends TirType = TirType>
{
    constructor(
        readonly keyTypeArg: K,
        readonly valTypeArg: V
    ) {}

    hasDataEncoding(): boolean { return this.keyTypeArg.hasDataEncoding() && this.valTypeArg.hasDataEncoding(); }

    static toTirTypeKey(): string {
        return "list_pair_data";
    }
    toTirTypeKey(): string {
        return TirLinearMapT.toTirTypeKey();
    }

    toConcreteTirTypeName(): string {
        return getAppliedTirTypeName(
            this.toTirTypeKey(),
            [ 
                this.keyTypeArg.toConcreteTirTypeName(),
                this.valTypeArg.toConcreteTirTypeName()
            ]
        );
    }

    toString(): string {
        return `${this.toTirTypeKey()}<${this.keyTypeArg.toString()},${this.valTypeArg.toString()}>`;
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

    hasDataEncoding(): boolean { return false; }

    toTirTypeKey(): string {
        return "func_" + this.argTypes.map( t => t.toConcreteTirTypeName() ).join("_") + "_" + this.returnType.toConcreteTirTypeName();
    }
    toConcreteTirTypeName(): string {
        return this.toTirTypeKey();
    }

    toString(): string {
        return `(${this.argTypes.map( t => t.toString() ).join(",")}) => ${this.returnType.toString()}`;
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