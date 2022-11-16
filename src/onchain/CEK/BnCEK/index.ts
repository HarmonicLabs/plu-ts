import UPLCTerm from "../../UPLC/UPLCTerm";
import UPLCBuiltinTag from "../../UPLC/UPLCTerms/Builtin/UPLCBuiltinTag";
import ErrorUPLC from "../../UPLC/UPLCTerms/ErrorUPLC";
import UPLCConst from "../../UPLC/UPLCTerms/UPLCConst";
import ConstType, { constListTypeUtils, constPairTypeUtils, constT, constTypeEq, constTypeToStirng, ConstTyTag } from "../../UPLC/UPLCTerms/UPLCConst/ConstType" 
import PartialBuiltin from "./PartialBuiltin";
import Integer, { UInteger } from "../../../types/ints/Integer";
import ConstValue from "../../UPLC/UPLCTerms/UPLCConst/ConstValue";
import ByteString from "../../../types/HexString/ByteString";
import Data, { eqData, isData } from "../../../types/Data";
import BigIntUtils from "../../../utils/BigIntUtils";
import Pair from "../../../types/structs/Pair";
import DataConstr from "../../../types/Data/DataConstr";
import DataMap from "../../../types/Data/DataMap";
import DataList from "../../../types/Data/DataList";
import DataI from "../../../types/Data/DataI";
import DataB from "../../../types/Data/DataB";
import DataPair from "../../../types/Data/DataPair";
import PlutsCEKError from "../../../errors/PlutsCEKError";
import dataToCbor from "../../../types/Data/toCbor";
import CEKHeap from "../CEKHeap";

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
    );
}

function getInt( a: UPLCTerm ): bigint | undefined
{
    if( !isConstOfType( a, constT.int ) ) return undefined;
    return (a.value as Integer).asBigInt;
}

function getInts( a: UPLCTerm, b: UPLCTerm ): ( { a: bigint,  b: bigint } | undefined )
{
    if( !isConstOfType( a, constT.int ) ) return undefined;
    if( !isConstOfType( b, constT.int ) ) return undefined;

    return {
        a: (a.value as Integer).asBigInt,
        b: (b.value as Integer).asBigInt
    };
}

function getBS( a: UPLCTerm ): ByteString | undefined
{
    if( !isConstOfType( a, constT.byteStr ) ) return undefined;
    return a.value as any;
}

function getStr( a: UPLCTerm ): string | undefined
{
    if( !isConstOfType( a, constT.str ) ) return undefined;
    return a.value as any;
}

function getList( list: UPLCTerm ): ConstValue[] | undefined
{
    if(!(
        list instanceof UPLCConst &&
        list.type[0] === ConstTyTag.list &&
        Array.isArray( list.value )
    )) return undefined;

    return list.value;
}

function getPair( pair: UPLCTerm ): Pair<ConstValue,ConstValue> | undefined
{
    if(!(
        pair instanceof UPLCConst &&
        pair.type[0] === ConstTyTag.pair &&
        Pair.isStrictInstance( pair.value )
    )) return undefined;

    return pair.clone().value as any;
}

function getData( data: UPLCTerm ): Data | undefined
{
    if(!(
        data instanceof UPLCConst &&
        constTypeEq( data.type, constT.data ) &&
        isData( data.value )
    )) return undefined;

    return data.value;
}

function intBinOp( a: UPLCTerm, b: UPLCTerm , op: (a: bigint, b: bigint) => bigint | undefined ): ConstOrErr
{
    const ints = getInts( a, b );
    if( ints === undefined ) return new ErrorUPLC("");

    const result = op( ints.a, ints.b);
    if( result === undefined ) return new ErrorUPLC("");

    return UPLCConst.int( result );
}

export function haskellQuot( a: bigint, b: bigint ): bigint | undefined
{
    if( b === BigInt( 0 ) ) return undefined;
    return a / b;
}

export function haskellRem( a: bigint, b: bigint ): bigint | undefined
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

export function haskellDiv( a: bigint, b: bigint ): bigint | undefined
{
    const dm = haskellDivMod( a, b );
    if( dm === undefined ) return undefined;
    return dm[0];
}

export function haskellMod( a: bigint, b: bigint ): bigint | undefined
{
    const dm = haskellDivMod( a, b );
    if( dm === undefined ) return undefined;
    return dm[1];
}

type ConstOrErr = UPLCConst | ErrorUPLC;

export default class BnCEK
{
    private constructor() {};

    // static eval( bn: PartialBuiltin ): ConstOrErr
    // {
    //     const res = BnCEK._eval( bn );
    //     console.log( `${bn.tag} evaluation result:`, res );
    //     return res;
    // }

    static eval( bn: PartialBuiltin, heapRef: CEKHeap ): ConstOrErr
    {
        const bnArgs = bn.heapArgsPtrs.map( ptr => heapRef.get( ptr ) );
        switch( bn.tag )
        {
            case UPLCBuiltinTag.addInteger :                        return (BnCEK.addInteger as any)( ...bnArgs );
            case UPLCBuiltinTag.subtractInteger :                   return (BnCEK.subtractInteger as any)( ...bnArgs );
            case UPLCBuiltinTag.multiplyInteger :                   return (BnCEK.multiplyInteger as any)( ...bnArgs );
            case UPLCBuiltinTag.divideInteger :                     return (BnCEK.divideInteger as any)( ...bnArgs );
            case UPLCBuiltinTag.quotientInteger :                   return (BnCEK.quotientInteger as any)( ...bnArgs );
            case UPLCBuiltinTag.remainderInteger :                  return (BnCEK.remainderInteger as any)( ...bnArgs );
            case UPLCBuiltinTag.modInteger :                        return (BnCEK.modInteger as any)( ...bnArgs );
            case UPLCBuiltinTag.equalsInteger :                     return (BnCEK.equalsInteger as any)( ...bnArgs );
            case UPLCBuiltinTag.lessThanInteger :                   return (BnCEK.lessThanInteger as any)( ...bnArgs );
            case UPLCBuiltinTag.lessThanEqualInteger :              return (BnCEK.lessThanEqualInteger as any)( ...bnArgs );
            case UPLCBuiltinTag.appendByteString :                  return (BnCEK.appendByteString as any)( ...bnArgs );
            case UPLCBuiltinTag.consByteString :                    return (BnCEK.consByteString as any)( ...bnArgs );
            case UPLCBuiltinTag.sliceByteString :                   return (BnCEK.sliceByteString as any)( ...bnArgs );
            case UPLCBuiltinTag.lengthOfByteString :                return (BnCEK.lengthOfByteString as any)( ...bnArgs );
            case UPLCBuiltinTag.indexByteString :                   return (BnCEK.indexByteString as any)( ...bnArgs );
            case UPLCBuiltinTag.equalsByteString :                  return (BnCEK.equalsByteString as any)( ...bnArgs );
            case UPLCBuiltinTag.lessThanByteString :                return (BnCEK.lessThanByteString as any)( ...bnArgs );
            case UPLCBuiltinTag.lessThanEqualsByteString :          return (BnCEK.lessThanEqualsByteString as any)( ...bnArgs );
            case UPLCBuiltinTag.sha2_256 :                          throw new PlutsCEKError("builtin implementation missing");// return (BnCEK.sha2_256 as any)( ...bnArgs );
            case UPLCBuiltinTag.sha3_256 :                          throw new PlutsCEKError("builtin implementation missing");// return (BnCEK.sha3_256 as any)( ...bnArgs );
            case UPLCBuiltinTag.blake2b_256 :                       throw new PlutsCEKError("builtin implementation missing");// return (BnCEK.blake2b_256 as any)( ...bnArgs );
            case UPLCBuiltinTag.verifyEd25519Signature:             throw new PlutsCEKError("builtin implementation missing");// return (BnCEK.verifyEd25519Signature as any)( ...bnArgs );
            case UPLCBuiltinTag.appendString :                      return (BnCEK.appendString as any)( ...bnArgs );
            case UPLCBuiltinTag.equalsString :                      return (BnCEK.equalsString as any)( ...bnArgs );
            case UPLCBuiltinTag.encodeUtf8 :                        return (BnCEK.encodeUtf8 as any)( ...bnArgs );
            case UPLCBuiltinTag.decodeUtf8 :                        return (BnCEK.decodeUtf8 as any)( ...bnArgs );
            case UPLCBuiltinTag.ifThenElse :                        return (BnCEK.ifThenElse as any)( ...bnArgs );
            case UPLCBuiltinTag.chooseUnit :                        return (BnCEK.chooseUnit as any)( ...bnArgs );
            case UPLCBuiltinTag.trace :                             return (BnCEK.trace as any)( ...bnArgs );
            case UPLCBuiltinTag.fstPair :                           return (BnCEK.fstPair as any)( ...bnArgs );
            case UPLCBuiltinTag.sndPair :                           return (BnCEK.sndPair as any)( ...bnArgs );
            case UPLCBuiltinTag.chooseList :                        return (BnCEK.chooseList as any)( ...bnArgs );
            case UPLCBuiltinTag.mkCons :                            return (BnCEK.mkCons as any)( ...bnArgs );
            case UPLCBuiltinTag.headList :                          return (BnCEK.headList as any)( ...bnArgs );
            case UPLCBuiltinTag.tailList :                          return (BnCEK.tailList as any)( ...bnArgs );
            case UPLCBuiltinTag.nullList :                          return (BnCEK.nullList as any)( ...bnArgs );
            case UPLCBuiltinTag.chooseData :                        return (BnCEK.chooseData as any)( ...bnArgs );
            case UPLCBuiltinTag.constrData :                        return (BnCEK.constrData as any)( ...bnArgs );
            case UPLCBuiltinTag.mapData :                           return (BnCEK.mapData as any)( ...bnArgs );
            case UPLCBuiltinTag.listData :                          return (BnCEK.listData as any)( ...bnArgs );
            case UPLCBuiltinTag.iData    :                          return (BnCEK.iData as any)( ...bnArgs );
            case UPLCBuiltinTag.bData    :                          return (BnCEK.bData as any)( ...bnArgs );
            case UPLCBuiltinTag.unConstrData :                      return (BnCEK.unConstrData as any)( ...bnArgs );
            case UPLCBuiltinTag.unMapData    :                      return (BnCEK.unMapData as any)( ...bnArgs );
            case UPLCBuiltinTag.unListData   :                      return (BnCEK.unListData as any)( ...bnArgs );
            case UPLCBuiltinTag.unIData      :                      return (BnCEK.unIData as any)( ...bnArgs );
            case UPLCBuiltinTag.unBData      :                      return (BnCEK.unBData as any)( ...bnArgs );
            case UPLCBuiltinTag.equalsData   :                      return (BnCEK.equalsData as any)( ...bnArgs );
            case UPLCBuiltinTag.mkPairData   :                      return (BnCEK.mkPairData as any)( ...bnArgs );
            case UPLCBuiltinTag.mkNilData    :                      return (BnCEK.mkNilData as any)( ...bnArgs );
            case UPLCBuiltinTag.mkNilPairData:                      return (BnCEK.mkNilPairData as any)( ...bnArgs );
            case UPLCBuiltinTag.serialiseData:                      return (BnCEK.serialiseData as any)( ...bnArgs );
            case UPLCBuiltinTag.verifyEcdsaSecp256k1Signature:      throw new PlutsCEKError("builtin implementation missing"); //return (BnCEK.verifyEcdsaSecp256k1Signature as any)( ...bnArgs );
            case UPLCBuiltinTag.verifySchnorrSecp256k1Signature:    throw new PlutsCEKError("builtin implementation missing"); //return (BnCEK.verifySchnorrSecp256k1Signature as any)( ...bnArgs );

            
            default:
                // tag; // check that is of type 'never'
                return new ErrorUPLC("unrecognized builtin tag");
        }
    }

    static addInteger( a: UPLCTerm, b: UPLCTerm ): ConstOrErr         { return intBinOp( a , b, (a, b) => a + b ); }
    static subtractInteger( a: UPLCTerm, b: UPLCTerm ): ConstOrErr    { return intBinOp( a , b, (a, b) => a - b ); }
    static multiplyInteger( a: UPLCTerm, b: UPLCTerm ): ConstOrErr    { return intBinOp( a , b, (a, b) => a * b ); }
    static divideInteger( a: UPLCTerm, b: UPLCTerm ): ConstOrErr      { return intBinOp( a , b, haskellDiv      ); }
    static quotientInteger( a: UPLCTerm, b: UPLCTerm ): ConstOrErr    { return intBinOp( a , b, haskellQuot     ); }
    static remainderInteger( a: UPLCTerm, b: UPLCTerm ): ConstOrErr   { return intBinOp( a , b, haskellRem      ); }
    static modInteger( a: UPLCTerm, b: UPLCTerm ): ConstOrErr         { return intBinOp( a , b, haskellMod      ); }
    static equalsInteger( a: UPLCTerm, b: UPLCTerm ): ConstOrErr
    {
        const ints = getInts( a, b );
        if( ints === undefined ) return new ErrorUPLC("not integers");

        return UPLCConst.bool( ints.a === ints.b );
    }
    static lessThanInteger( a: UPLCTerm, b: UPLCTerm ): ConstOrErr
    {
        const ints = getInts( a, b );
        if( ints === undefined ) return new ErrorUPLC("not integers");

        return UPLCConst.bool( ints.a < ints.b );
    }
    static lessThanEqualInteger( a: UPLCTerm, b: UPLCTerm ): ConstOrErr
    {
        const ints = getInts( a, b );
        if( ints === undefined ) return new ErrorUPLC("not integers");

        return UPLCConst.bool( ints.a <= ints.b );
    }
    static appendByteString( a: UPLCTerm, b: UPLCTerm ): ConstOrErr
    {
        const _a = getBS( a );
        if( _a === undefined ) return new ErrorUPLC("not BS");
        const _b = getBS( b );
        if(_b === undefined ) return new ErrorUPLC("not BS");

        return UPLCConst.byteString(  new ByteString( _a.asString + _b.asString ) );
    }
    static consByteString( a: UPLCTerm, b: UPLCTerm ): ConstOrErr
    {
        let _a = getInt( a );
        if( _a === undefined ) return new ErrorUPLC("not Int");
        _a = BigIntUtils.abs( _a ) % BigInt( 256 );

        const _b = getBS( b );
        if(_b === undefined ) return new ErrorUPLC("not BS");

        return UPLCConst.byteString(  new ByteString( _a.toString(16).padStart( 2, '0' ) + _b.asString ) );
    }
    static sliceByteString( fromIdx: UPLCTerm, ofLength: UPLCTerm, bs: UPLCTerm ): ConstOrErr
    {
        const idx = getInt( fromIdx );
        if( idx === undefined ) return new ErrorUPLC("not int");

        const length = getInt( ofLength );
        if( length === undefined ) return new ErrorUPLC("not int");

        const _bs = getBS( bs );
        if( _bs === undefined ) return new ErrorUPLC("not BS");

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
    static lengthOfByteString( bs: UPLCTerm ): ConstOrErr
    {
        const _bs = getBS( bs );
        if( _bs === undefined ) return new ErrorUPLC("not BS");

        return UPLCConst.int( _bs.asBytes.length );
    }
    static indexByteString( bs: UPLCTerm, idx: UPLCTerm ): ConstOrErr
    {
        const _bs = getBS( bs );
        if( _bs === undefined ) return new ErrorUPLC("not BS");
        
        const i = getInt( idx );
        if( i === undefined || i >= _bs.asBytes.length || i < BigInt( 0 ) ) return new ErrorUPLC("not int");

        const result = _bs.asBytes.at( Number( i ) );
        if( result === undefined ) return new ErrorUPLC("out of bytestring length");

        return UPLCConst.int( result );
    }
    static equalsByteString( a: UPLCTerm, b: UPLCTerm ): ConstOrErr
    {
        const _a = getBS( a );
        if( _a === undefined ) return new ErrorUPLC("not BS");
        
        const _b = getBS( b );
        if( _b === undefined ) return new ErrorUPLC("not BS");

        return UPLCConst.bool( _a.asString === _b.asString );
    }
    static lessThanByteString( a: UPLCTerm, b: UPLCTerm ): ConstOrErr
    {
        const _a = getBS( a );
        if( _a === undefined ) return new ErrorUPLC("not BS");
        
        const _b = getBS( b );
        if( _b === undefined ) return new ErrorUPLC("not BS");

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
    static lessThanEqualsByteString( a: UPLCTerm, b: UPLCTerm ): ConstOrErr
    {
        const _a = getBS( a );
        if( _a === undefined ) return new ErrorUPLC("not BS");
        
        const _b = getBS( b );
        if( _b === undefined ) return new ErrorUPLC("not BS");

        if( _a.asString === _b.asString ) return UPLCConst.bool( true );
        return BnCEK.lessThanByteString( a, b );
    }

    // @todo
    //
    // static sha2_256
    // static sha3_256
    // static blake2b_256
    // static verifyEd25519Signature

    static appendString( a: UPLCTerm, b: UPLCTerm ): ConstOrErr
    {
        const _a = getStr( a );
        if( _a === undefined ) return new ErrorUPLC("not Str");
        
        const _b = getStr( b );
        if( _b === undefined ) return new ErrorUPLC("not Str");

        return UPLCConst.str( _a + _b )
    }
    static equalsString( a: UPLCTerm, b: UPLCTerm ): ConstOrErr
    {
        const _a = getStr( a );
        if( _a === undefined ) return new ErrorUPLC("not Str");
        
        const _b = getStr( b );
        if( _b === undefined ) return new ErrorUPLC("not Str");

        return UPLCConst.bool( _a === _b )
    }
    static encodeUtf8( a: UPLCTerm ): ConstOrErr
    {
        const _a = getStr( a );
        if( _a === undefined ) return new ErrorUPLC("not Str");

        return UPLCConst.byteString( new ByteString( Buffer.from( _a , "utf8" ) ) );
    }
    static decodeUtf8( a: UPLCTerm ): ConstOrErr
    {
        const _a = getBS( a );
        if( _a === undefined ) return new ErrorUPLC("not BS");

        return UPLCConst.str( _a.asBytes.toString("utf8") );
    }
    static ifThenElse( condition: UPLCTerm, caseTrue: ConstOrErr, caseFalse: ConstOrErr ): ConstOrErr
    {
        if(! isConstOfType( condition, constT.bool ) ) return new ErrorUPLC("not a boolean");
        
        return condition.value ? caseTrue : caseFalse;
    }
    static chooseUnit( unit: UPLCTerm, b: UPLCTerm ): UPLCTerm
    {
        if( !isConstOfType( unit, constT.unit ) ) return new ErrorUPLC("nota a unit");
        return b;
    }
    static trace( msg: UPLCConst, result: UPLCTerm ): UPLCTerm
    {
        const _msg = getStr( msg );
        console.log("trace: " + _msg ?? "_msg_not_a_str_");
        return result;
    }
    static fstPair( pair: UPLCTerm ): ConstOrErr
    {
        const p = getPair( pair );
        if( p === undefined ) return new ErrorUPLC("not a pair");

        return new UPLCConst(
            constPairTypeUtils.getFirstTypeArgument( (pair as UPLCConst).type ),
            p.fst as any
        );
    }
    static sndPair( pair: UPLCTerm ): ConstOrErr
    {
        const p = getPair( pair );
        if( p === undefined ) return new ErrorUPLC("not a pair");

        return new UPLCConst(
            constPairTypeUtils.getSecondTypeArgument( (pair as UPLCConst).type ),
            p.snd as any
        );
    }
    static chooseList( list: UPLCTerm, whateverA: UPLCTerm, whateverB: UPLCTerm ): UPLCTerm 
    {
        const l = getList( list );
        if( l === undefined ) return new ErrorUPLC("not a list");

        return l.length === 0 ? whateverA : whateverB;
    }
    static mkCons( elem: UPLCTerm, list: UPLCTerm )
    {
        if(!(
            elem instanceof UPLCConst &&
            list instanceof UPLCConst &&
            list.type[0] === ConstTyTag.list &&
            constTypeEq( elem.type, constListTypeUtils.getTypeArgument( list.type as any ) )
        )) return new ErrorUPLC("incongruent list types");

        const l = getList( list );
        if( l === undefined ) return new ErrorUPLC("not a list");

        l.unshift( elem.value );

        return new UPLCConst(
            list.type,
            l as any
        );
    }
    static headList( list: UPLCTerm ): ConstOrErr 
    {
        const l = getList( list );
        if( l === undefined || l.length === 0 ) return new ErrorUPLC(l === undefined ? "not a list" : "empty list passed to 'head'");

        return new UPLCConst(
            constListTypeUtils.getTypeArgument( (list as UPLCConst).type as any ),
            l[0] as any
        );
    }
    static tailList( list: UPLCTerm ): ConstOrErr 
    {
        const l = getList( list );
        if( l === undefined || l.length === 0 ) return new ErrorUPLC(l === undefined ? "not a list" : "empty list passed to 'tail'");

        return new UPLCConst(
            (list as UPLCConst).type,
            l.slice(1) as any
        );
    }
    static nullList( list: UPLCTerm ): ConstOrErr 
    {
        const l = getList( list );
        if( l === undefined ) return new ErrorUPLC("not a list");

        return UPLCConst.bool( l.length === 0 )
    }
    static chooseData( data: UPLCTerm, constr: UPLCTerm, map: UPLCTerm, list: UPLCTerm, int: UPLCTerm, bs: UPLCTerm ): ConstOrErr
    {
        const d = getData( data );
        if( d === undefined ) return new ErrorUPLC("not data");

        if( d instanceof DataConstr ) return constr;
        if( d instanceof DataMap ) return map;
        if( d instanceof DataList ) return list;
        if( d instanceof DataI ) return int;
        if( d instanceof DataB ) return bs;

        return new ErrorUPLC("unrecognized data, possibly DataPair");
    }
    static constrData( idx: UPLCTerm, fields: UPLCTerm ): ConstOrErr
    {
        const i = getInt( idx );
        if( i === undefined ) return new ErrorUPLC("not int");

        if( !constTypeEq( (fields as any).type, constT.listOf( constT.data ) ) ) return new ErrorUPLC("passed fields are not a list of Data");
        
        const f: Data[] | undefined = getList( fields ) as any;
        if( f === undefined ) return new ErrorUPLC("not a list");

        // assert we got a list of data
        // ( the type has been forced but not the value )
        if( !f.every( field => isData( field ) ) ) return new ErrorUPLC("some of the fields are not Data, mismatching type btw");

        return UPLCConst.data(
            new DataConstr( i, f )
        );
    }
    static mapData( listOfPair: UPLCTerm ): ConstOrErr
    {
        if(!(
            listOfPair instanceof UPLCConst &&
            constTypeEq(
                listOfPair.type,
                constT.listOf(
                    constT.pairOf(
                        constT.data,
                        constT.data
                    )
                )
            )
        )) return new ErrorUPLC("not a const map");

        const list: Pair<Data,Data>[] | undefined = getList( listOfPair ) as any ;
        if( list === undefined ) return new ErrorUPLC("not a list");

        // assert we got a list of pair of datas
        // ( the type has been forced but not the value )
        if(
            !list.every( pair =>
                Pair.isStrictInstance( pair ) &&
                isData( pair.fst ) &&
                isData( pair.snd ) 
            )
        ) return new ErrorUPLC("some elements are not a pair, mismatching type btw");

        return UPLCConst.data(
            new DataMap(
                list.map( pair => new DataPair( pair.fst, pair.snd ) )
            )
        );
    }
    static listData( listOfData: UPLCTerm ): ConstOrErr
    {
        if(!(
            listOfData instanceof UPLCConst &&
            constTypeEq(
                listOfData.type,
                constT.listOf(
                    constT.data
                )
            )
        )) return new ErrorUPLC("not a list of data");

        const list: Data[] | undefined = getList( listOfData ) as any ;
        if( list === undefined ) return new ErrorUPLC("not a list");

        // assert we got a list of data
        // ( the type has been forced but not the value )
        if( !list.every( data => isData( data ) ) ) return new ErrorUPLC("some of the elements are not data, mismatching type btw");

        return UPLCConst.data(
            new DataList( list )
        );
    }
    static iData( int: UPLCTerm ): ConstOrErr
    {
        const i = getInt( int );
        if( i === undefined ) return new ErrorUPLC("not an int");

        return UPLCConst.data( new DataI( i ) );
    }
    static bData( bs: UPLCTerm ): ConstOrErr
    {
        const b = getBS( bs );
        if( b === undefined ) return new ErrorUPLC("not BS");

        return UPLCConst.data( new DataB( b ) );
    }
    static unConstrData( data: UPLCTerm ): ConstOrErr
    {
        const d = getData( data );
        if( d === undefined ) return new ErrorUPLC(`not data; unConstrData${ data instanceof UPLCConst ? "; " + constTypeToStirng(data.type) :""}`);

        if( !( d instanceof DataConstr ) ) return new ErrorUPLC("not a data constructor");

        return UPLCConst.pairOf( constT.int, constT.listOf( constT.data ) )(
            d.constr,
            d.fields
        );
    }
    static unMapData( data: UPLCTerm ): ConstOrErr
    {
        const d = getData( data );
        if( d === undefined ) return new ErrorUPLC("not data; unMapData");

        if( !( d instanceof DataMap ) ) return new ErrorUPLC("not a data map");

        return UPLCConst.listOf( constT.pairOf( constT.data, constT.data ) )(
            d.map.map( dataPair => new Pair<Data,Data>( dataPair.fst, dataPair.snd ) )
        );
    }
    static unListData( data: UPLCTerm ): ConstOrErr
    {
        const d = getData( data );
        if( d === undefined ) return new ErrorUPLC("not data; unListData");

        if( !( d instanceof DataList ) ) return new ErrorUPLC("not a data list");

        return UPLCConst.listOf( constT.data )(
            d.list
        );
    }
    static unIData( data: UPLCTerm ): ConstOrErr
    {
        const d = getData( data );
        if( d === undefined ) return new ErrorUPLC("not data; unIData");

        if( !( d instanceof DataI ) ) return new ErrorUPLC("not a data integer");

        return UPLCConst.int( d.int );
    }
    static unBData( data: UPLCTerm ): ConstOrErr
    {
        const d = getData( data );
        if( d === undefined ) return new ErrorUPLC("not data; unBData");

        if( !( d instanceof DataB ) ) return new ErrorUPLC("not a data BS", {UPLCTerm: ((data as UPLCConst).value as DataConstr).constr.asBigInt });

        return UPLCConst.byteString( d.bytes );
    }
    static equalsData( a: UPLCTerm, b: UPLCTerm ): ConstOrErr
    {
        const _a = getData( a );
        if( _a === undefined ) return new ErrorUPLC("not data; equalsData <first argument>");
        const _b = getData( b );
        if( _b === undefined ) return new ErrorUPLC("not data; equalsData <second argument>");
        
        return UPLCConst.bool( eqData( _a, _b ) );
    }
    static mkPairData( a: UPLCTerm, b: UPLCTerm ): ConstOrErr
    {
        const _a = getData( a );
        if( _a === undefined ) return new ErrorUPLC("not data; mkPairData <frist argument>");
        const _b = getData( b );
        if( _b === undefined ) return new ErrorUPLC("not data; mkPairData <second argument>");
        
        return UPLCConst.pairOf( constT.data, constT.data )( _a, _b );
    }
    static mkNilData( unit: UPLCTerm ): ConstOrErr
    {
        if( !isConstOfType( unit, constT.unit ) ) return new ErrorUPLC("not unit");
        return UPLCConst.listOf( constT.data )([]);
    }
    static mkNilPairData( unit: UPLCTerm ): ConstOrErr
    {
        if( !isConstOfType( unit, constT.unit ) ) return new ErrorUPLC("not unit");
        return UPLCConst.listOf( constT.pairOf( constT.data, constT.data ) )([]);
    }

    static serialiseData( data: UPLCTerm ): ConstOrErr
    {
        const d = getData( data );
        if( d === undefined ) return new ErrorUPLC("serialiseData: not data input");

        return UPLCConst.byteString( new ByteString( dataToCbor( d ).asBytes ) );
    } 
    // @todo
    //                   
    // static verifyEcdsaSecp256k1Signature  
    // static verifySchnorrSecp256k1Signature
}