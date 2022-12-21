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
import { BuiltinCostsOf } from "../Machine/BuiltinCosts";
import ExBudget from "../Machine/ExBudget";
import { Buffer } from "buffer";


function intToSize( n: bigint ): bigint
{
    if ( n === BigInt( 0 ) ) return BigInt( 1 );

    // same as `intToSize( -n - BigInt( 1 ) )` but inlined
    if( n  < BigInt( 0 ) ) return ( BigIntUtils.log2( ( -n - BigInt( 1 ) ) << BigInt( 1 ) ) / BigInt( 8 )) + BigInt( 1 ) ;

    return ( BigIntUtils.log2( n << BigInt( 1 ) ) / BigInt( 8 )) + BigInt( 1 );
}

function bsToSize( bs: ByteString | Buffer ): bigint
{
    const len = (Buffer.isBuffer( bs ) ? bs : bs.asBytes).length;
    return len === 0 ?
        // TODO: Bug in cardano-node; to fix next hard fork
        BigInt(1) :
        BigInt( len );
}

function strToSize( str: string ): bigint
{
    return bsToSize( Buffer.from( str, "utf8" ) );
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
            tot += intToSize( top.int.asBigInt );
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
            case UPLCBuiltinTag.sha2_256 :                          throw new PlutsCEKError("builtin implementation missing");// return (this.sha2_256 as any)( ...bn.args );
            case UPLCBuiltinTag.sha3_256 :                          throw new PlutsCEKError("builtin implementation missing");// return (this.sha3_256 as any)( ...bn.args );
            case UPLCBuiltinTag.blake2b_256 :                       throw new PlutsCEKError("builtin implementation missing");// return (this.blake2b_256 as any)( ...bn.args );
            case UPLCBuiltinTag.verifyEd25519Signature:             throw new PlutsCEKError("builtin implementation missing");// return (this.verifyEd25519Signature as any)( ...bn.args );
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

            }).bind(this)
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

            }).bind(this)
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

            }).bind(this)
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

            }).bind(this)
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

            }).bind(this)
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

            }).bind(this)
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

            }).bind(this)
        );
    }
    equalsInteger( a: UPLCTerm, b: UPLCTerm ): ConstOrErr
    {
        const ints = getInts( a, b );
        if( ints === undefined ) return new ErrorUPLC("not integers");

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
        if( ints === undefined ) return new ErrorUPLC("not integers");

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
        if( ints === undefined ) return new ErrorUPLC("not integers");

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
        if( _a === undefined ) return new ErrorUPLC("not BS");
        const _b = getBS( b );
        if(_b === undefined ) return new ErrorUPLC("not BS");

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
        if( _a === undefined ) return new ErrorUPLC("not Int");
        _a = BigIntUtils.abs( _a ) % BigInt( 256 );

        const _b = getBS( b );
        if(_b === undefined ) return new ErrorUPLC("not BS");

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
                Buffer.from(
                    _bs.asBytes.slice(
                        Number( i ), Number( j )
                    )
                )
            )
        );
    }
    lengthOfByteString( bs: UPLCTerm ): ConstOrErr
    {
        const _bs = getBS( bs );
        if( _bs === undefined ) return new ErrorUPLC("not BS");

        const f = this.getBuiltinCostFunc( UPLCBuiltinTag.lengthOfByteString );
                
        const sbs = bsToSize( _bs );
        
        this.machineBudget.add({
            mem: f.mem.at( sbs ),
            cpu: f.cpu.at( sbs )
        });

        return UPLCConst.int( _bs.asBytes.length );
    }
    indexByteString( bs: UPLCTerm, idx: UPLCTerm ): ConstOrErr
    {
        const _bs = getBS( bs );
        if( _bs === undefined ) return new ErrorUPLC("not BS");
        
        const i = getInt( idx );
        if( i === undefined || i >= _bs.asBytes.length || i < BigInt( 0 ) ) return new ErrorUPLC("not int");

        const result = _bs.asBytes.at( Number( i ) );
        if( result === undefined ) return new ErrorUPLC("out of bytestring length");


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
        if( _a === undefined ) return new ErrorUPLC("not BS");
        
        const _b = getBS( b );
        if( _b === undefined ) return new ErrorUPLC("not BS");

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
        if( _a === undefined ) return new ErrorUPLC("not BS");
        
        const _b = getBS( b );
        if( _b === undefined ) return new ErrorUPLC("not BS");

        const aBytes = _a.asBytes;
        const bBytes = _b.asBytes;

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
        if( _a === undefined ) return new ErrorUPLC("not BS");
        
        const _b = getBS( b );
        if( _b === undefined ) return new ErrorUPLC("not BS");

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

    // @todo
    //
    // sha2_256
    // sha3_256
    // blake2b_256
    // verifyEd25519Signature

    appendString( a: UPLCTerm, b: UPLCTerm ): ConstOrErr
    {
        const _a = getStr( a );
        if( _a === undefined ) return new ErrorUPLC("not Str");
        
        const _b = getStr( b );
        if( _b === undefined ) return new ErrorUPLC("not Str");

        return UPLCConst.str( _a + _b )
    }
    equalsString( a: UPLCTerm, b: UPLCTerm ): ConstOrErr
    {
        const _a = getStr( a );
        if( _a === undefined ) return new ErrorUPLC("not Str");
        
        const _b = getStr( b );
        if( _b === undefined ) return new ErrorUPLC("not Str");

        return UPLCConst.bool( _a === _b )
    }
    encodeUtf8( a: UPLCTerm ): ConstOrErr
    {
        const _a = getStr( a );
        if( _a === undefined ) return new ErrorUPLC("not Str");

        return UPLCConst.byteString( new ByteString( Buffer.from( _a , "utf8" ) ) );
    }
    decodeUtf8( a: UPLCTerm ): ConstOrErr
    {
        const _a = getBS( a );
        if( _a === undefined ) return new ErrorUPLC("not BS");

        return UPLCConst.str( _a.asBytes.toString("utf8") );
    }
    ifThenElse( condition: UPLCTerm, caseTrue: ConstOrErr, caseFalse: ConstOrErr ): ConstOrErr
    {
        if(! isConstOfType( condition, constT.bool ) ) return new ErrorUPLC("not a boolean");
        
        return condition.value ? caseTrue : caseFalse;
    }
    chooseUnit( unit: UPLCTerm, b: UPLCTerm ): UPLCTerm
    {
        if( !isConstOfType( unit, constT.unit ) ) return new ErrorUPLC("nota a unit");
        return b;
    }
    trace( msg: UPLCConst, result: UPLCTerm ): UPLCTerm
    {
        const _msg = getStr( msg );
        this.logs.push(_msg ?? "_msg_not_a_string_");
        return result;
    }
    fstPair( pair: UPLCTerm ): ConstOrErr
    {
        const p = getPair( pair );
        if( p === undefined ) return new ErrorUPLC("not a pair");

        return new UPLCConst(
            constPairTypeUtils.getFirstTypeArgument( (pair as UPLCConst).type ),
            p.fst as any
        );
    }
    sndPair( pair: UPLCTerm ): ConstOrErr
    {
        const p = getPair( pair );
        if( p === undefined ) return new ErrorUPLC("not a pair");

        return new UPLCConst(
            constPairTypeUtils.getSecondTypeArgument( (pair as UPLCConst).type ),
            p.snd as any
        );
    }
    chooseList( list: UPLCTerm, whateverA: UPLCTerm, whateverB: UPLCTerm ): UPLCTerm 
    {
        const l = getList( list );
        if( l === undefined ) return new ErrorUPLC("not a list");

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
            (elem instanceof UPLCConst ? constTypeToStirng( elem.type ) : "" )
        );

        const l = getList( list );
        if( l === undefined ) return new ErrorUPLC("not a list");

        l.unshift( elem.value );

        return new UPLCConst(
            list.type,
            l as any
        );
    }
    headList( list: UPLCTerm ): ConstOrErr 
    {
        const l = getList( list );
        if( l === undefined || l.length === 0 ) return new ErrorUPLC(l === undefined ? "not a list" : "empty list passed to 'head'");

        return new UPLCConst(
            constListTypeUtils.getTypeArgument( (list as UPLCConst).type as any ),
            l[0] as any
        );
    }
    tailList( list: UPLCTerm ): ConstOrErr 
    {
        const l = getList( list );
        if( l === undefined || l.length === 0 ) return new ErrorUPLC(l === undefined ? "not a list" : "empty list passed to 'tail'");

        return new UPLCConst(
            (list as UPLCConst).type,
            l.slice(1) as any
        );
    }
    nullList( list: UPLCTerm ): ConstOrErr 
    {
        const l = getList( list );
        if( l === undefined ) return new ErrorUPLC("not a list");

        return UPLCConst.bool( l.length === 0 )
    }
    chooseData( data: UPLCTerm, constr: UPLCTerm, map: UPLCTerm, list: UPLCTerm, int: UPLCTerm, bs: UPLCTerm ): ConstOrErr
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
    constrData( idx: UPLCTerm, fields: UPLCTerm ): ConstOrErr
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
    iData( int: UPLCTerm ): ConstOrErr
    {
        const i = getInt( int );
        if( i === undefined ) return new ErrorUPLC("not an int");

        return UPLCConst.data( new DataI( i ) );
    }
    bData( bs: UPLCTerm ): ConstOrErr
    {
        const b = getBS( bs );
        if( b === undefined ) return new ErrorUPLC("not BS");

        return UPLCConst.data( new DataB( b ) );
    }
    unConstrData( data: UPLCTerm ): ConstOrErr
    {
        const d = getData( data );
        if( d === undefined ) return new ErrorUPLC(`not data; unConstrData${ data instanceof UPLCConst ? "; " + constTypeToStirng(data.type) :""}`);

        if( !( d instanceof DataConstr ) ) return new ErrorUPLC("not a data constructor");

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

        return UPLCConst.listOf( constT.pairOf( constT.data, constT.data ) )(
            d.map.map( dataPair => new Pair<Data,Data>( dataPair.fst, dataPair.snd ) )
        );
    }
    unListData( data: UPLCTerm ): ConstOrErr
    {
        const d = getData( data );
        if( d === undefined ) return new ErrorUPLC("not data; unListData");

        if( !( d instanceof DataList ) ) return new ErrorUPLC("not a data list");

        return UPLCConst.listOf( constT.data )(
            d.list
        );
    }
    unIData( data: UPLCTerm ): ConstOrErr
    {
        const d = getData( data );
        if( d === undefined ) return new ErrorUPLC("not data; unIData");

        if( !( d instanceof DataI ) ) return new ErrorUPLC("not a data integer");

        return UPLCConst.int( d.int );
    }
    unBData( data: UPLCTerm ): ConstOrErr
    {
        const d = getData( data );
        if( d === undefined ) return new ErrorUPLC("not data; unBData");

        if( !( d instanceof DataB ) ) return new ErrorUPLC("not a data BS", {UPLCTerm: ((data as UPLCConst).value as DataConstr).constr.asBigInt });

        return UPLCConst.byteString( d.bytes );
    }
    equalsData( a: UPLCTerm, b: UPLCTerm ): ConstOrErr
    {
        const _a = getData( a );
        if( _a === undefined ) return new ErrorUPLC("not data; equalsData <first argument>");
        const _b = getData( b );
        if( _b === undefined ) return new ErrorUPLC("not data; equalsData <second argument>");
        
        return UPLCConst.bool( eqData( _a, _b ) );
    }
    mkPairData( a: UPLCTerm, b: UPLCTerm ): ConstOrErr
    {
        const _a = getData( a );
        if( _a === undefined ) return new ErrorUPLC("not data; mkPairData <frist argument>");
        const _b = getData( b );
        if( _b === undefined ) return new ErrorUPLC("not data; mkPairData <second argument>");
        
        return UPLCConst.pairOf( constT.data, constT.data )( _a, _b );
    }
    mkNilData( unit: UPLCTerm ): ConstOrErr
    {
        if( !isConstOfType( unit, constT.unit ) ) return new ErrorUPLC("not unit");
        return UPLCConst.listOf( constT.data )([]);
    }
    mkNilPairData( unit: UPLCTerm ): ConstOrErr
    {
        if( !isConstOfType( unit, constT.unit ) ) return new ErrorUPLC("not unit");
        return UPLCConst.listOf( constT.pairOf( constT.data, constT.data ) )([]);
    }

    serialiseData( data: UPLCTerm ): ConstOrErr
    {
        const d = getData( data );
        if( d === undefined ) return new ErrorUPLC("serialiseData: not data input");

        return UPLCConst.byteString( new ByteString( dataToCbor( d ).asBytes ) );
    } 
    // @todo
    //                   
    // verifyEcdsaSecp256k1Signature  
    // verifySchnorrSecp256k1Signature
}