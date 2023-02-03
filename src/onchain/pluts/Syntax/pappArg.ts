import type { PUnit } from "../PTypes/PUnit";
import type { PString } from "../PTypes/PString";
import type { PInt } from "../PTypes/PInt";
import type { PByteString } from "../PTypes/PByteString";
import type { PBool } from "../PTypes/PBool";
import type { PType } from "../PType";

import JsRuntime from "../../../utils/JsRuntime";
import ObjectUtils from "../../../utils/ObjectUtils";
import { Buffer } from "buffer";
import { CborString } from "../../../cbor/CborString";
import { BasePlutsError } from "../../../errors/BasePlutsError";
import { HexString } from "../../../types/HexString";
import { ByteString } from "../../../types/HexString/ByteString";
import { Integer } from "../../../types/ints/Integer";
import { Pair } from "../../../types/structs/Pair";
import { pBool } from "../PTypes/PBool";
import { pByteString } from "../PTypes/PByteString";
import { PLam } from "../PTypes/PFn/PLam";
import { pInt } from "../PTypes/PInt";
import { PList, pList } from "../PTypes/PList";
import { PPair, pPair } from "../PTypes/PPair";
import { pStr } from "../PTypes/PString";
import { pmakeUnit } from "../PTypes/PUnit";
import { UtilityTermOf } from "../stdlib/UtilityTerms/addUtilityForType";
import { Term } from "../Term";
import { bool, bs, ConstantableTermType, fn, int, list, str, TermType, tyVar, unit } from "../Term/Type/base";
import { typeExtends } from "../Term/Type/extension";
import { isConstantableTermType, isLambdaType, isListType, isPairType, isTypeParam, isWellFormedType } from "../Term/Type/kinds";
import { ToPType } from "../Term/Type/ts-pluts-conversion";
import { getNRequiredLambdaArgs, termTypeToString } from "../Term/Type/utils";
import { pfn } from "./syntax";

type _TsFunctionSatisfying<KnownArgs extends Term<PType>[], POut extends PType> =
    POut extends PLam<infer POutIn extends PType, infer POutOut extends PType> ?
        (
            ( ...args: KnownArgs ) => Term<POut> | // functions that do return `PLam` are fine too
            // @ts-ignore Type instantiation is excessively deep and possibly infinite.
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
        PIn extends PPair<infer PFst extends PType, infer PSnd extends PType> ?
           Pair<PappArg<PFst>, PappArg<PSnd>> | { fst: PappArg<PFst>, snd: PappArg<PSnd> } | [ PappArg<PFst>, PappArg<PSnd> ] :
        PIn extends PList<infer PElemsT extends PType> ? PappArg<PElemsT>[] :
        PIn extends PLam<infer PIn extends PType, infer POut extends PType> ? TsFunctionSatisfying<PIn,POut> :
        Term<PIn>
    ) | Term<PIn>

export function pappArgToTerm<ArgT extends TermType>(
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
    if( Term.prototype.isPrototypeOf( arg as any ) )
    {
        if( !typeExtends( (arg as Term<PType>).type, mustExtend ) )
        {
            // TODO: add proper error
            throw new BasePlutsError(
                "pappArgToTerm :: `arg` was a term of type " +
                termTypeToString( (arg as Term<any>).type ) +
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

    if( Array.isArray( arg ) )
    {
        if(!(
            arg.every(
                elem =>
                    elem instanceof Term ? 
                        (elem as any).isConstant === true :
                        true
            )
        )) throw new BasePlutsError(
            "pappArgToTerm :: `arg` was a possible `list` or `pair`; "+
            "however not all the elments of the array where constants; " +
            "plu-ts is only able to automatically trasform constant values"
        );

        // if must extend any
        if( isTypeParam( mustExtend ) )
        {
            if( arg.length === 2 ) // might be pair
            {
                const [ fst, snd ] = arg as PappArg<PType>[];
    
                const fstT = tryGetConstantableType( fst );
                const sndT = tryGetConstantableType( snd );
    
                return pPair( fstT, sndT )(
                    pappArgToTerm( fst, fstT ),
                    pappArgToTerm( snd, sndT )
                ) as any;
            }

            // try list
            const elemsT = tryInferElemsT( arg );

            return pList( elemsT )( arg.map(elem => pappArgToTerm( elem,  elemsT ) ) ) as any;
        }

        if( isPairType( mustExtend ) )
        {
            if( arg.length !== 2 )
            throw new BasePlutsError(
                "an array that doesn't have exactly two elements can't be converted to pair"
            );

            const [ fst, snd ] = arg as PappArg<PType>[];
    
            const fstT = isConstantableTermType( mustExtend[1] ) ? mustExtend[1] : tryGetConstantableType( fst );
            const sndT = isConstantableTermType( mustExtend[2] ) ? mustExtend[2] : tryGetConstantableType( snd );

            return pPair( fstT, sndT )(
                pappArgToTerm( fst, fstT ),
                pappArgToTerm( snd, sndT )
            ) as any;
        }

        if( isListType( mustExtend ) )
        {
            const elemsT = isConstantableTermType( mustExtend[1] ) ? mustExtend[1] : tryInferElemsT( arg );
            return pList( elemsT )( arg.map(elem => pappArgToTerm( elem,  elemsT ) ) ) as any;
        }
    }

    if(
        arg instanceof Pair ||
        ObjectUtils.has_n_determined_keys(
            arg, 2, "fst", "snd"
        )
    )
    {
        const { fst, snd }: { fst: PappArg<PType>, snd: PappArg<PType> } =
            (arg instanceof Pair ? { fst: arg.fst, snd: arg.snd } : arg) as any;

        //if must extend any
        if( isTypeParam( mustExtend ) )
        {
            const fstT = tryGetConstantableType( fst );
            const sndT = tryGetConstantableType( snd );

            return pPair( fstT, sndT )(
                pappArgToTerm( fst, fstT ),
                pappArgToTerm( snd, sndT )
            ) as any;
        }

        if( isPairType( mustExtend ) )
        {
            const fstT = isConstantableTermType( mustExtend[1] ) ? mustExtend[1] : tryGetConstantableType( fst );
            const sndT = isConstantableTermType( mustExtend[2] ) ? mustExtend[2] : tryGetConstantableType( snd );

            return pPair( fstT, sndT )(
                pappArgToTerm( fst, fstT ),
                pappArgToTerm( snd, sndT )
            ) as any;
        }
    }

    throw new BasePlutsError(
        "pappArgToTerm :: it was not possible to transform `arg` to a plu-ts value" +
        "; `arg` was " + arg +
        "; `mustExtend` plu-ts type was: " + termTypeToString( mustExtend )
    );
}


function getPossiblePlutsTypesOf( value: PappArg<PType> ): TermType[]
{
    if( Term.prototype.isPrototypeOf( value ) )
    {
        return [ value.type ];
    }

    if(
        value === undefined ||
        value === null
    ) return[ unit ];

    if(
        typeof value === "number" ||
        typeof value === "bigint" ||
        value instanceof Integer
    ) return [ int ];

    if( typeof value === "boolean" ) return [ bool ];

    if(
        // hex string case covered below
        Buffer.isBuffer( value ) ||
        value instanceof Uint8Array ||
        value instanceof ArrayBuffer
    ) return [ bs ];

    if( typeof value === "function" && (value as Function).length !== 0 )
    {
        return [
            fn(
                (new Array((value as Function).length))
                .map( ( _ , i ) => tyVar("arg_" + i) ) as any,
                tyVar("fn_output")
            )
        ];
    }

    const types: TermType[] = [];

    if( typeof value === "string" )
    {
        types.push( str );

        // normal strings also can be byetstrings (ascii) if specified
        //
        // if( HexString.isHex( value ) && (value as string).length % 2 === 0 )
        types.push( bs )

        return types;
    }

    return types;
}

function tryGetConstantableType( someValue: PappArg<PType> ): ConstantableTermType
{
    const tys = getPossiblePlutsTypesOf( someValue );
    if( tys.length !== 1 )
    throw new BasePlutsError(
        "pappArgToTerm :: `arg` type was ambigous; try to specify a plu-ts type"
    );

    const t = tys[0];
    if( !isConstantableTermType( t ) )
    throw new BasePlutsError(
        "inferred type was not constantable: type: " + termTypeToString( t )
    );

    return t;
}

function tryInferElemsT( arg: PappArg<PType>[] ): ConstantableTermType
{
    if( arg.length === 0 )
    throw new BasePlutsError(
        "it was not possible to infer the type of the element of a possible plu-ts `list`; try to specify a type"
    );

    let elemsT: TermType | undefined = undefined;
    let inferrefOptions: TermType[];
    for( let i = 0; i < arg.length; i++ )
    {
        inferrefOptions = getPossiblePlutsTypesOf( arg[i] );
        if( inferrefOptions.length === 1 )
        {
            elemsT = inferrefOptions[0];
            break;
        }
    };

    if( elemsT === undefined )
    throw new BasePlutsError(
        "elements type of a possible plu-ts `list` was ambigous; try to specify a type"
    );

    if( !isConstantableTermType(elemsT) )
    throw new BasePlutsError(
        "inferred type was not constantable: type: " + termTypeToString( elemsT )
    );

    JsRuntime.assert(
        arg.every( elem =>
            // @ts-ignore Type instantiation is excessively deep and possibly infinite.
            isTsValueAssignableToPlutsType( elem, elemsT as any)
        ),
        "types in the array where incongruent; expected type was: " + termTypeToString( list( elemsT ) )
    );

    return elemsT;
}

function isTsValueAssignableToPlutsType<PlutsType extends TermType>(
    value: PappArg<ToPType<PlutsType>>,
    plutsType: PlutsType
): boolean
{
    if( !isWellFormedType( plutsType ) ) return false;

    // same of `value instanceof Term` but typescript doesn't knows it
    // ( after `value instanceof Term` typescript marked arg as `never` )
    if( Term.prototype.isPrototypeOf( value as any ) )
    {
        return typeExtends( (value as Term<PType>).type, plutsType );
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