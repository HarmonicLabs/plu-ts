import UPLCTerm, { PureUPLCTerm } from "../../UPLC/UPLCTerm";
import UPLCBuiltinTag from "../../UPLC/UPLCTerms/Builtin/UPLCBuiltinTag";
import ErrorUPLC from "../../UPLC/UPLCTerms/ErrorUPLC";
import UPLCConst from "../../UPLC/UPLCTerms/UPLCConst";
import ConstType, { constT, constTypeEq } from "../../UPLC/UPLCTerms/UPLCConst/ConstType" 
import PartialBuiltin from "./PartialBuiltin";
import Integer, { UInteger } from "../../../types/ints/Integer";
import ConstValue from "../../UPLC/UPLCTerms/UPLCConst/ConstValue";
import ByteString from "../../../types/HexString/ByteString";
import { isData } from "../../../types/Data";
import HoistedUPLC from "../../UPLC/UPLCTerms/HoistedUPLC";
import BigIntUtils from "../../../utils/BigIntUtils";

function isConstOfType( constant: Readonly<UPLCTerm>, ty: Readonly<ConstType> ): constant is UPLCConst
{
    const checkValue = ( v: ConstValue ): boolean =>
    {
        if( constTypeEq( constT.int, ty ) )
        {
            return (
                v instanceof Integer ||
                v instanceof UInteger
            );
        }

        if( constTypeEq( constT.bool, ty ) )
        {
            return typeof v === "boolean";
        }

        if( constTypeEq( constT.byteStr, ty ) )
        {
            return ( ByteString.isStrictInstance( v ) )
        }

        if( constTypeEq( constT.data, ty ) )
        {
            return ( isData( v ) )
        }

        if( constTypeEq( constT.str, ty ) )
        {
            return typeof v === "string";
        }

        if( constTypeEq( constT.unit, ty ) )
        {
            return v === undefined;
        }
        return false;
    }

    // if( constant instanceof HoistedUPLC ) constant = constant.UPLC;

    return (
        constant instanceof UPLCConst &&
        constTypeEq( constant.type, ty ) &&
        checkValue( constant.value )
    )
}

function getInt( a: UPLCTerm ): bigint | undefined
{
    if( !isConstOfType( a, constT.int ) ) return undefined;
    return a.value.asBigInt;
}

function getBS( a: UPLCTerm ): ByteString | undefined
{
    if( !isConstOfType( a, constT.byteStr ) ) return undefined;
    return a.value;
}

function getStr( a: UPLCTerm ): string | undefined
{
    if( !isConstOfType( a, constT.str ) ) return undefined;
    return a.value;
}

function getInts( a: UPLCTerm, b: UPLCTerm ): ( { a: bigint,  b: bigint } | undefined )
{
    if( !isConstOfType( a, constT.int ) ) return undefined;
    if( !isConstOfType( b, constT.int ) ) return undefined;

    return {
        a: a.value.asBigInt,
        b: b.value.asBigInt
    };
}

function intBinOp( a: UPLCTerm, b: UPLCTerm , op: (a: bigint, b: bigint) => bigint | undefined ): UPLCConst | ErrorUPLC
{
    const ints = getInts( a, b );
    if( ints === undefined ) return new ErrorUPLC;

    const result = op( ints.a, ints.b);
    if( result === undefined ) return new ErrorUPLC;

    return UPLCConst.int( result );
}

function haskellQuot( a: bigint, b: bigint ): bigint | undefined
{
    if( b === BigInt( 0 ) ) return undefined;
    return a / b;
}

function haskellRem( a: bigint, b: bigint ): bigint | undefined
{
    if( b === BigInt( 0 ) ) return undefined;
    return a % b;
}

function haskellQuotRem( a: bigint, b: bigint ): [ quot: bigint, rem: bigint ] | undefined
{
    const quot = haskellQuot( a, b );
    if( quot === undefined ) return quot;
    const rem = haskellRem( a, b );
    if( rem === undefined ) return rem;
    
    return [ quot, rem ];
}


function haskellDivMod( a: bigint, b: bigint ): [ div: bigint, mod: bigint ] | undefined
{
    if( b === BigInt( 0 ) ) return undefined;
    
    if( a > BigInt( 0 ) && b < BigInt( 0 ) )
    {
        const qr = haskellQuotRem( a - BigInt( 1 ), b );
        if( qr === undefined ) return undefined;

        return [
            qr[0] - BigInt( 1 ),
            qr[1] + b + BigInt( 1 )
        ]
    }

    if( a < BigInt( 0 ) && b > BigInt( 0 ) )
    {
        const qr = haskellQuotRem( a + BigInt( 1 ), b );
        if( qr === undefined ) return undefined;

        return [
            qr[0] - BigInt( 1 ),
            qr[1] + b - BigInt( 1 )
        ]
    }

    return haskellQuotRem( a, b );
}

function haskellDiv( a: bigint, b: bigint ): bigint | undefined
{
    const dm = haskellDivMod( a, b );
    if( dm === undefined ) return undefined;
    return dm[0];
}

function haskellMod( a: bigint, b: bigint ): bigint | undefined
{
    const dm = haskellDivMod( a, b );
    if( dm === undefined ) return undefined;
    return dm[1];
}

export default class BnCEK
{
    private constructor() {};

    static eval( bn: PartialBuiltin ): PureUPLCTerm
    {
        if( bn.tag === UPLCBuiltinTag.ifThenElse ){
            return BnCEK.ifThenElse( bn.args[0], bn.args[1], bn.args[2] )
        }

        if( bn.tag === UPLCBuiltinTag.equalsInteger ){
            return BnCEK.equalsInteger( bn.args[0], bn.args[1] )
        }


        return new ErrorUPLC;
    }

    static addInteger( a: UPLCTerm, b: UPLCTerm ): PureUPLCTerm         { return intBinOp( a , b, (a, b) => a + b ); }
    static subtractInteger( a: UPLCTerm, b: UPLCTerm ): PureUPLCTerm    { return intBinOp( a , b, (a, b) => a - b ); }
    static multiplyInteger( a: UPLCTerm, b: UPLCTerm ): PureUPLCTerm    { return intBinOp( a , b, (a, b) => a * b ); }
    static divideInteger( a: UPLCTerm, b: UPLCTerm ): PureUPLCTerm      { return intBinOp( a , b, haskellDiv      ); }
    static quotientInteger( a: UPLCTerm, b: UPLCTerm ): PureUPLCTerm    { return intBinOp( a , b, haskellQuot     ); }
    static remainderInteger( a: UPLCTerm, b: UPLCTerm ): PureUPLCTerm   { return intBinOp( a , b, haskellRem      ); }
    static modInteger( a: UPLCTerm, b: UPLCTerm ): PureUPLCTerm         { return intBinOp( a , b, haskellMod      ); }
    static equalsInteger( a: UPLCTerm, b: UPLCTerm ): PureUPLCTerm
    {
        const ints = getInts( a, b );
        if( ints === undefined ) return new ErrorUPLC;

        return UPLCConst.bool( ints.a === ints.b );
    }
    static lessThanInteger( a: UPLCTerm, b: UPLCTerm ): PureUPLCTerm
    {
        const ints = getInts( a, b );
        if( ints === undefined ) return new ErrorUPLC;

        return UPLCConst.bool( ints.a < ints.b );
    }
    static lessThanEqualInteger( a: UPLCTerm, b: UPLCTerm ): PureUPLCTerm
    {
        const ints = getInts( a, b );
        if( ints === undefined ) return new ErrorUPLC;

        return UPLCConst.bool( ints.a <= ints.b );
    }
    static appendByteString( a: UPLCTerm, b: UPLCTerm ): PureUPLCTerm
    {
        const _a = getBS( a );
        if( _a === undefined ) return new ErrorUPLC;
        const _b = getBS( b );
        if(_b === undefined ) return new ErrorUPLC;

        return UPLCConst.byteString(  new ByteString( _a.asString + _b.asString ) );
    }
    static consByteString( a: UPLCTerm, b: UPLCTerm ): PureUPLCTerm
    {
        let _a = getInt( a );
        if( _a === undefined ) return new ErrorUPLC;
        _a = BigIntUtils.abs( _a ) % BigInt( 256 );

        const _b = getBS( b );
        if(_b === undefined ) return new ErrorUPLC;

        return UPLCConst.byteString(  new ByteString( _a.toString(16).padStart( 2, '0' ) + _b.asString ) );
    }
    static sliceByteString( fromIdx: UPLCTerm, ofLength: UPLCTerm, bs: UPLCTerm ): PureUPLCTerm
    {
        const idx = getInt( fromIdx );
        if( idx === undefined ) return new ErrorUPLC;

        const length = getInt( ofLength );
        if( length === undefined ) return new ErrorUPLC;

        const _bs = getBS( bs );
        if( _bs === undefined ) return new ErrorUPLC;

        const i = idx < BigInt( 0 ) ? BigInt( 0 ) : idx;

        const endIdx = idx + length - BigInt( 1 );
        const maxIdx = BigInt( _bs.asBytes.length ) - BigInt( 1 );

        const j = endIdx > maxIdx ? maxIdx : endIdx;

        if( j < i ) return UPLCConst.byteString( new ByteString( Buffer.from([]) ) );

        return UPLCConst.byteString(
            new ByteString(
                Buffer.from(
                    _bs.asBytes.slice(
                        Number( i ), Number( j )
                    )
                )
            )
        );
    }
    static lengthOfByteString( bs: UPLCTerm ): PureUPLCTerm
    {
        const _bs = getBS( bs );
        if( _bs === undefined ) return new ErrorUPLC;

        return UPLCConst.int( _bs.asBytes.length );
    }
    static indexByteString( bs: UPLCTerm, idx: UPLCTerm ): PureUPLCTerm
    {
        const _bs = getBS( bs );
        if( _bs === undefined ) return new ErrorUPLC;
        
        const i = getInt( idx );
        if( i === undefined || i >= _bs.asBytes.length || i < BigInt( 0 ) ) return new ErrorUPLC;

        const result = _bs.asBytes.at( Number( i ) );
        if( result === undefined ) return new ErrorUPLC;

        return UPLCConst.int( result );
    }
    static equalsByteString( a: UPLCTerm, b: UPLCTerm ): PureUPLCTerm
    {
        const _a = getBS( a );
        if( _a === undefined ) return new ErrorUPLC;
        
        const _b = getBS( b );
        if( _b === undefined ) return new ErrorUPLC;

        return UPLCConst.bool( _a.asString === _b.asString );
    }
    static lessThanByteString( a: UPLCTerm, b: UPLCTerm ): PureUPLCTerm
    {
        const _a = getBS( a );
        if( _a === undefined ) return new ErrorUPLC;
        
        const _b = getBS( b );
        if( _b === undefined ) return new ErrorUPLC;

        const aBytes = _a.asBytes;
        const bBytes = _b.asBytes;

        if( aBytes.length < bBytes.length ) return UPLCConst.bool( true );

        // aBytes.length is either greather or equal bBytes.length
        for(let i = 0; i < aBytes.length; i++)
        {
            const aByte = aBytes.at(i) ?? Infinity;
            const bByte = bBytes.at(i);
            if( bByte === undefined ) return UPLCConst.bool( false );

            if( aByte < bByte ) return UPLCConst.bool( true );
            if( aByte > bByte ) return UPLCConst.bool( false );
        }
        return UPLCConst.bool( false );
    }
    static lessThanEqualsByteString( a: UPLCTerm, b: UPLCTerm ): PureUPLCTerm
    {
        const _a = getBS( a );
        if( _a === undefined ) return new ErrorUPLC;
        
        const _b = getBS( b );
        if( _b === undefined ) return new ErrorUPLC;

        if( _a.asString === _b.asString ) return UPLCConst.bool( true );
        return BnCEK.lessThanByteString( a, b );
    }

    // @todo
    //
    // static sha2_256
    // static sha3_256
    // static blake2b_256
    // static verifyEd25519Signature

    static appendString( a: UPLCTerm, b: UPLCTerm ): PureUPLCTerm
    {
        const _a = getStr( a );
        if( _a === undefined ) return new ErrorUPLC;
        
        const _b = getStr( b );
        if( _b === undefined ) return new ErrorUPLC;

        return UPLCConst.str( _a + _b )
    }
    static equalsString( a: UPLCTerm, b: UPLCTerm ): PureUPLCTerm
    {
        const _a = getStr( a );
        if( _a === undefined ) return new ErrorUPLC;
        
        const _b = getStr( b );
        if( _b === undefined ) return new ErrorUPLC;

        return UPLCConst.bool( _a === _b )
    }
    static encodeUtf8( a: UPLCTerm ): PureUPLCTerm
    {
        const _a = getStr( a );
        if( _a === undefined ) return new ErrorUPLC;

        return UPLCConst.byteString( new ByteString( Buffer.from( _a , "utf8" ) ) );
    }
    static decodeUtf8( a: UPLCTerm ): PureUPLCTerm
    {
        const _a = getBS( a );
        if( _a === undefined ) return new ErrorUPLC;

        return UPLCConst.str( _a.asBytes.toString("utf8") );
    }
    static ifThenElse( condition: UPLCTerm, caseTrue: PureUPLCTerm, caseFalse: PureUPLCTerm ): PureUPLCTerm
    {
        if(! isConstOfType( condition, constT.bool ) ) return new ErrorUPLC;
        
        return condition.value ? caseTrue : caseFalse;
    }
    static chooseUnit( unit: UPLCTerm, b: UPLCTerm ): UPLCTerm
    {
        if( !isConstOfType( unit, constT.unit ) ) return new ErrorUPLC
        return b;
    }
}