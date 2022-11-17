import { Buffer } from "buffer";
import { pByteString, pfn, plam, PLam, pmakeUnit, pStr } from "..";
import CborString from "../../../cbor/CborString";
import BasePlutsError from "../../../errors/BasePlutsError";
import HexString from "../../../types/HexString";
import ByteString from "../../../types/HexString/ByteString";
import Integer from "../../../types/ints/Integer";
import JsRuntime from "../../../utils/JsRuntime";
import type PType from "../PType";
import type PBool from "../PTypes/PBool";
import { pBool } from "../PTypes/PBool";
import type PByteString from "../PTypes/PByteString";
import type PInt from "../PTypes/PInt";
import { pInt } from "../PTypes/PInt";
import type PString from "../PTypes/PString";
import type PUnit from "../PTypes/PUnit";
import { UtilityTermOf } from "../stdlib/UtilityTerms/addUtilityForType";
import Term from "../Term";
import { bool, bs, int, str, TermType, ToPType, tyVar, unit } from "../Term/Type/base";
import { typeExtends } from "../Term/Type/extension";
import { isLambdaType, isTypeParam, isWellFormedType } from "../Term/Type/kinds";
import { getNRequiredLambdaArgs, termTypeToString } from "../Term/Type/utils";

type _TsFunctionSatisfying<KnownArgs extends Term<PType>[], POut extends PType> =
    POut extends PLam<infer POutIn extends PType, infer POutOut extends PType> ?
        (
            ( ...args: KnownArgs ) => Term<POut> | // functions that do return `PLam` are fine too
            _TsFunctionSatisfying<[ ...KnownArgs, UtilityTermOf<POutIn> ], POutOut>
        ) :
        ( ...args: KnownArgs ) => Term<POut>

type TsFunctionSatisfying<PIn extends PType, POut extends PType> =
    _TsFunctionSatisfying<[ UtilityTermOf<PIn> ], POut>

export type PappArg<PIn extends PType> =
    (
        PIn extends PInt ? bigint | number | Integer :
        PIn extends PBool ? boolean :
        PIn extends PByteString ? ByteString | Buffer | Uint8Array | ArrayBuffer | string :
        PIn extends PString ? string :
        PIn extends PUnit ? undefined | null :
        // PIn extends PPair<infer PFst extends PType, infer PSnd extends PType> ? Pair<PappArg<PFst>, PappArg<PSnd>> | [ PappArg<PFst>, PappArg<PSnd> ] :
        // PIn extends PList<infer PElemsT extends PType> ? PappArg<PElemsT>[] :
        PIn extends PLam<infer PIn extends PType, infer POut extends PType> ? TsFunctionSatisfying<PIn,POut> :
        Term<PIn>
    ) | Term<PIn>

export default function pappArgToTerm<ArgT extends TermType>(
    arg: PappArg<ToPType<ArgT>>,
    mustExtend: ArgT = tyVar("pappArgToTerm_mustExtend_any") as any
): UtilityTermOf<ToPType<ArgT>>
{
    if( !isWellFormedType( mustExtend ) )
    {
        throw new BasePlutsError(
            "can't convert argument for `papp` to invalid type"
        );
    }

    // same of `arg instanceof Term` but typescript doesn't knows it
    // ( after `arg instanceof Term` typescript marked arg as `never` )
    if( Term.prototype.isPrototypeOf( arg ) )
    {
        if( !typeExtends( arg.type, mustExtend ) )
        {
            // TODO: add proper error
            throw new BasePlutsError(
                "pappArgToTerm :: `arg` was a term of type " +
                termTypeToString( arg.type ) +
                "; which doesn't extends expected " +
                termTypeToString( mustExtend )
            );
        }
        return arg as any;
    }

    // PUnit
    if( arg === undefined || arg === null )
    {
        if( !typeExtends( int, mustExtend ) )
        {
            // TODO: add proper error
            throw new BasePlutsError(
                "pappArgToTerm :: `arg` was a possible `unit`; which doesn't extends expected type " +
                termTypeToString( mustExtend )
            );
        }
        return pmakeUnit() as any;
    }

    // PInt
    if(
        typeof arg === "number" ||
        typeof arg === "bigint" ||
        arg instanceof Integer
    )
    {
        if( !typeExtends( int, mustExtend ) )
        {
            // TODO: add proper error
            throw new BasePlutsError(
                "pappArgToTerm :: `arg` was a possible `int`; which doesn't extends expected type " +
                termTypeToString( mustExtend )
            );
        }
        return pInt( arg ) as any;
    }

    // PBool
    if( typeof arg === "boolean" )
    {
        if( !typeExtends( bool, mustExtend ) )
        {
            // TODO: add proper error
            throw new BasePlutsError(
                "pappArgToTerm :: `arg` was a possible `bool`; which doesn't extends expected type " +
                termTypeToString( mustExtend )
            );
        }
        return pBool( arg ) as any;
    }

    // PStr
    if( typeof arg === "string" )
    {
        // if must extend any
        if( isTypeParam( mustExtend ) )
        {
            // first try ByteStrings
            if( HexString.isHex( arg ) && ( arg as string).length % 2 === 0 )
            {
                return pByteString( Buffer.from( arg as string, "hex" ) ) as any;
            }

            // otherwise return plain string
            return pStr( arg ) as any;
        }

        // if must be a bytestring
        if( typeExtends( mustExtend, bs ) )
        {
            // first tries plain hex
            if( HexString.isHex( arg ) && ( arg as string).length % 2 === 0 )
            {
                return pByteString( Buffer.from( arg, "hex" ) ) as any;
            }

            // otherwise interpret as ascii
            return pByteString( ByteString.fromAscii( arg ) ) as any
        }

        // if must be a string
        if( typeExtends( mustExtend, str ) )
        {
            return pStr( arg ) as any;
        }

        // TODO: add proper error
        throw new BasePlutsError(
            "pappArgToTerm :: `arg` was a possible `str` or `bs`; which doesn't extends expected type " +
            termTypeToString( mustExtend )
        );
    }

    // PByteString
    if(
        Buffer.isBuffer( arg )      ||
        arg instanceof Uint8Array   ||
        arg instanceof ArrayBuffer  ||
        (
            arg instanceof ByteString &&
            !(arg instanceof CborString)
        )
    )
    {
        if( !typeExtends( bs, mustExtend ) )
        {
            // TODO: add proper error
            throw new BasePlutsError(
                "pappArgToTerm :: `arg` was a possible `bs`; which doesn't extends expected type " +
                termTypeToString( mustExtend )
            );
        }

        if( arg instanceof ByteString )
        {
            return pByteString( arg ) as any;
        }
        
        return pByteString(
            Buffer.isBuffer( arg ) ? arg : Buffer.from( arg )
        ) as any; 
    }

    // PLam
    if( typeof arg === "function" )
    {
        const funcNArgs = (arg as Function).length;

        if(
            // if must extend any
            isTypeParam( mustExtend ) ||
            // or must extend something different than a function
            !isLambdaType( mustExtend ) || 
            funcNArgs <= 0
        )
        {
            throw new BasePlutsError(
                "pappArgToTerm :: `arg` was a possible `lam` or `fn`; however it was not possible to check the type"
            )
        };

        const nLambdaArgs = getNRequiredLambdaArgs( mustExtend );

        if(!(
            funcNArgs <= nLambdaArgs
        )) throw new BasePlutsError(
            `can't convert a ts function expecting ${funcNArgs} arguments ` +
            `to a plu-ts function that requires ${nLambdaArgs} arguments; ` +
            `expected lambda type was: ${termTypeToString(mustExtend)}`
        );

        let outTy: TermType = mustExtend;
        const fnInputsTys = [];

        for( let i = 0; i < funcNArgs; i++ )
        {
            if( !isLambdaType(outTy) )
            {
                throw JsRuntime.makeNotSupposedToHappenError(
                    "unexpected `outTy` while constructing `pfn`; " +
                    `only ${fnInputsTys.length} inputs out of ${funcNArgs} expected where collected` +
                    `\`outTy\`: ${termTypeToString(outTy)}; ` +
                    `\`inputsTypes\`:${fnInputsTys.map( termTypeToString )}` +
                    `target function type: ${termTypeToString(mustExtend)}`
                );
            }

            fnInputsTys.push( outTy[1] );
            outTy = outTy[2];
        }

        return pfn( fnInputsTys as any , outTy )( arg as any ) as any;
    }

    throw new BasePlutsError(
        "pappArgToTerm :: it was not possible to transform `arg` to a plu-ts value" +
        "; `arg` was " + arg +
        "; `mustExtend` plu-ts type was: " + termTypeToString( mustExtend )
    );
}

function isTsValueAssignableToPlutsType<PlutsType extends TermType>(
    value: PappArg<ToPType<PlutsType>>,
    plutsType: PlutsType
): boolean
{
    if( !isWellFormedType( plutsType ) ) return false;

    // same of `value instanceof Term` but typescript doesn't knows it
    // ( after `value instanceof Term` typescript marked arg as `never` )
    if( Term.prototype.isPrototypeOf( value ) )
    {
        return typeExtends( value.type, plutsType );
    }

    if( typeExtends( plutsType, int ) )
    {
        return (
            typeof value === "number" ||
            typeof value === "bigint" ||
            value instanceof Integer
        );
    }

    if( typeExtends( plutsType, unit ) )
    {
        return (
            value === undefined ||
            value === null
        );
    }

    if( typeExtends( plutsType, bool ) )
    {
        return typeof value === "boolean";
    }

    if( typeExtends( plutsType, bs ) )
    {
        return (
            (typeof value === "string" && HexString.isHex( value ) && (value as string).length % 2 === 0) ||
            Buffer.isBuffer( value ) ||
            value instanceof Uint8Array ||
            value instanceof ArrayBuffer
        )
    }

    return false;
}