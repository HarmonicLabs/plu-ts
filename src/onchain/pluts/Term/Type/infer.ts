import JsRuntime from "../../../../utils/JsRuntime";

import { Type, TermType, TypeShortcut } from "./base";
import { Term } from "..";
import { BasePlutsError } from "../../../../errors/BasePlutsError";
import { UPLCTerm } from "../../../UPLC/UPLCTerm";
import { Application } from "../../../UPLC/UPLCTerms/Application";
import { Builtin } from "../../../UPLC/UPLCTerms/Builtin";
import { UPLCBuiltinTag } from "../../../UPLC/UPLCTerms/Builtin/UPLCBuiltinTag";
import { Delay } from "../../../UPLC/UPLCTerms/Delay";
import { ErrorUPLC } from "../../../UPLC/UPLCTerms/ErrorUPLC";
import { Force } from "../../../UPLC/UPLCTerms/Force";
import { HoistedUPLC } from "../../../UPLC/UPLCTerms/HoistedUPLC";
import { Lambda } from "../../../UPLC/UPLCTerms/Lambda";
import { UPLCConst } from "../../../UPLC/UPLCTerms/UPLCConst";
import { UPLCVar } from "../../../UPLC/UPLCTerms/UPLCVar";
import { PType } from "../../PType";
import { applyLambdaType } from "./applyLambdaType";
import { constTyToTermTy } from "./constTypeConversion";
import { typeExtends } from "./extension";
import { isDelayedType, isLambdaType, isTypeParam } from "./kinds";
import { cloneTermType } from "./utils";

const { fn, lam, int, bool, bs, str, unit, pair, list, map } = TypeShortcut;

function getBuiltinTermType( tag: UPLCBuiltinTag ): TermType
{
    const a = Type.Var("a");
    const b = Type.Var("b");

    switch( tag )
    {
        case UPLCBuiltinTag.addInteger :                    return fn([ int,  int ], int );
        case UPLCBuiltinTag.subtractInteger :               return fn([ int,  int ], int );
        case UPLCBuiltinTag.multiplyInteger :               return fn([ int,  int ], int );
        case UPLCBuiltinTag.divideInteger :                 return fn([ int,  int ], int );
        case UPLCBuiltinTag.quotientInteger :               return fn([ int,  int ], int );
        case UPLCBuiltinTag.remainderInteger :              return fn([ int,  int ], int );
        case UPLCBuiltinTag.modInteger :                    return fn([ int,  int ], int );
        case UPLCBuiltinTag.equalsInteger :                 return fn([ int,  int ], bool );
        case UPLCBuiltinTag.lessThanInteger :               return fn([ int,  int ], bool );
        case UPLCBuiltinTag.lessThanEqualInteger :          return fn([ int,  int ], bool );
        case UPLCBuiltinTag.appendByteString :              return fn([ bs,  bs ], bs );
        case UPLCBuiltinTag.consByteString :                return fn([ int,  bs ], bs );
        case UPLCBuiltinTag.sliceByteString :               return fn([ int, int, bs ], bs )
        case UPLCBuiltinTag.lengthOfByteString :            return lam( bs, int );
        case UPLCBuiltinTag.indexByteString :               return fn([ bs, int ], int );
        case UPLCBuiltinTag.equalsByteString :              return fn([ bs, bs ], bool);
        case UPLCBuiltinTag.lessThanByteString :            return fn([ bs, bs ], bool);
        case UPLCBuiltinTag.lessThanEqualsByteString :      return fn([ bs, bs ], bool);
        case UPLCBuiltinTag.sha2_256 :                      return lam( bs, bs );
        case UPLCBuiltinTag.sha3_256 :                      return lam( bs, bs );
        case UPLCBuiltinTag.blake2b_256 :                   return lam( bs, bs );
        case UPLCBuiltinTag.verifyEd25519Signature:         return fn([ bs, bs, bs ], bool );
        case UPLCBuiltinTag.appendString :                  return fn([ str, str ], str );
        case UPLCBuiltinTag.equalsString :                  return fn([ str, str ], bool );
        case UPLCBuiltinTag.encodeUtf8 :                    return lam( str, bs );
        case UPLCBuiltinTag.decodeUtf8 :                    return lam( bs, str );
        case UPLCBuiltinTag.ifThenElse :                    return fn([ bool, a, a ], a );
        case UPLCBuiltinTag.chooseUnit :                    return fn([ unit, a], a);
        case UPLCBuiltinTag.trace :                         return fn([ Type.Any, a ], a );
        case UPLCBuiltinTag.fstPair :                       return lam( pair( a, Type.Any ), a );
        case UPLCBuiltinTag.sndPair :                       return lam( pair( Type.Any, a ), a );
        case UPLCBuiltinTag.chooseList :                    return fn([ list( Type.Any ), a, a ], a);
        case UPLCBuiltinTag.mkCons :                        return fn([ a, list(a) ], list(a) );
        case UPLCBuiltinTag.headList :                      return lam( list(a), a );
        case UPLCBuiltinTag.tailList :                      return lam( list(a), list(a) );
        case UPLCBuiltinTag.nullList :                      return lam( list( Type.Any ), bool );
        case UPLCBuiltinTag.chooseData :                    return fn([ Type.Data.Any, a, a, a, a, a ], a);
        case UPLCBuiltinTag.constrData :                    return fn([ int, list( Type.Data.Any ) ], Type.Data.Constr );
        case UPLCBuiltinTag.mapData :                       return lam( map( Type.Data.Any, Type.Data.Any ), Type.Data.Map( Type.Data.Any, Type.Data.Any ) );
        case UPLCBuiltinTag.listData :                      return lam( list( Type.Data.Any ), Type.Data.List( Type.Data.Any ) );
        case UPLCBuiltinTag.iData    :                      return lam( int, Type.Data.Int );
        case UPLCBuiltinTag.bData    :                      return lam( bs, Type.Data.BS );
        case UPLCBuiltinTag.unConstrData :                  return lam( Type.Data.Constr, pair( int, list( Type.Data.Any ) ) );
        case UPLCBuiltinTag.unMapData    :                  return lam( Type.Data.Map( a as any, b as any ), map( a, b ) );
        case UPLCBuiltinTag.unListData   :                  return lam( Type.Data.List( a as any ), list( a ) );
        case UPLCBuiltinTag.unIData      :                  return lam( Type.Data.Int, int );
        case UPLCBuiltinTag.unBData      :                  return lam( Type.Data.BS, bs );
        case UPLCBuiltinTag.equalsData   :                  return fn([ Type.Data.Any, Type.Data.Any ], bool );
        case UPLCBuiltinTag.mkPairData   :                  return fn([ Type.Data.Any, Type.Data.Any ], Type.Data.Pair( Type.Data.Any, Type.Data.Any ) );
        case UPLCBuiltinTag.mkNilData    :                  return lam( unit, list( Type.Data.Any ) );
        case UPLCBuiltinTag.mkNilPairData:                  return lam( unit, map( Type.Data.Any, Type.Data.Any ) );
        case UPLCBuiltinTag.serialiseData:                  return lam( Type.Data.Any, bs );
        case UPLCBuiltinTag.verifyEcdsaSecp256k1Signature:  return fn([ bs, bs, bs ], bool );
        case UPLCBuiltinTag.verifySchnorrSecp256k1Signature:return fn([ bs, bs, bs ], bool );

        
        default:
            // tag; // check that is of type 'never'
            return Type.Any;
    }
}

export function inferTypeFromUPLC( uplc: UPLCTerm ): TermType
{
    const env: TermType[] = [];

    function getVarDbn( dbn : number | bigint ): TermType
    {
        return cloneTermType( env[ env.length - 1 - Number( dbn ) ] ?? Type.Any )
    }

    function infer( t: UPLCTerm ): TermType
    {

        if( t instanceof HoistedUPLC ) return infer( t.UPLC );
    
        if( t instanceof Builtin ) return getBuiltinTermType( t.tag );
        if( t instanceof UPLCConst ) return constTyToTermTy( t.type );
        
        if( t instanceof Delay ) return Type.Delayed( infer( t.delayedTerm ) );
        if( t instanceof Force )
        {
            const forcedTermType = infer( t.termToForce );
            if( isDelayedType( forcedTermType ) ) return forcedTermType[1];
            return forcedTermType;
        }
        
        if( t instanceof ErrorUPLC ) return Type.Any;
    
        if( t instanceof Application )
        {
            if( t.funcTerm instanceof UPLCVar )
            {

            }
            const fnType = infer( t.funcTerm );
            
            // if inferrred funciton is any
            if( isTypeParam( fnType) )
            {
                // assume is  genreic lambda (```lam( a , b )```)
                // hence return generic type (any)
                return Type.Any
            }

            if( !isLambdaType( fnType ) )
            {
                throw JsRuntime.makeNotSupposedToHappenError(
                    "function type of and uplc 'Application' was not of type Lambda"
                );
            }
    
            if( t.argTerm instanceof UPLCVar )
            {
                const thisDbn = t.argTerm.deBruijn.asBigInt;
                const currVarType = getVarDbn( thisDbn );

                // if is any
                if( isTypeParam( currVarType ) )
                {
                    // expected type is the input one
                    env[ env.length - 1 - Number( thisDbn ) ] = fnType[ 1 ];
                    return fnType[ 2 ];
                }

                if( !typeExtends( currVarType, fnType[1] ) )
                {
                    throw new BasePlutsError(
                        "argument passed to a funciton wasn't extending the lambda input type"
                    );
                }

                return applyLambdaType(
                    fnType,
                    currVarType
                );
            }
            const argType = infer( t.argTerm );
    
            // if inferred argument's type is any
            if( isTypeParam( argType ) )
            {
                return fnType[2];
            }
            if( !typeExtends( argType, fnType[1] ) )
            {
                throw new BasePlutsError(
                    "argument passed to a funciton wasn't extending the lambda input type"
                );
            }
    
            return applyLambdaType(
                fnType,
                argType
            );
        }
    
        if( t instanceof Lambda )
        {
            env.push( Type.Any );
            const returnType = infer( t.body );
    
            return lam( env.pop() ?? Type.Any, returnType );
        }
    
        if( t instanceof UPLCVar )
        {
            return  getVarDbn( t.deBruijn.asBigInt );
        }
    
        return Type.Any
    }

    return infer( uplc );
}

export function inferType( term: Term<PType> ): TermType
{
    return inferTypeFromUPLC( term.toUPLC( 0 ) );
}
