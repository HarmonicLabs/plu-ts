import BigIntUtils from "../../../utils/BigIntUtils";

import { UPLCTerm } from "../../UPLC/UPLCTerm";
import { UPLCBuiltinTag } from "../../UPLC/UPLCTerms/Builtin/UPLCBuiltinTag";
import { ErrorUPLC } from "../../UPLC/UPLCTerms/ErrorUPLC";
import { UPLCConst } from "../../UPLC/UPLCTerms/UPLCConst";
import { PartialBuiltin } from "./PartialBuiltin";
import { ConstValue, isConstValueInt } from "../../UPLC/UPLCTerms/UPLCConst/ConstValue";
import { ByteString } from "../../../types/HexString/ByteString";
import { Pair } from "../../../types/structs/Pair";
import { DataConstr } from "../../../types/Data/DataConstr";
import { DataMap } from "../../../types/Data/DataMap";
import { DataList } from "../../../types/Data/DataList";
import { DataI } from "../../../types/Data/DataI";
import { DataB } from "../../../types/Data/DataB";
import { DataPair } from "../../../types/Data/DataPair";
import { PlutsCEKError } from "../../../errors/PlutsCEKError";
import { dataToCbor } from "../../../types/Data/toCbor";
import { ExBudget } from "../Machine/ExBudget";
import { BuiltinCostsOf } from "../Machine/BuiltinCosts";
import { ConstType, constListTypeUtils, constPairTypeUtils, constT, constTypeEq, constTypeToStirng, ConstTyTag } from "../../UPLC/UPLCTerms/UPLCConst/ConstType" 
import { Data, eqData, isData } from "../../../types/Data/Data";
import { blake2b, byteArrToHex, sha2_256, sha3, verifyEd25519Signature } from "../../../crypto";
import { fromUtf8, isUint8Array, toUtf8 } from "@harmoniclabs/uint8array-utils";
import { logJson } from "../../../utils/ts/ToJson";


function intToSize( n: bigint ): bigint
{
    n = BigInt( n );
    if ( n === BigInt( 0 ) ) return BigInt( 1 );

    // same as `intToSize( -n - BigInt( 1 ) )` but inlined
    if( n  < BigInt( 0 ) ) return ( BigIntUtils.log2( ( -n - BigInt( 1 ) ) << BigInt( 1 ) ) / BigInt( 8 )) + BigInt( 1 ) ;

    return ( BigIntUtils.log2( n << BigInt( 1 ) ) / BigInt( 8 )) + BigInt( 1 );
}

function bsToSize( bs: ByteString | Uint8Array ): bigint
{
    const len = (isUint8Array( bs ) ? bs : bs.toBuffer()).length;
    return len === 0 ?
        // TODO: Bug in cardano-node; to fix next hard fork
        BigInt(1) :
        BigInt( len );
}

function strToSize( str: string ): bigint
{
    return bsToSize( fromUtf8( str ) )
};

const BOOL_SIZE: bigint = BigInt( 1 );
const ANY_SIZE: bigint = BigInt( 1 );

function constValueToSize( v: ConstValue ): bigint
{
    if( isConstValueInt( v ) ) return intToSize( BigInt( v as any ) );
    if( v instanceof ByteString ) return bsToSize( v.toBuffer() );
    if( typeof v === "string" ) return strToSize( v );
    if( typeof v === "undefined" ) return ANY_SIZE;
    if( typeof v === "boolean" ) return BOOL_SIZE;
    if( isData( v ) ) return dataToSize( v );

    if( Array.isArray( v ) ) return listToSize( v );

    if( v instanceof Pair ) return pairToSize( v );

    console.warn("unexpected 'constValueToSize'; exec costs evaluation might be inaccurate");
    return ANY_SIZE;
}

function listToSize( l: ConstValue[] ): bigint
{
    return l.reduce<bigint>( (acc, elem) => acc + constValueToSize( elem ), BigInt(0) );
}

function pairToSize( pairValue: Pair<ConstValue,ConstValue> ): bigint
{
    return constValueToSize( pairValue.fst ) + constValueToSize( pairValue.snd )
}

function dataToSize( data: Data ): bigint
{
    const stack: Data[] = [ data ];
    let tot: bigint = BigInt( 0 );

    while( stack.length > 0 )
    {
        const top = stack.pop();
        tot += BigInt( 4 );

        if( top instanceof DataConstr )
        {
            stack.unshift( ...top.fields );
        }
        else if( top instanceof DataMap )
        {
            stack.unshift(
                ...top.map.reduce<Data[]>(
                    ( accum, elem ) => [ elem.fst, elem.snd, ...accum ] , []
                )
            );
        }
        else if( top instanceof DataList )
        {
            stack.unshift(
                ...top.list
            );
        }
        else if( top instanceof DataI )
        {
            tot += intToSize( top.int );
        }
        else if( top instanceof DataB )
        {
            tot += bsToSize( top.bytes )
        }
        else break; // top === undefined; stack empty (unreachable)
    }

    return tot;
}


function isConstOfType( constant: Readonly<UPLCTerm>, ty: Readonly<ConstType> ): constant is UPLCConst
{
    const checkValue = ( v: ConstValue ): boolean =>
    {
        if( constTypeEq( constT.int, ty ) )
        {
            return isConstValueInt( v );
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
    return BigInt( a.value as any );
}

function getInts( a: UPLCTerm, b: UPLCTerm ): ( { a: bigint,  b: bigint } | undefined )
{
    if( !isConstOfType( a, constT.int ) ) return undefined;
    if( !isConstOfType( b, constT.int ) ) return undefined;

    return {
        a: BigInt( a.value as any ),
        b: BigInt( b.value as any )
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

    return list.value.slice();
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

function intBinOp( a: UPLCTerm, b: UPLCTerm , op: (a: bigint, b: bigint) => bigint | undefined , fnName: string ): ConstOrErr
{
    const ints = getInts( a, b );
    if( ints === undefined )
    return new ErrorUPLC(`${fnName} :: invalid arguments`, { a, b });

    const result = op( ints.a, ints.b);
    if( result === undefined ) return new ErrorUPLC(`${fnName} :: operation error`, { a, b });

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

export class BnCEK
{
    /**
     * **reference** to the budget of the actual machine
    **/
    readonly machineBudget: ExBudget;
    constructor(
        readonly getBuiltinCostFunc: <Tag extends UPLCBuiltinTag>( tag: Tag ) => BuiltinCostsOf<Tag>,
        machineBudget: ExBudget,
        readonly logs: string[]  
    ){
        this.machineBudget = machineBudget;
    };

    eval( bn: PartialBuiltin ): ConstOrErr
    {
        switch( bn.tag )
        {
            case UPLCBuiltinTag.addInteger :                        return (this.addInteger as any)( ...bn.args );
            case UPLCBuiltinTag.subtractInteger :                   return (this.subtractInteger as any)( ...bn.args );
            case UPLCBuiltinTag.multiplyInteger :                   return (this.multiplyInteger as any)( ...bn.args );
            case UPLCBuiltinTag.divideInteger :                     return (this.divideInteger as any)( ...bn.args );
            case UPLCBuiltinTag.quotientInteger :                   return (this.quotientInteger as any)( ...bn.args );
            case UPLCBuiltinTag.remainderInteger :                  return (this.remainderInteger as any)( ...bn.args );
            case UPLCBuiltinTag.modInteger :                        return (this.modInteger as any)( ...bn.args );
            case UPLCBuiltinTag.equalsInteger :                     return (this.equalsInteger as any)( ...bn.args );
            case UPLCBuiltinTag.lessThanInteger :                   return (this.lessThanInteger as any)( ...bn.args );
            case UPLCBuiltinTag.lessThanEqualInteger :              return (this.lessThanEqualInteger as any)( ...bn.args );
            case UPLCBuiltinTag.appendByteString :                  return (this.appendByteString as any)( ...bn.args );
            case UPLCBuiltinTag.consByteString :                    return (this.consByteString as any)( ...bn.args );
            case UPLCBuiltinTag.sliceByteString :                   return (this.sliceByteString as any)( ...bn.args );
            case UPLCBuiltinTag.lengthOfByteString :                return (this.lengthOfByteString as any)( ...bn.args );
            case UPLCBuiltinTag.indexByteString :                   return (this.indexByteString as any)( ...bn.args );
            case UPLCBuiltinTag.equalsByteString :                  return (this.equalsByteString as any)( ...bn.args );
            case UPLCBuiltinTag.lessThanByteString :                return (this.lessThanByteString as any)( ...bn.args );
            case UPLCBuiltinTag.lessThanEqualsByteString :          return (this.lessThanEqualsByteString as any)( ...bn.args );
            case UPLCBuiltinTag.sha2_256 :                          return (this.sha2_256 as any)( ...bn.args );
            case UPLCBuiltinTag.sha3_256 :                          return (this.sha3_256 as any)( ...bn.args );
            case UPLCBuiltinTag.blake2b_256 :                       return (this.blake2b_256 as any)( ...bn.args );
            case UPLCBuiltinTag.verifyEd25519Signature:             return (this.verifyEd25519Signature as any)( ...bn.args );
            case UPLCBuiltinTag.appendString :                      return (this.appendString as any)( ...bn.args );
            case UPLCBuiltinTag.equalsString :                      return (this.equalsString as any)( ...bn.args );
            case UPLCBuiltinTag.encodeUtf8 :                        return (this.encodeUtf8 as any)( ...bn.args );
            case UPLCBuiltinTag.decodeUtf8 :                        return (this.decodeUtf8 as any)( ...bn.args );
            case UPLCBuiltinTag.ifThenElse :                        return (this.ifThenElse as any)( ...bn.args );
            case UPLCBuiltinTag.chooseUnit :                        return (this.chooseUnit as any)( ...bn.args );
            case UPLCBuiltinTag.trace :                             return (this.trace as any)( ...bn.args );
            case UPLCBuiltinTag.fstPair :                           return (this.fstPair as any)( ...bn.args );
            case UPLCBuiltinTag.sndPair :                           return (this.sndPair as any)( ...bn.args );
            case UPLCBuiltinTag.chooseList :                        return (this.chooseList as any)( ...bn.args );
            case UPLCBuiltinTag.mkCons :                            return (this.mkCons as any)( ...bn.args );
            case UPLCBuiltinTag.headList :                          return (this.headList as any)( ...bn.args );
            case UPLCBuiltinTag.tailList :                          return (this.tailList as any)( ...bn.args );
            case UPLCBuiltinTag.nullList :                          return (this.nullList as any)( ...bn.args );
            case UPLCBuiltinTag.chooseData :                        return (this.chooseData as any)( ...bn.args );
            case UPLCBuiltinTag.constrData :                        return (this.constrData as any)( ...bn.args );
            case UPLCBuiltinTag.mapData :                           return (this.mapData as any)( ...bn.args );
            case UPLCBuiltinTag.listData :                          return (this.listData as any)( ...bn.args );
            case UPLCBuiltinTag.iData    :                          return (this.iData as any)( ...bn.args );
            case UPLCBuiltinTag.bData    :                          return (this.bData as any)( ...bn.args );
            case UPLCBuiltinTag.unConstrData :                      return (this.unConstrData as any)( ...bn.args );
            case UPLCBuiltinTag.unMapData    :                      return (this.unMapData as any)( ...bn.args );
            case UPLCBuiltinTag.unListData   :                      return (this.unListData as any)( ...bn.args );
            case UPLCBuiltinTag.unIData      :                      return (this.unIData as any)( ...bn.args );
            case UPLCBuiltinTag.unBData      :                      return (this.unBData as any)( ...bn.args );
            case UPLCBuiltinTag.equalsData   :                      return (this.equalsData as any)( ...bn.args );
            case UPLCBuiltinTag.mkPairData   :                      return (this.mkPairData as any)( ...bn.args );
            case UPLCBuiltinTag.mkNilData    :                      return (this.mkNilData as any)( ...bn.args );
            case UPLCBuiltinTag.mkNilPairData:                      return (this.mkNilPairData as any)( ...bn.args );
            case UPLCBuiltinTag.serialiseData:                      return (this.serialiseData as any)( ...bn.args );
            case UPLCBuiltinTag.verifyEcdsaSecp256k1Signature:      throw new PlutsCEKError("builtin implementation missing"); //return (this.verifyEcdsaSecp256k1Signature as any)( ...bn.args );
            case UPLCBuiltinTag.verifySchnorrSecp256k1Signature:    throw new PlutsCEKError("builtin implementation missing"); //return (this.verifySchnorrSecp256k1Signature as any)( ...bn.args );

            
            default:
                // tag; // check that is of type 'never'
                return new ErrorUPLC("unrecognized builtin tag");
        }
    }

    addInteger( _a: UPLCTerm, _b: UPLCTerm ): ConstOrErr
    {
        return intBinOp( _a , _b,
            ((a: bigint, b: bigint) => {

                const f = this.getBuiltinCostFunc( UPLCBuiltinTag.addInteger );
                
                const sa = intToSize( a );
                const sb = intToSize( b );
                
                this.machineBudget.add({
                    mem: f.mem.at( sa, sb ),
                    cpu: f.cpu.at( sa, sb )
                });
                
                return a + b;
            }).bind(this),
            "addInteger"
        );
    }
    subtractInteger( _a: UPLCTerm, _b: UPLCTerm ): ConstOrErr
    {
        return intBinOp( _a , _b,
            ((a: bigint, b: bigint) => {

                const f = this.getBuiltinCostFunc( UPLCBuiltinTag.subtractInteger );
                
                const sa = intToSize( a );
                const sb = intToSize( b );
                
                this.machineBudget.add({
                    mem: f.mem.at( sa, sb ),
                    cpu: f.cpu.at( sa, sb )
                });
                
                return a - b;

            }).bind(this),
            "subtractInteger"
        );
    }
    multiplyInteger( _a: UPLCTerm, _b: UPLCTerm ): ConstOrErr
    {
        return intBinOp( _a , _b,
            ((a: bigint, b: bigint) => {

                const f = this.getBuiltinCostFunc( UPLCBuiltinTag.multiplyInteger );
                
                const sa = intToSize( a );
                const sb = intToSize( b );
                
                this.machineBudget.add({
                    mem: f.mem.at( sa, sb ),
                    cpu: f.cpu.at( sa, sb )
                });
                
                return a * b;

            }).bind(this),
            "multiplyInteger"
        );
    }
    divideInteger( _a: UPLCTerm, _b: UPLCTerm ): ConstOrErr
    {
        return intBinOp( _a , _b,
            ((a: bigint, b: bigint) => {

                const f = this.getBuiltinCostFunc( UPLCBuiltinTag.divideInteger );
                
                const sa = intToSize( a );
                const sb = intToSize( b );
                
                this.machineBudget.add({
                    mem: f.mem.at( sa, sb ),
                    cpu: f.cpu.at( sa, sb )
                });
                
                return haskellDiv( a, b );

            }).bind(this),
            "divideInteger"
        );
    }
    quotientInteger( _a: UPLCTerm, _b: UPLCTerm ): ConstOrErr
    {
        return intBinOp( _a , _b,
            ((a: bigint, b: bigint) => {

                const f = this.getBuiltinCostFunc( UPLCBuiltinTag.quotientInteger );
                
                const sa = intToSize( a );
                const sb = intToSize( b );
                
                this.machineBudget.add({
                    mem: f.mem.at( sa, sb ),
                    cpu: f.cpu.at( sa, sb )
                });
                
                return haskellQuot( a, b );

            }).bind(this),
            "quotientInteger"
        );
    }
    remainderInteger( _a: UPLCTerm, _b: UPLCTerm ): ConstOrErr
    {
        return intBinOp( _a , _b,
            ((a: bigint, b: bigint) => {

                const f = this.getBuiltinCostFunc( UPLCBuiltinTag.remainderInteger );
                
                const sa = intToSize( a );
                const sb = intToSize( b );
                
                this.machineBudget.add({
                    mem: f.mem.at( sa, sb ),
                    cpu: f.cpu.at( sa, sb )
                });
                
                return haskellRem( a, b );

            }).bind(this),
            "remainderInteger"
        );
    }
    modInteger( _a: UPLCTerm, _b: UPLCTerm ): ConstOrErr
    {
        return intBinOp( _a , _b,
            ((a: bigint, b: bigint) => {

                const f = this.getBuiltinCostFunc( UPLCBuiltinTag.modInteger );
                
                const sa = intToSize( a );
                const sb = intToSize( b );
                
                this.machineBudget.add({
                    mem: f.mem.at( sa, sb ),
                    cpu: f.cpu.at( sa, sb )
                });
                
                return haskellMod( a, b );

            }).bind(this),
            "modInteger"
        );
    }
    equalsInteger( a: UPLCTerm, b: UPLCTerm ): ConstOrErr
    {
        const ints = getInts( a, b );
        if( ints === undefined )
        return new ErrorUPLC(
            "equalsInteger :: not integers",
            { a, b, ints }
        );

        const f = this.getBuiltinCostFunc( UPLCBuiltinTag.equalsInteger );
                
        const sa = intToSize( ints.a );
        const sb = intToSize( ints.b );
        
        this.machineBudget.add({
            mem: f.mem.at( sa, sb ),
            cpu: f.cpu.at( sa, sb )
        });

        return UPLCConst.bool( ints.a === ints.b );
    }
    lessThanInteger( a: UPLCTerm, b: UPLCTerm ): ConstOrErr
    {
        const ints = getInts( a, b );
        if( ints === undefined )
        return new ErrorUPLC(
            "lessThanInteger :: not integers",
            { a, b }
        );

        const f = this.getBuiltinCostFunc( UPLCBuiltinTag.lessThanInteger );
                
        const sa = intToSize( ints.a );
        const sb = intToSize( ints.b );
        
        this.machineBudget.add({
            mem: f.mem.at( sa, sb ),
            cpu: f.cpu.at( sa, sb )
        });

        return UPLCConst.bool( ints.a < ints.b );
    }
    lessThanEqualInteger( a: UPLCTerm, b: UPLCTerm ): ConstOrErr
    {
        const ints = getInts( a, b );
        if( ints === undefined )
        return new ErrorUPLC(
            "lessThanEqualInteger :: not integers",
            { a, b }
        );

        const f = this.getBuiltinCostFunc( UPLCBuiltinTag.lessThanEqualInteger );
                
        const sa = intToSize( ints.a );
        const sb = intToSize( ints.b );
        
        this.machineBudget.add({
            mem: f.mem.at( sa, sb ),
            cpu: f.cpu.at( sa, sb )
        });

        return UPLCConst.bool( ints.a <= ints.b );
    }
    appendByteString( a: UPLCTerm, b: UPLCTerm ): ConstOrErr
    {
        const _a = getBS( a );
        if( _a === undefined ) return new ErrorUPLC("appendByteString :: not BS");
        const _b = getBS( b );
        if(_b === undefined ) return new ErrorUPLC("appendByteString :: not BS");

        const f = this.getBuiltinCostFunc( UPLCBuiltinTag.appendByteString );
                
        const sa = bsToSize( _a );
        const sb = bsToSize( _b );
        
        this.machineBudget.add({
            mem: f.mem.at( sa, sb ),
            cpu: f.cpu.at( sa, sb )
        });

        return UPLCConst.byteString(  new ByteString( _a.asString + _b.asString ) );
    }
    consByteString( a: UPLCTerm, b: UPLCTerm ): ConstOrErr
    {
        let _a = getInt( a );
        if( _a === undefined ) return new ErrorUPLC("consByteString :: not Int");
        _a = BigIntUtils.abs( _a ) % BigInt( 256 );

        const _b = getBS( b );
        if(_b === undefined ) return new ErrorUPLC("consByteString :: not BS");

        const f = this.getBuiltinCostFunc( UPLCBuiltinTag.consByteString );
                
        const sa = intToSize( _a );
        const sb = bsToSize( _b );
        
        this.machineBudget.add({
            mem: f.mem.at( sa, sb ),
            cpu: f.cpu.at( sa, sb )
        });

        return UPLCConst.byteString(  new ByteString( _a.toString(16).padStart( 2, '0' ) + _b.asString ) );
    }
    sliceByteString( fromIdx: UPLCTerm, ofLength: UPLCTerm, bs: UPLCTerm ): ConstOrErr
    {
        const idx = getInt( fromIdx );
        if( idx === undefined ) return new ErrorUPLC("sliceByteString :: not int");

        const length = getInt( ofLength );
        if( length === undefined ) return new ErrorUPLC("sliceByteString :: not int");

        const _bs = getBS( bs );
        if( _bs === undefined ) return new ErrorUPLC("sliceByteString :: not BS");

        const i = idx < BigInt( 0 ) ? BigInt( 0 ) : idx;

        const endIdx = idx + length - BigInt( 1 );
        const maxIdx = BigInt( _bs.toBuffer().length ) - BigInt( 1 );

        const j = endIdx > maxIdx ? maxIdx : endIdx;

        if( j < i ) return UPLCConst.byteString( new ByteString( Uint8Array.from([]) ) );


        const f = this.getBuiltinCostFunc( UPLCBuiltinTag.sliceByteString );
                
        const sidx = intToSize( idx );
        const slength = intToSize( length );
        const sbs = bsToSize( _bs );
        
        this.machineBudget.add({
            mem: f.mem.at( sidx, slength, sbs ),
            cpu: f.cpu.at( sidx, slength, sbs )
        });

        return UPLCConst.byteString(
            new ByteString(
                Uint8Array.from(
                    _bs.toBuffer().slice(
                        Number( i ), Number( j )
                    )
                )
            )
        );
    }
    lengthOfByteString( bs: UPLCTerm ): ConstOrErr
    {
        const _bs = getBS( bs );
        if( _bs === undefined ) return new ErrorUPLC("lengthOfByteString :: not BS");

        const f = this.getBuiltinCostFunc( UPLCBuiltinTag.lengthOfByteString );
                
        const sbs = bsToSize( _bs );
        
        this.machineBudget.add({
            mem: f.mem.at( sbs ),
            cpu: f.cpu.at( sbs )
        });

        return UPLCConst.int( _bs.toBuffer().length );
    }
    indexByteString( bs: UPLCTerm, idx: UPLCTerm ): ConstOrErr
    {
        const _bs = getBS( bs );
        if( _bs === undefined ) return new ErrorUPLC("indexByteString :: not BS");
        
        const i = getInt( idx );
        if( i === undefined || i >= _bs.toBuffer().length || i < BigInt( 0 ) ) return new ErrorUPLC("not int");

        const result = _bs.toBuffer().at( Number( i ) );
        if( result === undefined ) return new ErrorUPLC("indexByteString :: out of bytestring length");


        const f = this.getBuiltinCostFunc( UPLCBuiltinTag.indexByteString );
                
        const sbs = bsToSize( _bs );
        const sidx = intToSize( i );
        
        this.machineBudget.add({
            mem: f.mem.at( sbs, sidx ),
            cpu: f.cpu.at( sbs, sidx )
        });

        return UPLCConst.int( result );
    }
    equalsByteString( a: UPLCTerm, b: UPLCTerm ): ConstOrErr
    {
        const _a = getBS( a );
        if( _a === undefined )
        return new ErrorUPLC(
            "equalsByteString :: first argument not BS",
            {
                bs_0: a,
                bs_1: b 
            }
        );
        
        const _b = getBS( b );
        if( _b === undefined )
        return new ErrorUPLC(
            "equalsByteString :: secondt argument not BS",
            {
                bs_0: a,
                bs_1: b 
            }
        )

        const f = this.getBuiltinCostFunc( UPLCBuiltinTag.equalsByteString );
                
        const sa = bsToSize( _a );
        const sb = bsToSize( _b );
        
        this.machineBudget.add({
            mem: f.mem.at( sa, sb ),
            cpu: f.cpu.at( sa, sb )
        });

        return UPLCConst.bool( _a.asString === _b.asString );
    }
    lessThanByteString( a: UPLCTerm, b: UPLCTerm ): ConstOrErr
    {
        const _a = getBS( a );
        if( _a === undefined ) return new ErrorUPLC("lessThanByteString :: not BS");
        
        const _b = getBS( b );
        if( _b === undefined ) return new ErrorUPLC("lessThanByteString :: not BS");

        const aBytes = _a.toBuffer();
        const bBytes = _b.toBuffer();

        const f = this.getBuiltinCostFunc( UPLCBuiltinTag.lessThanByteString );
                
        const sa = bsToSize( _a );
        const sb = bsToSize( _b );
        
        this.machineBudget.add({
            mem: f.mem.at( sa, sb ),
            cpu: f.cpu.at( sa, sb )
        });

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
    lessThanEqualsByteString( a: UPLCTerm, b: UPLCTerm ): ConstOrErr
    {
        const _a = getBS( a );
        if( _a === undefined ) return new ErrorUPLC("lessThanEqualsByteString :: not BS");
        
        const _b = getBS( b );
        if( _b === undefined ) return new ErrorUPLC("lessThanEqualsByteString :: not BS");

        const f = this.getBuiltinCostFunc( UPLCBuiltinTag.lessThanEqualsByteString );
                
        const sa = bsToSize( _a );
        const sb = bsToSize( _b );
        
        this.machineBudget.add({
            mem: f.mem.at( sa, sb ),
            cpu: f.cpu.at( sa, sb )
        });

        if( _a.asString === _b.asString ) return UPLCConst.bool( true );

        // lessThanBytestring but with new environment for costs;
        return (new BnCEK(this.getBuiltinCostFunc,new ExBudget(0,0), [])).lessThanByteString( a, b );
    }

    sha2_256( stuff: UPLCTerm ): ConstOrErr
    {
        const b = getBS( stuff );
        if( b === undefined ) return new ErrorUPLC("sha2_256 :: not BS");

        const f = this.getBuiltinCostFunc( UPLCBuiltinTag.sha2_256 );

        const sb = bsToSize( b );

        this.machineBudget.add({
            mem: f.mem.at( sb ),
            cpu: f.cpu.at( sb )
        });

        return UPLCConst.byteString(
            new ByteString(
                byteArrToHex(
                    sha2_256( b.toBuffer() )
                )
            )
        );
    }

    sha3_256( stuff: UPLCTerm ): ConstOrErr
    {
        const b = getBS( stuff );
        if( b === undefined ) return new ErrorUPLC("sha3_256 :: not BS");

        const f = this.getBuiltinCostFunc( UPLCBuiltinTag.sha3_256 );

        const sb = bsToSize( b );

        this.machineBudget.add({
            mem: f.mem.at( sb ),
            cpu: f.cpu.at( sb )
        });

        return UPLCConst.byteString(
            new ByteString(
                byteArrToHex(
                    sha3( b.toBuffer() )
                )
            )
        );
    }

    blake2b_256( stuff: UPLCTerm ): ConstOrErr
    {
        const b = getBS( stuff );
        if( b === undefined ) return new ErrorUPLC("blake2b_256 :: not BS");

        const f = this.getBuiltinCostFunc( UPLCBuiltinTag.blake2b_256 );

        const sb = bsToSize( b );

        this.machineBudget.add({
            mem: f.mem.at( sb ),
            cpu: f.cpu.at( sb )
        });

        return UPLCConst.byteString(
            new ByteString(
                blake2b( b.toBuffer(), 32 )
            )
        );
    }

    verifyEd25519Signature( key: UPLCTerm, message: UPLCTerm, signature: UPLCTerm ): ConstOrErr
    {
        const k = getBS( key );
        if( k === undefined ) return new ErrorUPLC("verifyEd25519Signature :: key not BS");
        
        const kBytes = k.toBuffer();
        if( kBytes.length !== 32 ) return new ErrorUPLC("sha2_verifyEd25519Signature256 :: wrong message length");

        const m = getBS( message );
        if( m === undefined ) return new ErrorUPLC("verifyEd25519Signature :: message not BS");

        const s = getBS( signature );
        if( s === undefined ) return new ErrorUPLC("verifyEd25519Signature :: singature not BS");
        const sBytes = s.toBuffer();
        if( sBytes.length !== 64 ) return new ErrorUPLC("sha2_verifyEd25519Signature256 :: wrong signature length");


        const f = this.getBuiltinCostFunc( UPLCBuiltinTag.verifyEd25519Signature );

        const sk = bsToSize( kBytes );
        const sm = bsToSize( m );
        const ss = bsToSize( sBytes );

        this.machineBudget.add({
            mem: f.mem.at( sk, sm, ss ),
            cpu: f.cpu.at( sk, sm, ss )
        });

        return UPLCConst.bool( verifyEd25519Signature( sBytes, m.toBuffer(), kBytes ) );
    }

    appendString( a: UPLCTerm, b: UPLCTerm ): ConstOrErr
    {
        const _a = getStr( a );
        if( _a === undefined ) return new ErrorUPLC("not Str");
        
        const _b = getStr( b );
        if( _b === undefined ) return new ErrorUPLC("not Str");

        const f = this.getBuiltinCostFunc( UPLCBuiltinTag.appendString );

        const sa = strToSize( _a );
        const sb = strToSize( _b );

        this.machineBudget.add({
            mem: f.mem.at( sa, sb ),
            cpu: f.cpu.at( sa, sb )
        });

        return UPLCConst.str( _a + _b )
    }
    equalsString( a: UPLCTerm, b: UPLCTerm ): ConstOrErr
    {
        const _a = getStr( a );
        if( _a === undefined ) return new ErrorUPLC("not Str");
        
        const _b = getStr( b );
        if( _b === undefined ) return new ErrorUPLC("not Str");

        const f = this.getBuiltinCostFunc( UPLCBuiltinTag.equalsString );

        const sa = strToSize( _a );
        const sb = strToSize( _b );

        this.machineBudget.add({
            mem: f.mem.at( sa, sb ),
            cpu: f.cpu.at( sa, sb )
        });

        return UPLCConst.bool( _a === _b )
    }
    encodeUtf8( a: UPLCTerm ): ConstOrErr
    {
        const _a = getStr( a );
        if( _a === undefined ) return new ErrorUPLC("not Str");

        const f = this.getBuiltinCostFunc( UPLCBuiltinTag.encodeUtf8 );

        const sa = strToSize( _a );

        this.machineBudget.add({
            mem: f.mem.at( sa ),
            cpu: f.cpu.at( sa )
        });

        return UPLCConst.byteString( new ByteString( fromUtf8( _a ) ) );
    }
    decodeUtf8( a: UPLCTerm ): ConstOrErr
    {
        const _a = getBS( a );
        if( _a === undefined ) 
        return new ErrorUPLC(
            "decodeUtf8 :: not BS",
            {
                arg: a
            }
        );

        const f = this.getBuiltinCostFunc( UPLCBuiltinTag.decodeUtf8 );

        const sa = bsToSize( _a );

        this.machineBudget.add({
            mem: f.mem.at( sa ),
            cpu: f.cpu.at( sa )
        });

        return UPLCConst.str( toUtf8( _a.toBuffer() ) );
    }
    ifThenElse( condition: UPLCTerm, caseTrue: ConstOrErr, caseFalse: ConstOrErr ): ConstOrErr
    {
        if(! isConstOfType( condition, constT.bool ) ) return new ErrorUPLC("not a boolean");
        
        const f = this.getBuiltinCostFunc( UPLCBuiltinTag.ifThenElse );

        this.machineBudget.add({
            mem: f.mem.at( BOOL_SIZE, ANY_SIZE, ANY_SIZE ),
            cpu: f.cpu.at( BOOL_SIZE, ANY_SIZE, ANY_SIZE ),
        });

        return condition.value ? caseTrue : caseFalse;
    }

    chooseUnit( unit: UPLCTerm, b: UPLCTerm ): UPLCTerm
    {
        if( !isConstOfType( unit, constT.unit ) ) return new ErrorUPLC("nota a unit");

        const f = this.getBuiltinCostFunc( UPLCBuiltinTag.chooseUnit );

        this.machineBudget.add({
            mem: f.mem.at( ANY_SIZE, ANY_SIZE ),
            cpu: f.cpu.at( ANY_SIZE, ANY_SIZE )
        });

        return b;
    }

    trace( msg: UPLCConst, result: UPLCTerm ): UPLCTerm
    {
        const _msg = getStr( msg );
        
        this.logs.push(_msg ?? "_msg_not_a_string_");
        
        const f = this.getBuiltinCostFunc( UPLCBuiltinTag.trace );

        const smsg = _msg ? strToSize( _msg ) : BigInt(0) ;

        this.machineBudget.add({
            mem: f.mem.at( smsg, ANY_SIZE ),
            cpu: f.cpu.at( smsg, ANY_SIZE )
        });

        return result;
    }
    fstPair( pair: UPLCTerm ): ConstOrErr
    {
        const p = getPair( pair );
        if( p === undefined ) return new ErrorUPLC("not a pair");

        const f = this.getBuiltinCostFunc( UPLCBuiltinTag.fstPair );

        const sp = pairToSize( p );

        this.machineBudget.add({
            mem: f.mem.at( sp ),
            cpu: f.cpu.at( sp )
        });

        return new UPLCConst(
            constPairTypeUtils.getFirstTypeArgument( (pair as UPLCConst).type ),
            p.fst as any
        );
    }
    sndPair( pair: UPLCTerm ): ConstOrErr
    {
        const p = getPair( pair );
        if( p === undefined ) return new ErrorUPLC("not a pair");

        const f = this.getBuiltinCostFunc( UPLCBuiltinTag.sndPair );

        const sp = pairToSize( p );

        this.machineBudget.add({
            mem: f.mem.at( sp ),
            cpu: f.cpu.at( sp )
        });

        return new UPLCConst(
            constPairTypeUtils.getSecondTypeArgument( (pair as UPLCConst).type ),
            p.snd as any
        );
    }
    chooseList( list: UPLCTerm, whateverA: UPLCTerm, whateverB: UPLCTerm ): UPLCTerm 
    {
        const l = getList( list );
        if( l === undefined ) return new ErrorUPLC("chooseList :: not a list");

        const f = this.getBuiltinCostFunc( UPLCBuiltinTag.chooseList );

        const sl = listToSize( l );

        this.machineBudget.add({
            mem: f.mem.at( sl, ANY_SIZE, ANY_SIZE ),
            cpu: f.cpu.at( sl, ANY_SIZE, ANY_SIZE )
        })

        return l.length === 0 ? whateverA : whateverB;
    }
    mkCons( elem: UPLCTerm, list: UPLCTerm )
    {
        if(!(
            elem instanceof UPLCConst &&
            list instanceof UPLCConst &&
            list.type[0] === ConstTyTag.list &&
            constTypeEq( elem.type, constListTypeUtils.getTypeArgument( list.type as any ) )
        )) return new ErrorUPLC(
            "mkCons :: incongruent list types; listT: " +
            (list instanceof UPLCConst ? constTypeToStirng( list.type ) : "" ) +
            "; elemsT: " +
            (elem instanceof UPLCConst ? constTypeToStirng( elem.type ) : "" ),
            {
                list,
                elem
            }
        );

        const l = getList( list );
        if( l === undefined ) return new ErrorUPLC("mkCons :: not a list");

        const value = elem.value;

        const f = this.getBuiltinCostFunc( UPLCBuiltinTag.mkCons );

        const sl = listToSize( l );
        const sv = constValueToSize( value );

        this.machineBudget.add({
            mem: f.mem.at( sv, sl ),
            cpu: f.cpu.at( sv, sl )
        });

        return new UPLCConst(
            list.type,
            [ value, ...l ] as any
        );
    }
    headList( list: UPLCTerm ): ConstOrErr 
    {
        const l = getList( list );
        if( l === undefined || l.length === 0 ) return new ErrorUPLC(l === undefined ? "headList :: not a list" : "headList :: empty list passed to 'head'");

        const f = this.getBuiltinCostFunc( UPLCBuiltinTag.headList );

        const sl = listToSize( l );

        this.machineBudget.add({
            mem: f.mem.at( sl ),
            cpu: f.cpu.at( sl )
        });

        return new UPLCConst(
            constListTypeUtils.getTypeArgument( (list as UPLCConst).type as any ),
            l[0] as any
        );
    }
    tailList( list: UPLCTerm ): ConstOrErr 
    {
        const l = getList( list );
        if( l === undefined || l.length === 0 )
        return new ErrorUPLC(
            l === undefined ? "tailList :: not a list" : "tailList :: empty list passed to 'tail'",
            { list }
        );

        const f = this.getBuiltinCostFunc( UPLCBuiltinTag.tailList );

        const sl = listToSize( l );

        this.machineBudget.add({
            mem: f.mem.at( sl ),
            cpu: f.cpu.at( sl )
        });

        return new UPLCConst(
            (list as UPLCConst).type,
            l.slice(1) as any
        );
    }
    nullList( list: UPLCTerm ): ConstOrErr 
    {
        const l = getList( list );
        if( l === undefined ) 
        return new ErrorUPLC(
            "nullList :: not a list",
            {
                arg: list
            }
        );

        const f = this.getBuiltinCostFunc( UPLCBuiltinTag.nullList );

        const sl = listToSize( l );

        this.machineBudget.add({
            mem: f.mem.at( sl ),
            cpu: f.cpu.at( sl )
        });

        return UPLCConst.bool( l.length === 0 )
    }
    chooseData( data: UPLCTerm, constr: UPLCTerm, map: UPLCTerm, list: UPLCTerm, int: UPLCTerm, bs: UPLCTerm ): ConstOrErr
    {
        const d = getData( data );
        if( d === undefined ) return new ErrorUPLC("not data");

        const f = this.getBuiltinCostFunc( UPLCBuiltinTag.chooseData );

        const sd = dataToSize( d );

        this.machineBudget.add({
            mem: f.mem.at( sd ),
            cpu: f.cpu.at( sd )
        });

        if( d instanceof DataConstr ) return constr;
        if( d instanceof DataMap ) return map;
        if( d instanceof DataList ) return list;
        if( d instanceof DataI ) return int;
        if( d instanceof DataB ) return bs;

        return new ErrorUPLC("unrecognized data, possibly DataPair");
    }
    constrData( idx: UPLCTerm, fields: UPLCTerm ): ConstOrErr
    {
        const i = getInt( idx );
        if( i === undefined ) return new ErrorUPLC("not int");

        if( !constTypeEq( (fields as any).type, constT.listOf( constT.data ) ) ) return new ErrorUPLC("constrData :: passed fields are not a list of Data");
        
        const _fields: Data[] | undefined = getList( fields ) as any;
        if( _fields === undefined ) return new ErrorUPLC("constrData :: not a list");

        const f = this.getBuiltinCostFunc( UPLCBuiltinTag.constrData );

        const si = intToSize( i );
        const sfields = _fields.reduce( (acc, elem) => acc + dataToSize( elem ), BigInt( 0 ) );

        this.machineBudget.add({
            mem: f.mem.at( si, sfields ),
            cpu: f.cpu.at( si, sfields ),
        });

        // assert we got a list of data
        // ( the type has been forced but not the value )
        if( !_fields.every( field => isData( field ) ) ) return new ErrorUPLC("constrData :: some of the fields are not Data, mismatching type btw");

        return UPLCConst.data(
            new DataConstr( i, _fields )
        );
    }
    mapData( listOfPair: UPLCTerm ): ConstOrErr
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
        if( list === undefined ) return new ErrorUPLC("mapData :: not a list");

        // assert we got a list of pair of datas
        // ( the type has been forced but not the value )
        if(
            !list.every( pair =>
                Pair.isStrictInstance( pair ) &&
                isData( pair.fst ) &&
                isData( pair.snd ) 
            )
        ) return new ErrorUPLC("some elements are not a pair, mismatching const type btw");

        const f = this.getBuiltinCostFunc( UPLCBuiltinTag.mapData );

        const size = listToSize( list );

        this.machineBudget.add({
            mem: f.mem.at( size ),
            cpu: f.cpu.at( size )
        });

        return UPLCConst.data(
            new DataMap(
                list.map( pair => new DataPair( pair.fst, pair.snd ) )
            )
        );
    }
    listData( listOfData: UPLCTerm ): ConstOrErr
    {
        if(!(
            listOfData instanceof UPLCConst &&
            constTypeEq(
                listOfData.type,
                constT.listOf(
                    constT.data
                )
            )
        ))
        return new ErrorUPLC(
            "listData :: not a list of data",
            {
                listOfData,
            }
        );

        const list: Data[] | undefined = getList( listOfData ) as any ;
        if( list === undefined ) return new ErrorUPLC("listData :: not a list");

        // assert we got a list of data
        // ( the type has been forced but not the value )
        if( !list.every( data => isData( data ) ) ) return new ErrorUPLC("some of the elements are not data, mismatching type btw");

        const f = this.getBuiltinCostFunc( UPLCBuiltinTag.listData );

        const size = listToSize( list );

        this.machineBudget.add({
            mem: f.mem.at( size ),
            cpu: f.cpu.at( size )
        });

        return UPLCConst.data(
            new DataList( list )
        );
    }
    iData( int: UPLCTerm ): ConstOrErr
    {
        const i = getInt( int );
        if( i === undefined )
        return new ErrorUPLC(
            "iData :: not an int",
            {
                arg: int,
                type: (int as any).type,
            }
        );

        const f = this.getBuiltinCostFunc( UPLCBuiltinTag.iData );

        const size = intToSize( i );

        this.machineBudget.add({
            mem: f.mem.at( size ),
            cpu: f.cpu.at( size )
        });

        return UPLCConst.data( new DataI( i ) );
    }
    bData( bs: UPLCTerm ): ConstOrErr
    {
        const b = getBS( bs );
        if( b === undefined )
        return new ErrorUPLC(
            "bData :: not BS",
            {
                arg: bs,
                type: (bs as any).type,
                value: (bs as any).value
            }
        );

        const f = this.getBuiltinCostFunc( UPLCBuiltinTag.bData );

        const size = bsToSize( b );

        this.machineBudget.add({
            mem: f.mem.at( size ),
            cpu: f.cpu.at( size )
        });

        return UPLCConst.data( new DataB( b ) );
    }
    unConstrData( data: UPLCTerm ): ConstOrErr
    {
        const d = getData( data );
        if( d === undefined ) return new ErrorUPLC(`unConstrData :: not data; ${ data instanceof UPLCConst ? "UPLCConst type: " + constTypeToStirng(data.type) :""}`);

        if( !( d instanceof DataConstr ) )
        return new ErrorUPLC(
            "unConstrData :: not a data constructor",
            {
                data: dataToCbor( d ).toString()
            }
        );

        const f = this.getBuiltinCostFunc( UPLCBuiltinTag.unConstrData );

        const size = dataToSize( d );

        this.machineBudget.add({
            mem: f.mem.at( size ),
            cpu: f.cpu.at( size )
        });

        return UPLCConst.pairOf( constT.int, constT.listOf( constT.data ) )(
            d.constr,
            d.fields
        );
    }
    unMapData( data: UPLCTerm ): ConstOrErr
    {
        const d = getData( data );
        if( d === undefined ) return new ErrorUPLC("not data; unMapData");

        if( !( d instanceof DataMap ) ) return new ErrorUPLC("not a data map");

        const f = this.getBuiltinCostFunc( UPLCBuiltinTag.unMapData );

        const size = dataToSize( d );

        this.machineBudget.add({
            mem: f.mem.at( size ),
            cpu: f.cpu.at( size )
        });

        return UPLCConst.listOf( constT.pairOf( constT.data, constT.data ) )(
            d.map.map( dataPair => new Pair<Data,Data>( dataPair.fst, dataPair.snd ) )
        );
    }
    unListData( data: UPLCTerm ): ConstOrErr
    {
        const d = getData( data );
        if( d === undefined ) return new ErrorUPLC("unListData :: not data",{ data });

        if( !( d instanceof DataList ) ) return new ErrorUPLC("unListData :: not a data list", { data: d } );

        const f = this.getBuiltinCostFunc( UPLCBuiltinTag.unListData );

        const size = dataToSize( d );

        this.machineBudget.add({
            mem: f.mem.at( size ),
            cpu: f.cpu.at( size )
        });

        return UPLCConst.listOf( constT.data )(
            d.list
        );
    }
    unIData( data: UPLCTerm ): ConstOrErr
    {
        const d = getData( data );
        if( d === undefined )
            return new ErrorUPLC(
                "not data; unIData",
                {
                    data
                }
            );

        if( !( d instanceof DataI ) ) return new ErrorUPLC("not a data integer");

        const f = this.getBuiltinCostFunc( UPLCBuiltinTag.unIData );

        const size = dataToSize( d );

        this.machineBudget.add({
            mem: f.mem.at( size ),
            cpu: f.cpu.at( size )
        });

        return UPLCConst.int( d.int );
    }
    unBData( data: UPLCTerm ): ConstOrErr
    {
        const d = getData( data );
        if( d === undefined )
            return new ErrorUPLC(
                "not data; unBData",
                {
                    data,
                }
            );

        if( !( d instanceof DataB ) ) return new ErrorUPLC("not a data BS", {UPLCTerm: ((data as UPLCConst).value as DataConstr).constr });

        const f = this.getBuiltinCostFunc( UPLCBuiltinTag.unBData );

        const size = dataToSize( d );

        this.machineBudget.add({
            mem: f.mem.at( size ),
            cpu: f.cpu.at( size )
        });

        return UPLCConst.byteString( d.bytes );
    }
    equalsData( a: UPLCTerm, b: UPLCTerm ): ConstOrErr
    {
        const _a = getData( a );
        if( _a === undefined ) return new ErrorUPLC("not data; equalsData <first argument>");
        const _b = getData( b );
        if( _b === undefined ) return new ErrorUPLC("not data; equalsData <second argument>");
        
        const f = this.getBuiltinCostFunc( UPLCBuiltinTag.equalsData );

        const sa = dataToSize( _a );
        const sb = dataToSize( _b );

        this.machineBudget.add({
            mem: f.mem.at( sa, sb ),
            cpu: f.cpu.at( sa, sb )
        });

        return UPLCConst.bool( eqData( _a, _b ) );
    }
    mkPairData( a: UPLCTerm, b: UPLCTerm ): ConstOrErr
    {
        const _a = getData( a );
        if( _a === undefined ) return new ErrorUPLC("not data; mkPairData <frist argument>");
        const _b = getData( b );
        if( _b === undefined ) return new ErrorUPLC("not data; mkPairData <second argument>");

        const f = this.getBuiltinCostFunc( UPLCBuiltinTag.mkPairData );

        const sa = dataToSize( _a );
        const sb = dataToSize( _b );

        this.machineBudget.add({
            mem: f.mem.at( sa, sb ),
            cpu: f.cpu.at( sa, sb )
        });
        
        return UPLCConst.pairOf( constT.data, constT.data )( _a, _b );
    }
    mkNilData( unit: UPLCTerm ): ConstOrErr
    {
        if( !isConstOfType( unit, constT.unit ) ) return new ErrorUPLC("not unit");

        const f = this.getBuiltinCostFunc( UPLCBuiltinTag.mkNilData );

        this.machineBudget.add({
            mem: f.mem.at( ANY_SIZE ),
            cpu: f.cpu.at( ANY_SIZE )
        });

        return UPLCConst.listOf( constT.data )([]);
    }
    mkNilPairData( unit: UPLCTerm ): ConstOrErr
    {
        if( !isConstOfType( unit, constT.unit ) ) return new ErrorUPLC("not unit");

        const f = this.getBuiltinCostFunc( UPLCBuiltinTag.mkNilPairData );

        this.machineBudget.add({
            mem: f.mem.at( ANY_SIZE ),
            cpu: f.cpu.at( ANY_SIZE )
        });

        return UPLCConst.listOf( constT.pairOf( constT.data, constT.data ) )([]);
    }

    serialiseData( data: UPLCTerm ): ConstOrErr
    {
        const d = getData( data );
        if( d === undefined ) return new ErrorUPLC("serialiseData: not data input");

        const f = this.getBuiltinCostFunc( UPLCBuiltinTag.serialiseData );

        const sData = dataToSize( d );

        this.machineBudget.add({
            mem: f.mem.at( sData ),
            cpu: f.cpu.at( sData )
        });

        return UPLCConst.byteString( new ByteString( dataToCbor( d ).toBuffer() ) );
    } 
    // @todo
    //                   
    // verifyEcdsaSecp256k1Signature  
    // verifySchnorrSecp256k1Signature
}