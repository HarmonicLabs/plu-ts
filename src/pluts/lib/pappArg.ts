import type { PType } from "../PType";
import type { PLam, PInt, PBool, PByteString, PString, PUnit, PPair, PList, PAlias } from "../PTypes";

import { termTypeToString, getNRequiredLambdaArgs } from "../../type_system/utils";
import { UtilityTermOf } from "./std/UtilityTerms/addUtilityForType";
import { pfn } from "./pfn";
import { pList } from "./std/list/const";
import { pPair } from "./std/pair/pPair";
import { pByteString } from "./std/bs/pByteString";
import { pStr } from "./std/str/pStr";
import { pBool } from "./std/bool/pBool";
import { pInt } from "./std/int/pInt";
import { pmakeUnit } from "./std/unit/pmakeUnit";
import { Term } from "../Term";
import { TermType, ToPType, tyVar, isWellFormedType, typeExtends, int, bool, isTypeParam, bs, str, unit, fn, list, PrimType, GenericTermType, isWellFormedGenericType, Methods } from "../../type_system";
import { fromHex, isUint8Array } from "@harmoniclabs/uint8array-utils";
import { ByteString } from "@harmoniclabs/bytestring";
import { CborString } from "@harmoniclabs/cbor";
import { has_n_determined_keys } from "@harmoniclabs/obj-utils";
import { Pair } from "@harmoniclabs/pair";
import { assert } from "../../utils/assert";
import { clearAsData } from "../../type_system/tyArgs/clearAsData";


type _TsFunctionSatisfying<KnownArgs extends Term<PType>[], POut extends PType> =
    POut extends PLam<infer POutIn extends PType, infer POutOut extends PType> ?
        (
            // ( ...args: KnownArgs ) => Term<POut> | // functions that do return `PLam` are fine too
            _TsFunctionSatisfying<[ ...KnownArgs, UtilityTermOf<POutIn | PAlias<POutIn, Methods>> ], POutOut>
        ) :
        ( ...args: KnownArgs ) => Term<POut>

export type TsFunctionSatisfying<PIn extends PType, POut extends PType> =
    _TsFunctionSatisfying<[ UtilityTermOf<PIn> ], POut>

export type PAliasPermutations<PT extends PType> = (
    PT extends PAlias<infer PReal extends PType, any> ? PAliasPermutations<PReal> :
    PT extends PPair<infer PFst extends PType, infer PSnd extends PType> ? (
        PAliasPermutations<PFst> extends infer PermFst extends PType ? (
            PAliasPermutations<PSnd> extends infer PermSnd extends PType ? (
                  PPair<PFst,PSnd>
                | PPair<PermFst,PSnd>
                | PPair<PFst, PermSnd>
                | PPair<PermFst, PermSnd>
                | PAlias<PPair<PFst,PSnd>,  Methods>
                | PAlias<PPair<PermFst,PSnd>,  Methods>
                | PAlias<PPair<PFst, PermSnd>,  Methods>
                | PAlias<PPair<PermFst, PermSnd>,  Methods>
            ) : never
        ) : never
    ) :
    PT extends PList<infer PElems extends PType> ? (
        PAliasPermutations<PElems> extends infer PermElems extends PType ? (
            PList<PermElems> | PAlias<PermElems, Methods> 
        ) : never
    ) :
    PT extends PLam<infer PFst extends PType, infer PSnd extends PType> ? (
        PAliasPermutations<PFst> extends infer PermFst extends PType ? (
            PAliasPermutations<PSnd> extends infer PermSnd extends PType ? (
                  PLam<PFst,PSnd>
                | PLam<PermFst,PSnd>
                | PLam<PFst, PermSnd>
                | PLam<PermFst, PermSnd>
                | PAlias<PLam<PFst,PSnd>,  Methods>
                | PAlias<PLam<PermFst,PSnd>,  Methods>
                | PAlias<PLam<PFst, PermSnd>,  Methods>
                | PAlias<PLam<PermFst, PermSnd>,  Methods>
            ) : never
        ) : never
    ) :
    (PAlias<PT, Methods> | PT)
);


export type PappArg<PIn extends PType> =
    (
        PIn extends PAlias<infer PAliased extends PType, infer _> ? PappArg<PAliased> :
        PIn extends PInt ? bigint | number :
        PIn extends PBool ? boolean :
        PIn extends PByteString ? ByteString | Uint8Array | string :
        PIn extends PString ? string :
        PIn extends PUnit ? undefined | null :
        PIn extends PPair<infer PFst extends PType, infer PSnd extends PType> ?
           Pair<PappArg<PFst>, PappArg<PSnd>> | { fst: PappArg<PFst>, snd: PappArg<PSnd> } | [ PappArg<PFst>, PappArg<PSnd> ] :
        // PIn extends PList<infer PElemsT extends PType> ? PappArg<PElemsT>[] :
        PIn extends PLam<infer PIn extends PType, infer POut extends PType> ? TsFunctionSatisfying<PIn,POut> :
        Term<PIn>
    ) | Term<PIn>
    // also the alias of the type is good 
    // (only works because we know `PIn` is not an alias if we are here)
    // because of the initial chec
    | Term<PAliasPermutations<PIn>> 

export function pappArgToTerm<ArgT extends TermType>(
    arg: PappArg<ToPType<ArgT>>,
    mustExtend: GenericTermType = tyVar("pappArgToTerm_mustExtend_any") as any
): UtilityTermOf<ToPType<ArgT>>
{
    if( !isWellFormedGenericType( mustExtend ) )
    {
        throw new Error(
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
            throw new Error(
                "pappArgToTerm :: `arg` was a term of type " +
                termTypeToString( (arg as Term<any>).type ) +
                "; which doesn't extends expected `" +
                termTypeToString( mustExtend ) + "`"
            );
        }
        return arg as any;
    }

    // PUnit
    if( arg === undefined || arg === null )
    {
        if( !typeExtends( mustExtend, unit ) || typeof mustExtend[0] === "symbol" )
        {
            // TODO: add proper error
            throw new Error(
                "pappArgToTerm :: `arg` was `undefined` (a possible `unit`); which doesn't extends expected type `" +
                termTypeToString( mustExtend ) + "`"
            );
        }
        return pmakeUnit() as any;
    }

    // PInt
    if(
        typeof arg === "number" ||
        typeof arg === "bigint"
    )
    {
        if( !typeExtends( int, mustExtend ) )
        {
            // TODO: add proper error
            throw new Error(
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
            throw new Error(
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
            if( ByteString.isValidHexValue( arg ) && ( arg as string).length % 2 === 0 )
            {
                return pByteString( fromHex( arg as string ) ) as any;
            }

            // otherwise return plain string
            return pStr( arg ) as any;
        }

        // if must be a bytestring
        if( typeExtends( mustExtend, bs ) )
        {
            // first tries plain hex
            if( ByteString.isValidHexValue( arg ) && ( arg as string).length % 2 === 0 )
            {
                return pByteString( fromHex( arg ) ) as any;
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
        throw new Error(
            "pappArgToTerm :: `arg` was a possible `str` or `bs`; which doesn't extends expected type " +
            termTypeToString( mustExtend )
        );
    }

    // PByteString
    if(
        isUint8Array( arg )      ||
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
            throw new Error(
                "pappArgToTerm :: `arg` was a possible `bs`; which doesn't extends expected type " +
                termTypeToString( mustExtend )
            );
        }

        if( arg instanceof ByteString )
        {
            return pByteString( arg ) as any;
        }
        
        return pByteString(
            isUint8Array( arg ) ? arg : new Uint8Array( arg )
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
            mustExtend[0] !== PrimType.Lambda || 
            // or missing args
            funcNArgs <= 0
        )
        {
            throw new Error(
                "pappArgToTerm :: `arg` was a possible `lam` or `fn`; however it was not possible to check the type"
            )
        };

        const nLambdaArgs = getNRequiredLambdaArgs( mustExtend as any );

        if(!(
            funcNArgs <= nLambdaArgs
        )) throw new Error(
            `can't convert a ts function expecting ${funcNArgs} arguments ` +
            `to a plu-ts function that requires ${nLambdaArgs} arguments; ` +
            `expected lambda type was: ${termTypeToString(mustExtend)}`
        );

        let outTy = mustExtend as TermType;
        const fnInputsTys = [];

        for( let i = 0; i < funcNArgs; i++ )
        {
            if( outTy[0] !== PrimType.Lambda )
            {
                throw new Error(
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
        )) throw new Error(
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

            return pList( elemsT )( ((arg as any)).map((elem: any) => pappArgToTerm( elem,  elemsT ) ) ) as any;
        }

        if( mustExtend[0] === PrimType.Pair )
        {
            if( arg.length !== 2 )
            throw new Error(
                "an array that doesn't have exactly two elements can't be converted to pair"
            );

            const [ fst, snd ] = arg as PappArg<PType>[];
    
            let fstT = isWellFormedType( mustExtend[1] ) ? mustExtend[1] : tryGetConstantableType( fst );
            let sndT = isWellFormedType( mustExtend[2] ) ? mustExtend[2] : tryGetConstantableType( snd );

            // maybe ???? 
            fstT = clearAsData( fstT );
            sndT = clearAsData( sndT );

            return pPair( fstT, sndT )(
                pappArgToTerm( fst, fstT ),
                pappArgToTerm( snd, sndT )
            ) as any;
        }

        if( mustExtend[0] === PrimType.List )
        {
            const elemsT = isWellFormedType( mustExtend[1] ) ? mustExtend[1] : tryInferElemsT( arg );
            return pList( elemsT )( arg.map(elem => pappArgToTerm( elem,  elemsT ) ) ) as any;
        }
    }

    if(
        arg instanceof Pair ||
        has_n_determined_keys(
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

        if( mustExtend[0] === PrimType.Pair )
        {
            const fstT = isWellFormedType( mustExtend[1] ) ? mustExtend[1] : tryGetConstantableType( fst );
            const sndT = isWellFormedType( mustExtend[2] ) ? mustExtend[2] : tryGetConstantableType( snd );

            return pPair( fstT, sndT )(
                pappArgToTerm( fst, fstT ),
                pappArgToTerm( snd, sndT )
            ) as any;
        }
    }

    console.error( arg, (arg as any).type );
    throw new Error(
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
        typeof value === "bigint"
    ) return [ int ];

    if( typeof value === "boolean" ) return [ bool ];

    if(
        // hex string case covered below
        isUint8Array( value ) ||
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
            ) as any
        ];
    }

    const types: TermType[] = [];

    if( typeof value === "string" )
    {
        types.push( str );

        // normal strings also can be byetstrings (ascii) if specified
        //
        // if( ByteString.isValidHexValue( value ) && (value as string).length % 2 === 0 )
        types.push( bs )

        return types;
    }

    return types;
}

function tryGetConstantableType( someValue: PappArg<PType> ): TermType
{
    const tys = getPossiblePlutsTypesOf( someValue );
    if( tys.length !== 1 )
    throw new Error(
        "pappArgToTerm :: `arg` type was ambigous; try to specify a plu-ts type"
    );

    const t = tys[0];
    if( !isWellFormedType( t ) )
    throw new Error(
        "inferred type was not constantable: type: " + termTypeToString( t )
    );

    return t;
}

function tryInferElemsT( arg: PappArg<PType>[] ): TermType
{
    if( arg.length === 0 )
    throw new Error(
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
    throw new Error(
        "elements type of a possible plu-ts `list` was ambigous; try to specify a type"
    );

    if( !isWellFormedType(elemsT) )
    throw new Error(
        "inferred type was not constantable: type: " + termTypeToString( elemsT )
    );

    assert(
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
            typeof value === "bigint"
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
            (typeof value === "string" && ByteString.isValidHexValue( value ) && (value as string).length % 2 === 0) ||
            isUint8Array( value ) ||
            value instanceof Uint8Array ||
            value instanceof ArrayBuffer
        )
    }

    return false;
}