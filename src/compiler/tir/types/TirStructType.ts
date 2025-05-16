import { isObject } from "@harmoniclabs/obj-utils";
import { TirInterfaceImpl } from "./TirInterfaceImpl";
import { TirType } from "./TirType";

export interface ITirStructType {
    readonly name: string;
    readonly fileUid: string;
    readonly constructors: TirStructConstr[];
    /** points to an array possibly shared with alternative encoding types */
    readonly implsPtr: TirInterfaceImpl[];
}

export type TirStructType
    = TirDataStructType
    | TirSoPStructType
    ;

export function isTirStructType( thing: any ): thing is TirStructType
{
    return isObject( thing ) && (
        thing instanceof TirDataStructType
        || thing instanceof TirSoPStructType
    );
}

export class TirDataStructType
    implements ITirStructType
{
    constructor(
        readonly name: string,
        readonly fileUid: string,
        readonly constructors: TirStructConstr[],
        /** points to an array possibly shared with alternative encoding types */
        readonly implsPtr: TirInterfaceImpl[],
    ) {}

    hasDataEncoding(): boolean { return true; }

    toTirTypeKey(): string {
        return "data_" + this.name + "_" + this.fileUid;
    }
    toConcreteTirTypeName(): string {
        return this.toTirTypeKey();
    }

    isSingleConstr(): boolean {
        return this.constructors.length === 1;
    }

    toString(): string {
        return this.name;
    }

    private _isConcrete: boolean | undefined = undefined;
    isConcrete(): boolean {
        if( typeof this._isConcrete !== "boolean" )
            this._isConcrete = this.constructors.every(
                c => c.isConcrete()
            );
        return this._isConcrete;
    }

    clone(): TirDataStructType
    {
        const result = new TirDataStructType(
            this.name,
            this.fileUid,
            this.constructors.map( c => c.clone() ),
            this.implsPtr
        );
        result._isConcrete = this._isConcrete;
        return result;
    }
}

export class TirSoPStructType
    implements ITirStructType
{
    constructor(
        readonly name: string,
        readonly fileUid: string,
        readonly constructors: TirStructConstr[],
        /** points to an array possibly shared with alternative encoding types */
        readonly implsPtr: TirInterfaceImpl[],
    ) {}

    hasDataEncoding(): boolean { return false; }

    toTirTypeKey(): string {
        return "sop_" + this.name + "_" + this.fileUid;
    }
    toConcreteTirTypeName(): string {
        return this.toTirTypeKey();
    }

    isSingleConstr(): boolean {
        return this.constructors.length === 1;
    }

    toString(): string {
        return this.name;
    }

    private _isConcrete: boolean | undefined = undefined;
    isConcrete(): boolean {
        if( typeof this._isConcrete !== "boolean" )
            this._isConcrete = this.constructors.every(
                c => c.isConcrete()
            );
        return this._isConcrete;
    }

    clone(): TirSoPStructType
    {
        const result = new TirSoPStructType(
            this.name,
            this.fileUid,
            this.constructors.map( c => c.clone() ),
            this.implsPtr
        );
        result._isConcrete = this._isConcrete;
        return result;
    }
}

export class TirStructConstr
{
    constructor(
        readonly name: string,
        readonly fields: TirStructField[]
    ) {}

    toString(): string {
        return this.name;
    }

    isConcrete(): boolean {
        return this.fields.every(
            f => f.isConcrete()
        );
    }

    clone(): TirStructConstr
    {
        return new TirStructConstr(
            this.name,
            this.fields.map( f => f.clone() )
        );
    }
}

export class TirStructField
{
    constructor(
        readonly name: string,
        readonly type: TirType
    ) {}

    isConcrete(): boolean {
        return this.type.isConcrete();
    }

    clone(): TirStructField
    {
        return new TirStructField(
            this.name,
            this.type.clone()
        );
    }
}