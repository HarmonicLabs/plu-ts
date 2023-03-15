import { fromUtf8, toHex } from "@harmoniclabs/uint8array-utils";
import { blake2b_224 } from "../../../crypto/blake2b";
import { BasePlutsError } from "../../../errors/BasePlutsError";
import { Data, dataToCbor, isData } from "../../../types/Data";
import { ByteString } from "../../../types/HexString/ByteString";
import { Cloneable } from "../../../types/interfaces/Cloneable";
import { CanBeUInteger, canBeUInteger, forceBigUInt } from "../../../types/ints/Integer";
import { Pair } from "../../../types/structs/Pair";
import ObjectUtils from "../../../utils/ObjectUtils";
import { isConstValueList } from "../../UPLC/UPLCTerms/UPLCConst/ConstValue";
import { termTypeToString, typeExtends } from "../../pluts";
import { cloneTermType } from "../../pluts/type_system/cloneTermType";
import { isWellFormedType } from "../../pluts/type_system/kinds/isWellFormedType";
import { termTyToConstTy } from "../../pluts/type_system/termTyToConstTy";
import { GenericTermType, PrimType, TermType, bool, bs, data, delayed, int, lam, list, pair, str, tyVar } from "../../pluts/type_system/types";
import { IHash } from "../interfaces/IHash";
import { concatUint8Arr } from "../utils/concatUint8Arr";
import { positiveBigIntAsBytes } from "../utils/positiveIntAsBytes";
import { serialize } from "v8";
import { IIRParent } from "../interfaces/IIRParent";
import { IRTerm } from "../IRTerm";
import { isIRTerm } from "../utils/isIRTerm";
import { UnexpectedMarkHashInvalidCall } from "../../../errors/PlutsIRError/UnexpectedMarkHashInvalidCall";
import { ToJson } from "../../../utils/ts/ToJson";

export type IRConstValue
    = CanBeUInteger
    | ByteString | Uint8Array
    | string
    | boolean
    | IRConstValue[]
    | Pair<IRConstValue, IRConstValue>
    | Data;


export class IRConst
    implements Cloneable<IRConst>, IHash, IIRParent, ToJson
{
    readonly hash: Uint8Array;
    markHashAsInvalid: () => void;

    readonly type!: TermType
    readonly value!: IRConstValue

    parent: IRTerm | undefined;

    constructor( t: TermType, v: IRConstValue, irParent?: IRTerm )
    {
        if(
            !isWellFormedType( t ) ||
            typeExtends( t, lam( tyVar(), tyVar() ) ) &&
            typeExtends( t, delayed( tyVar() ) )
        )
        {
            throw new BasePlutsError(
                "invalid type for IR constant"
            );
        }

        ObjectUtils.defineReadOnlyProperty(
            this, "type", cloneTermType( t )
        );

        if(!(
            isIRConstValueAssignableToType( v, t )
        ))
        {
            throw new BasePlutsError(
                "invalid constant value for type " + termTypeToString( t )
            );
        }

        ObjectUtils.defineReadOnlyProperty(
            this, "value", v
        );

        let _parent: IRTerm | undefined = undefined;
        Object.defineProperty(
            this, "parent",
            {
                get: () => _parent,
                set: ( newParent: IRTerm | undefined ) => {

                    if( newParent === undefined || isIRTerm( newParent ) )
                    {
                        _parent = newParent;
                    }

                },
                enumerable: true,
                configurable: false
            }
        );
        this.parent = irParent;

        let hash: Uint8Array | undefined = undefined;
        Object.defineProperty(
            this, "hash", {
                get: () => {
                    if(!( hash instanceof Uint8Array ))
                    {
                        hash = blake2b_224(
                            concatUint8Arr(
                                IRConst.tag,
                                new Uint8Array( termTyToConstTy( this.type ) ),
                                serializeIRConstValue( this.value, this.type )
                            )
                        )
                    }
                    return hash.slice();
                },
                set: () => {},
                enumerable: true,
                configurable: false
            }
        );

        Object.defineProperty(
            this, "markHashAsInvalid",
            {
                value: () => { throw new UnexpectedMarkHashInvalidCall("IRConst") },
                writable: false,
                enumerable:  true,
                configurable: false
            }
        );
    }

    static get tag(): Uint8Array { return new Uint8Array([ 0b0000_0011 ]); }

    clone(): IRConst
    {
        return new IRConst( this.type, this.value );
    }

    toJson(): any
    {
        return {
            type: "IRConst",
            constType: termTypeToString( this.type ),
            value: constValueToJson( this.value )
        }
    }
}


function inferConstValueT( value: IRConstValue ): GenericTermType
{
    if( canBeUInteger( value ) ) return int;

    if(
        value instanceof Uint8Array ||
        value instanceof ByteString
    ) return bs;

    if( typeof value === "string" ) return str;
    if( typeof value === "boolean" ) return bool;

    if( isIRConstValueList( value ) )
    {
        if( value.length === 0 ) return list( tyVar() );

        return list( inferConstValueT( value[0] ) )
    }

    if( value instanceof Pair )
    {
        return pair( inferConstValueT( value.fst ), inferConstValueT( value.snd ) );
    }

    if( isData( value ) ) return data

    throw new BasePlutsError(
        "invalid IRConstValue passed to inferConstValueT"
    );
}

function isIRConstValueList( value: any ): value is IRConstValue[]
{
    if(!Array.isArray( value )) return false;

    if( value.length === 0 ) return true;

    const elemsT = inferConstValueT( value[0] );

    return value.every( elem => isIRConstValueAssignableToType( elem, elemsT ) )
}

function isIRConstValueAssignableToType( value: IRConstValue, t: GenericTermType )
{
    // handle some `[]` edge case value
    if(
        isConstValueList( value ) &&
        value.length === 0
    )
    {
        return t[0] === PrimType.List
    }

    return typeExtends(
        inferConstValueT( value ),
        t
    )
}

export function isIRConstValue( value: any ): boolean
{
    return (
        canBeUInteger( value ) ||
        value instanceof Uint8Array ||
        value instanceof ByteString ||
        typeof value === "string" ||
        typeof value === "boolean" ||
        isIRConstValueList( value ) ||
        (
            value instanceof Pair &&
            isIRConstValue( value.fst ) &&
            isIRConstValue( value.snd )
        ) || 
        isData( value )
    );
}

function constValueToJson( value: any ): any
{
    if( canBeUInteger( value ) ) return forceBigUInt( value ).toString();
    if( value instanceof Uint8Array ) return toHex( value );
    if( value instanceof ByteString ) return value.toString();
    if( isIRConstValueList( value ) ) return value.map( constValueToJson );
    if( value instanceof Pair ) return { fst: constValueToJson( value.fst ), snd: constValueToJson( value.snd ) };
    if( isData( value ) ) return value.toJson();

    return value;
}

function serializeIRConstValue( value: any, t: TermType ): Uint8Array
{
    if( t[0] === PrimType.Int )
    {
        return positiveBigIntAsBytes( forceBigUInt( value ) )
    }

    if( t[0] === PrimType.BS )
    {
        if( value instanceof Uint8Array ) return value.slice();
        if( value instanceof ByteString ) return value.toBuffer();
    }

    if( t[0] === PrimType.Str ) return fromUtf8( value );

    if( t[0] === PrimType.Bool ) return new Uint8Array([value ? 1 : 0]);

    if( t[0] === PrimType.List )
    return concatUint8Arr(
        ...(value as any[]).map( stuff =>
            serializeIRConstValue( stuff, t[1] )
        )
    );

    if( t[0] === PrimType.Pair )
    {
        return concatUint8Arr(
            serializeIRConstValue( value.fst, t[1] ),
            serializeIRConstValue( value.snd, t[2] ),
        )
    }

    if( typeExtends( t, data ) ) // include structs or `asData`
    {
        return dataToCbor( value ).toBuffer();
    }

    console.error( "unexpected value calling 'serializeIRConstValue'", value );
    throw new BasePlutsError(
        "unexpected value calling 'serializeIRConstValue'"
    );
}