import { isObject } from "@harmoniclabs/obj-utils";
import { TirCustomType, TirType } from "../../../../tir/TirType";
import { TirNativeType } from "../../../../tir/TirNativeType";
import { TirStructType } from "../../../../tir/TirStructType";
import { TirAliasType } from "../../../../tir/TirAliasType";

// can't call `Symbol`, so we don't confuse it with the built-in js `Symbol`
export type PebbleSym
    = PebbleTypeSym<SupporteNParams>
    | PebbleValueSym
    ;

export function isPebbleSym( obj: any ): obj is PebbleSym
{
    return isObject( obj ) && (
        obj instanceof PebbleTypeSym
        || obj instanceof PebbleValueSym
    );
}

export interface IPebbleSym {
    readonly name: string;
}

type SupporteNParams
    = -1 // function need special handling
    | -2 // `Sop` and `AsData`
    |  0 |  1 |  2 |  3 |  4 |  5 |  6 |  7 |  8 |  9
    | 10 | 11 | 12 | 13 | 14 | 15;

type TypeArr<Len extends SupporteNParams> =
    Len extends  -1 ? [ paramsTs: TirType[], returnT: TirType[] ] :
    Len extends  -2 ? [ structLike: TirStructType | TirAliasType<TirStructType> ] :
    Len extends  0 ? [] :
    Len extends  1 ? [TirType] :
    Len extends  2 ? [TirType,TirType] :
    Len extends  3 ? [TirType,TirType,TirType] :
    Len extends  4 ? [TirType,TirType,TirType,TirType] :
    Len extends  5 ? [TirType,TirType,TirType,TirType,TirType] :
    Len extends  6 ? [TirType,TirType,TirType,TirType,TirType,TirType] :
    Len extends  7 ? [TirType,TirType,TirType,TirType,TirType,TirType,TirType] :
    Len extends  8 ? [TirType,TirType,TirType,TirType,TirType,TirType,TirType,TirType] :
    Len extends  9 ? [TirType,TirType,TirType,TirType,TirType,TirType,TirType,TirType,TirType] :
    Len extends 10 ? [TirType,TirType,TirType,TirType,TirType,TirType,TirType,TirType,TirType,TirType] :
    Len extends 11 ? [TirType,TirType,TirType,TirType,TirType,TirType,TirType,TirType,TirType,TirType,TirType] :
    Len extends 12 ? [TirType,TirType,TirType,TirType,TirType,TirType,TirType,TirType,TirType,TirType,TirType,TirType] : 
    Len extends 13 ? [TirType,TirType,TirType,TirType,TirType,TirType,TirType,TirType,TirType,TirType,TirType,TirType,TirType] :
    Len extends 14 ? [TirType,TirType,TirType,TirType,TirType,TirType,TirType,TirType,TirType,TirType,TirType,TirType,TirType,TirType] :
    Len extends 15 ? [TirType,TirType,TirType,TirType,TirType,TirType,TirType,TirType,TirType,TirType,TirType,TirType,TirType,TirType, TirType] :
    TirType[];

export interface IPebbleTypeSym<NParams extends SupporteNParams> extends IPebbleSym
{
    /** @default false */
    readonly isBuiltinType?: boolean;
    readonly nTypeParameters: NParams;
    readonly getConcreteType: (...args: TypeArr<NParams>) => TirType;
}

export class PebbleTypeSym<NParams extends SupporteNParams>
    implements IPebbleTypeSym<NParams>
{
    readonly name: string;
    private readonly concreteType: undefined;
    readonly isBuiltinType: boolean;
    readonly nTypeParameters: NParams;
    readonly getConcreteType: (...args: TypeArr<NParams>) => TirType;

    constructor({
        name,
        isBuiltinType,
        nTypeParameters,
        getConcreteType
    }: IPebbleTypeSym<NParams>)
    {
        this.name = name;
        this.concreteType = undefined;
        this.isBuiltinType = typeof isBuiltinType === "boolean" ? isBuiltinType : false;
        this.nTypeParameters = nTypeParameters;
        this.getConcreteType = getConcreteType;
    }
}

export interface IPebbleValueSym extends IPebbleSym
{
    readonly concreteType: TirType;
}
export class PebbleValueSym implements IPebbleValueSym
{
    readonly name: string;
    readonly concreteType: TirType;
    private readonly isBuiltinType: undefined
    private readonly nTypeParameters: undefined
    private readonly getConcreteType: undefined

    constructor({
        name,
        concreteType
    }: IPebbleValueSym)
    {
        this.name = name;
        this.concreteType = concreteType;
        this.isBuiltinType = undefined;
        this.nTypeParameters = undefined;
        this.getConcreteType = undefined;
    }
}

