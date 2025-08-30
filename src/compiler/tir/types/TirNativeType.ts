import { ITirType, TirType } from "./TirType";
import { getAppliedTirTypeName } from "../program/TypedProgram";
import { constT, ConstType } from "@harmoniclabs/uplc";
import { TirDataStructType, TirSoPStructType, TirStructConstr, TirStructField } from "./TirStructType";

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
    | TirUnConstrDataResultT
    | TirPairDataT
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
        || t instanceof TirUnConstrDataResultT
        || t instanceof TirPairDataT
    );
}

export class TirVoidT
    implements ITirType
{
    clone(): TirVoidT { return new TirVoidT(); }
    isConcrete(): boolean { return true; }
    toString(): string { return "void"; }
    toAstName(): string { return "void"; }
    static toTirTypeKey(): string { return "void"; }
    toTirTypeKey(): string { return TirVoidT.toTirTypeKey(); }
    toConcreteTirTypeName(): string { return this.toTirTypeKey(); }
    hasDataEncoding(): boolean { return true; }
    toUplcConstType(): ConstType { return constT.unit; }
}
export class TirBoolT
    implements ITirType
{
    clone(): TirBoolT { return new TirBoolT(); }
    isConcrete(): boolean { return true; }
    toString(): string { return "boolean"; }
    toAstName(): string { return "boolean"; }
    static toTirTypeKey(): string { return "boolean"; }
    toTirTypeKey(): string { return TirBoolT.toTirTypeKey(); }
    toConcreteTirTypeName(): string { return this.toTirTypeKey(); }
    hasDataEncoding(): boolean { return true; }
    toUplcConstType(): ConstType { return constT.bool; }
}
export class TirIntT
    implements ITirType
{
    clone(): TirIntT { return new TirIntT(); }
    isConcrete(): boolean { return true; }
    toString(): string { return "int"; }
    toAstName(): string { return "int"; }
    static toTirTypeKey(): string { return "int"; }
    toTirTypeKey(): string { return TirIntT.toTirTypeKey(); }
    toConcreteTirTypeName(): string { return this.toTirTypeKey(); }
    hasDataEncoding(): boolean { return true; }
    toUplcConstType(): ConstType { return constT.int; }
}
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


export function isTirOptType( t: any ): t is TirDataOptT<TirType> | TirSopOptT<TirType>
{
    return (
        t instanceof TirDataOptT
        || t instanceof TirSopOptT
    );
}

export class TirDataOptT<T extends TirType = TirType>
    extends TirDataStructType
    implements ITirType
{
    constructor(
        readonly typeArg: T
    ) {
        super(
            "Optional", // name
            "", // fileUid
            [
                new TirStructConstr(
                    "Some", // name
                    [ // fields
                        new TirStructField( "value", typeArg )
                    ]
                ),
                new TirStructConstr( "None", [] ) // name, fields
            ],
            new Map() // methodNamesPtr
        );
    }

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

    protected _isConcrete: boolean | undefined = undefined;
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

    toUplcConstType(): ConstType { return constT.data; }
}
export class TirSopOptT<T extends TirType = TirType>
    extends TirSoPStructType
    implements ITirType
{
    constructor(
        readonly typeArg: T
    ) {
        super(
            "Optional", // name
            "", // fileUid
            [
                new TirStructConstr(
                    "Some", // name
                    [ // fields
                        new TirStructField( "value", typeArg )
                    ]
                ),
                new TirStructConstr( "None", [] ) // name, fields
            ],
            new Map() // methodNamesPtr
        );
    }

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

    protected _isConcrete: boolean | undefined = undefined;
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

    toUplcConstType(): ConstType {
        throw new Error("SoP encoded optional cannot be represented as uplc const");
    }
}

export class TirUnConstrDataResultT
    implements ITirType
{
    constructor() {}

    hasDataEncoding(): boolean { return false; }

    static toTirTypeKey(): string {
        return "#un_constr_data_result#";
    }
    toTirTypeKey(): string {
        return TirUnConstrDataResultT.toTirTypeKey();
    }

    toConcreteTirTypeName(): string {
        return this.toTirTypeKey();
    }

    toString(): string {
        return this.toTirTypeKey();
    }

    toAstName(): string {
        return this.toTirTypeKey();
    }

    isConcrete(): boolean { return true; }

    clone(): TirUnConstrDataResultT {
        return new TirUnConstrDataResultT();
    }

    toUplcConstType(): ConstType {
        return constT.pairOf(
            constT.int,
            constT.listOf( constT.data )
        );
    }
}

export class TirPairDataT
    implements ITirType
{
    constructor() {}

    hasDataEncoding(): boolean { return false; }
    static toTirTypeKey(): string {
        return "#pair_data";
    }

    toTirTypeKey(): string {
        return TirPairDataT.toTirTypeKey();
    }
    toConcreteTirTypeName(): string {
        return this.toTirTypeKey();
    }

    toString(): string {
        return this.toTirTypeKey();
    }

    toAstName(): string {
        return this.toTirTypeKey();
    }

    isConcrete(): boolean { return true; }

    clone(): TirPairDataT {
        return new TirPairDataT();
    }

    toUplcConstType(): ConstType {
        return constT.pairOf(
            constT.data,
            constT.data
        );
    }
}

export class TirListT<T extends TirType = TirType>
    implements ITirType
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

    toAstName(): string {
        return this.toTirTypeKey();
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

    toUplcConstType(): ConstType {
        return constT.listOf(
            this.typeArg.toUplcConstType()
        );
    }
}

export class TirLinearMapT<K extends TirType = TirType,V extends TirType = TirType>
    implements ITirType
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

    toAstName(): string {
        return this.toTirTypeKey();
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

    toUplcConstType(): ConstType {
        return constT.listOf(
            constT.pairOf(
                constT.data,
                constT.data
            )
        );
    }
}

export class TirFuncT
    implements ITirType
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

    toAstName(): string {
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

    toUplcConstType(): ConstType {
        throw new Error("TirFuncT cannot be represented as uplc const type");
    }
}