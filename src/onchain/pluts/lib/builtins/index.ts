import { BasePlutsError } from "../../../../errors/BasePlutsError";
import ObjectUtils from "../../../../utils/ObjectUtils";
import { Head } from "../../../../utils/ts";
import { Application } from "../../../UPLC/UPLCTerms/Application";
import { Builtin } from "../../../UPLC/UPLCTerms/Builtin";
import { HoistedUPLC } from "../../../UPLC/UPLCTerms/HoistedUPLC";
import { Lambda } from "../../../UPLC/UPLCTerms/Lambda";
import { UPLCConst } from "../../../UPLC/UPLCTerms/UPLCConst";
import { UPLCVar } from "../../../UPLC/UPLCTerms/UPLCVar";
import { PType } from "../../PType";
import { PBool, PFn, TermFn, PLam, PInt, PByteString, PString, PDelayed, PUnit, PPair, PList, PData, PDataConstr, PDataMap, PDataList, PDataInt, PDataBS } from "../../PTypes";
import { Term, Type, fn, bs, int, TermType, bool, delayed, PrimType, lam, data, DataType } from "../../Term";
import { isConstantableTermType } from "../../Term/Type/kinds";
import { ToPType, ToPDataType } from "../../Term/Type/ts-pluts-conversion";
import { getNRequiredLambdaArgs } from "../../Term/Type/utils";
import { UtilityTermOf, addUtilityForType } from "../addUtilityForType";
import { papp } from "../papp";
import { PappArg } from "../pappArg";
import { pdelay } from "../pdelay";
import { pfn } from "../pfn";
import { pforce } from "../pforce";
import { phoist } from "../phoist";
import { plam } from "../plam";
import { punsafeConvertType } from "../punsafeConvertType";
// !!! IMPORTANT !!!
// DO NOT change the odrder of imports
import { TermBS, addPByteStringMethods } from "../std/UtilityTerms/TermBS";
import { TermBool, addPBoolMethods } from "../std/UtilityTerms/TermBool";
import { TermInt, addPIntMethods } from "../std/UtilityTerms/TermInt";
import { TermStr, addPStringMethods } from "../std/UtilityTerms/TermStr";
import { getFromDataForType } from "../std/data/conversion/getFromDataTermForType";


function pBool( bool: boolean ): TermBool
{
    return addPBoolMethods(
        new Term<PBool>(
            Type.Bool,
            _dbn => UPLCConst.bool( bool ),
            true
        )
    );
}

export function addApplications<Ins extends [ PType, ...PType[] ], Out extends PType>
    (
        lambdaTerm: Term< PFn< Ins, Out > >,
        addOutputMethods?: ( termOut: Term<Out> ) => any // TermOutput // useless since papp handles all that with addUtility...
    )
    : TermFn< Ins, Out >
{
    const nMissingArgs = getNRequiredLambdaArgs( lambdaTerm.type );

    if( nMissingArgs <= 1 )
    {
        return ObjectUtils.defineReadOnlyProperty(
            lambdaTerm,
            "$",
            ( input: PappArg< Head<Ins> > ) => {
                let output: any = papp( lambdaTerm as any, input );

                return output;
            }
        ) as any;
    }

    return ObjectUtils.defineReadOnlyProperty(
        lambdaTerm,
        "$",
        ( input: PappArg< Head<Ins> > ) =>
            // @ts-ignore
            // Type 'PType[]' is not assignable to type '[PType, ...PType[]]'.
            // Source provides no match for required element at position 0 in target
            addApplications< Tail<Ins>, Out >(
                papp( lambdaTerm as any , input ) as any
            )
    ) as any;
}

type MultiPLam<Args extends [ PType, PType, ...PType[] ]> =
    Args extends [ infer PA extends PType, infer PB extends PType ] ? PLam<PA,PB> :
    Args extends [ infer PA extends PType, infer PB extends PType , infer PC extends PType ] ? PLam<PA,PLam<PB, PC> > :
    Args extends [ infer PA extends PType, ...infer Ps extends [ PType, PType,...PType[] ] ] ? PLam<PA, MultiPLam<Ps> > :
    never

export type IntBinOPToInt = Term< PLam< PInt, PLam< PInt, PInt >>>
& {
    $: ( input: PappArg<PInt> ) => 
        Term<PLam<PInt,PInt>>
        & {
            $: ( input: PappArg<PInt> ) => 
                TermInt
        }
}

function intBinOpToInt( builtin: Builtin )
    : IntBinOPToInt
{
    const op = new Term<PLam<PInt, PLam<PInt, PInt>>>(
        Type.Fn([ Type.Int, Type.Int ], Type.Int ),
        _dbn => builtin
    );

    return  ObjectUtils.defineReadOnlyProperty(
        op,
        "$",
        ( fstIn: PappArg<PInt> ): Term<PLam<PInt, PInt>> => {
            const oneIn = papp( op, fstIn );

            return ObjectUtils.defineReadOnlyProperty(
                oneIn,
                "$",
                ( sndIn: PappArg<PInt> ): TermInt => {
                    return papp( oneIn, sndIn )
                }
            );
        }
    ) as any;
}

export type IntBinOPToBool = Term< PLam< PInt, PLam< PInt, PInt >>>
& {
    $: ( input: PappArg<PInt> ) => 
        Term<PLam<PInt,PBool>>
        & {
            $: ( input: PappArg<PInt> ) => 
                TermBool
        }
}

function intBinOpToBool( builtin: Builtin )
    : IntBinOPToBool
{
    const op = new Term<PLam<PInt, PLam<PInt, PBool>>>(
        Type.Fn([ Type.Int, Type.Int ], Type.Bool ),
        _dbn => builtin
    );

    return  ObjectUtils.defineReadOnlyProperty(
        op,
        "$",
        ( fstIn: Term<PInt> ): Term<PLam<PInt, PBool>> => {
            const oneIn = papp( op, fstIn );
            
            return ObjectUtils.defineReadOnlyProperty(
                oneIn,
                "$",
                ( sndIn: Term<PInt> ): TermBool => {
                    return addPBoolMethods( papp( oneIn, sndIn ) )
                }
            ) as any;
        }
    ) as any;
}

export type ByteStrBinOPToBS = Term< PLam< PByteString, PLam< PByteString, PByteString >>>
& {
    $: ( input: PappArg<PByteString> ) => 
        Term<PLam<PByteString,PByteString>>
        & {
            $: ( input: PappArg<PByteString> ) => 
                TermBS
        }
}

function byteStrBinOpToBS( builtin: Builtin )
    : ByteStrBinOPToBS
{
    const op = new Term<PLam<PByteString, PLam<PByteString, PByteString>>>(
        Type.Fn([ Type.BS, Type.BS ], Type.BS ),
        _dbn => builtin
    );

    return  ObjectUtils.defineReadOnlyProperty(
        op,
        "$",
        ( fstIn: Term<PByteString> ): Term<PLam<PByteString, PByteString>> => {
            const oneIn = papp( op, fstIn );

            return ObjectUtils.defineReadOnlyProperty(
                oneIn,
                "$",
                ( sndIn: Term<PByteString> ): TermBS => {
                    return addPByteStringMethods( papp( oneIn as any, sndIn ) )
                }
            ) as any;
        }
    ) as any;
}

export type ByteStrBinOPToBool = Term< PLam< PByteString, PLam< PByteString, PBool >>>
& {
    $: ( input: PappArg<PByteString> ) => 
        Term<PLam<PByteString,PBool>>
        & {
            $: ( input: PappArg<PByteString> ) => 
                TermBool
        }
}

function byteStrBinOpToBool( builtin: Builtin )
    : ByteStrBinOPToBool
{
    const op = new Term<PLam<PByteString, PLam<PByteString, PBool>>>(
        Type.Fn([ Type.BS, Type.BS ], Type.Bool ),
        _dbn => builtin
    );

    return  ObjectUtils.defineReadOnlyProperty(
        op,
        "$",
        ( fstIn: Term<PByteString> ): Term<PLam<PByteString, PBool>> => {
            const oneIn = papp( op, fstIn );

            return ObjectUtils.defineReadOnlyProperty(
                oneIn,
                "$",
                ( sndIn: Term<PByteString> ): TermBool => {
                    return addPBoolMethods( papp( oneIn as any, sndIn ) )
                }
            ) as any;
        }
    ) as any;
}

export const padd   = intBinOpToInt( Builtin.addInteger);
export const psub   = intBinOpToInt( Builtin.subtractInteger);
export const pmult  = intBinOpToInt( Builtin.multiplyInteger);
export const pdiv   = intBinOpToInt( Builtin.divideInteger);
export const pquot  = intBinOpToInt( Builtin.quotientInteger);
export const prem   = intBinOpToInt( Builtin.remainderInteger);
export const pmod   = intBinOpToInt( Builtin.modInteger);

export const peqInt     = intBinOpToBool( Builtin.equalsInteger );
export const plessInt   = intBinOpToBool( Builtin.lessThanInteger );
export const plessEqInt = intBinOpToBool( Builtin.lessThanEqualInteger );


// identicall to `pflip` jst at UPLC level to avoid using `papp`
// which causes circular dependecy
const _pflipUPLC = new HoistedUPLC(
    new Lambda( // toFlip
        new Lambda( // secondArg
            new Lambda( // firstArg
                new Application(
                    new Application(
                        new UPLCVar( 2 ),   // toFlip,
                        new UPLCVar( 0 )    // firstArg
                    ),
                    new UPLCVar( 1 )        // secondArg
                )
            )
        )
    )
);

// @ts-ignore Type instantiation is excessively deep and possibly infinite.
export const pgreaterInt = addApplications<[ PInt, PInt ], PBool>( 
        new Term<PLam<PInt, PLam<PInt, PBool>>>(
        Type.Fn([ Type.Int, Type.Int ], Type.Bool ),
        _dbn => new HoistedUPLC(
            new Application(
                _pflipUPLC.clone(),

                plessInt.toUPLC( 0 )
            
            )
        )
    )
);

export const pgreaterEqInt = addApplications<[ PInt, PInt ], PBool>( 
    new Term<PLam<PInt, PLam<PInt, PBool>>>(
    Type.Fn([ Type.Int, Type.Int ], Type.Bool ),
    _dbn => new HoistedUPLC(
        new Application(
            _pflipUPLC.clone(),

            plessEqInt.toUPLC( 0 )
        
        )
    )
)
);
export const pappendBs = byteStrBinOpToBS( Builtin.appendByteString );
export const pconsBs: Term<PLam<PInt, PLam< PByteString, PByteString>>>
& {
    $: ( input: PappArg<PInt> ) => 
        Term<PLam<PByteString,PByteString>>
        & {
            $: ( input: PappArg<PByteString> ) => 
                TermBS
        }
} = (() => {
    const consByteString = new Term<PFn<[ PInt, PByteString], PByteString>>(
        Type.Fn([ Type.Int, Type.BS ], Type.BS ),
        _dbn => Builtin.consByteString
    );

    return  ObjectUtils.defineReadOnlyProperty(
        consByteString,
        "$",
        ( byte: Term<PInt> ): Term<PLam<PByteString, PByteString>> => {
            const consByteStringFixedByte = papp( consByteString, byte );

            return ObjectUtils.defineReadOnlyProperty(
                consByteStringFixedByte,
                "$",
                ( toByteString: Term<PByteString> ): TermBS => {
                    return addPByteStringMethods( papp( consByteStringFixedByte, toByteString ) )
                }
            ) as any;
        }
    ) as any;
})();

export const flippedCons = addApplications<[ PByteString, PInt ], PByteString>( 
    new Term(
        fn([ bs, int ], bs),
        _dbn => new HoistedUPLC(
            new Application(
                _pflipUPLC.clone(),
                Builtin.consByteString
            )
        )
    )
);

export const psliceBs: Term<PLam<PInt, PLam< PInt, PLam< PByteString, PByteString>>>>
& {
    $: ( fromIndex: PappArg<PInt> ) => 
        Term<PLam< PInt, PLam<PByteString,PByteString>>>
        & {
            $: ( ofLength: PappArg<PInt> ) => 
                Term<PLam<PByteString,PByteString>>
                & {
                    $: ( onByteString: PappArg<PByteString> ) => TermBS
                }
        }
} = (() => {
    const sliceBs = new Term<PFn<[ PInt, PInt, PByteString ], PByteString>>(
        Type.Fn([ Type.Int, Type.Int, Type.BS ], Type.BS ),
        _dbn => Builtin.sliceByteString,
    );

    return ObjectUtils.defineReadOnlyProperty(
        sliceBs,
        "$",
        ( fromIndex: PappArg<PInt> ): Term<PLam< PInt, PLam<PByteString,PByteString>>>
        & {
            $: ( ofLength: PappArg<PInt> ) => 
                Term<PLam<PByteString,PByteString>>
                & {
                    $: ( onByteString: PappArg<PByteString> ) => TermBS
                }
        } =>{
            const sliceBsFromIdx = papp( sliceBs, fromIndex );
            
            return ObjectUtils.defineReadOnlyProperty(
                sliceBsFromIdx,
                "$",
                ( ofLength: Term<PInt> ): Term<PLam< PInt, PLam<PByteString,PByteString>>>
                & {
                    $: ( ofLength: Term<PInt> ) => 
                        Term<PLam<PByteString,PByteString>>
                        & {
                            $: ( onByteString: Term<PByteString> ) => TermBS
                        }
                } => {
                    const sliceBsFromIdxOfLength = papp( sliceBsFromIdx, ofLength );

                    return ObjectUtils.defineReadOnlyProperty(
                        sliceBsFromIdxOfLength,
                        "$",
                        ( onByteString: Term<PByteString> ): TermBS =>
                            addPByteStringMethods( papp( sliceBsFromIdxOfLength, onByteString ) )
                    ) as any
                }
            ) as any
        }
    )
})();

export const plengthBs :TermFn<[ PByteString ], PInt >
    = (() => {
        const lenBS = new Term<PLam< PByteString, PInt >>(
            Type.Lambda( Type.BS, Type.Int ),
            _dbn => Builtin.lengthOfByteString,
        );

        return ObjectUtils.defineReadOnlyProperty(
            lenBS,
            "$",
            ( ofByteString: PappArg<PByteString> ): TermInt =>
                addPIntMethods( papp( lenBS, ofByteString ) )
        );
    })();

export const pindexBs
    : Term<PLam<PByteString, PLam<PInt , PInt>>>
    & {
        $: ( ofByteString: PappArg<PByteString> ) =>
            Term<PLam<PInt, PInt>>
            & {
                $: ( index: PappArg<PInt> ) => TermInt
            }
    }
    = (() => {
        const idxBS = new Term<PFn<[ PByteString, PInt ], PInt>>(
                Type.Fn([ Type.BS, Type.Int ], Type.Int ),
                _dbn => Builtin.indexByteString,
            );
        
        return ObjectUtils.defineReadOnlyProperty(
            idxBS,
            "$",
            ( ofByteString: PappArg<PByteString> ):
                Term<PLam<PInt, PInt>>
                & {
                    $: ( index: PappArg<PInt> ) => TermInt
                } =>
            {
                const idxOfBS = papp( idxBS, ofByteString );

                return ObjectUtils.defineReadOnlyProperty(
                    idxOfBS,
                    "$",
                    ( index: PappArg<PInt> ): TermInt =>
                        addPIntMethods( papp( idxOfBS, index ) )
                ) as any;
            }
        )
    })();

export const peqBs      = byteStrBinOpToBool( Builtin.equalsByteString );
export const plessBs    = byteStrBinOpToBool( Builtin.lessThanByteString );
export const plessEqBs  = byteStrBinOpToBool( Builtin.lessThanEqualsByteString );

export const pgreaterBS: ByteStrBinOPToBool =
    phoist(
        pfn([ Type.BS, Type.BS ], Type.Bool )(
            ( a: Term<PByteString>, b: Term<PByteString> ): TermBool => plessBs.$( b ).$( a )
        )
    ) as any;

export const pgreaterEqBS: ByteStrBinOPToBool =
    phoist(
        pfn([ Type.BS, Type.BS ], Type.Bool )(
            ( a: Term<PByteString>, b: Term<PByteString> ): TermBool => plessEqBs.$( b ).$( a )
        )
    ) as any;

export const psha2_256: TermFn<[ PByteString ], PByteString > =
    addApplications<[ PByteString ], PByteString >(
        new Term(
            Type.Lambda( Type.BS, Type.BS ),
            _dbn => Builtin.sha2_256
        )
    );
export const psha3_256: TermFn<[ PByteString ], PByteString > =
    addApplications<[ PByteString ], PByteString >(
        new Term(
            Type.Lambda( Type.BS, Type.BS ),
            _dbn => Builtin.sha3_256
        )
    );
export const pblake2b_256: TermFn<[ PByteString ], PByteString > =
    addApplications<[ PByteString ], PByteString >(
        new Term(
            Type.Lambda( Type.BS, Type.BS ),
            _dbn => Builtin.blake2b_256
        )
    );

/**
 * performs cryptographic signature verification using the Ed25519 scheme
 * 
 * @param {PByteString} key ```PByteString``` of length 32 ( ```PubKeyHash``` )
 * @param {PByteString} message abitrary length ```PByteString```
 * @param {PByteString} signature ```PByteString``` of length 64
 * @returns {PBool} 
 * 
 * @throws
 * @fails
 */
export const pverifyEd25519: TermFn<[ PByteString, PByteString, PByteString ], PBool > =
    addApplications<[ PByteString, PByteString, PByteString ], PBool >(
        new Term(
            Type.Fn([ Type.BS, Type.BS, Type.BS ], Type.Bool),
            _dbn => Builtin.verifyEd25519Signature
        )
    );



export type StrBinOPToStr = Term<PLam<PString, PLam<PString,PString>>>
& {
    $: ( input: PappArg<PString> ) => 
        Term<PLam<PString,PString>>
        & {
            $: ( input: PappArg<PString> ) => 
                TermStr
        }
}

export const pappendStr: StrBinOPToStr = (() => {
    const op = new Term<PLam<PString, PLam<PString,PString>>>(
        Type.Fn([ Type.Str, Type.Str ], Type.Str ),
        _dbn => Builtin.appendString
    );

    return  ObjectUtils.defineReadOnlyProperty(
        op,
        "$",
        ( fstIn: Term<PString> ): Term<PLam<PString, PString>> => {
            const oneIn = papp( op, fstIn );

            return ObjectUtils.defineReadOnlyProperty(
                oneIn,
                "$",
                ( sndIn: Term<PString> ): TermStr => {
                    return addPStringMethods( papp( oneIn, sndIn ) )
                }
            ) as any;
        }
    ) as any;
})();

export type StrBinOPToBool = Term<PLam<PString,PLam<PString, PBool>>>
& {
    $: ( input: PappArg<PString> ) => 
        Term<PLam<PString,PBool>>
        & {
            $: ( input: PappArg<PString> ) => 
                TermBool
        }
}
export const peqStr: StrBinOPToBool = (() => {
    const op = new Term<PLam<PString,PLam<PString, PBool>>>(
        Type.Fn([ Type.Str, Type.Str ], Type.Bool ),
        _dbn => Builtin.equalsString,
    );

    return  ObjectUtils.defineReadOnlyProperty(
        op,
        "$",
        ( fstIn: Term<PString> ): Term<PLam<PString, PBool>> => {
            const oneIn = papp( op, fstIn );

            return ObjectUtils.defineReadOnlyProperty(
                oneIn,
                "$",
                ( sndIn: Term<PString> ): TermBool => {
                    return addPBoolMethods( papp( oneIn, sndIn ) )
                }
            ) as any;
        }
    ) as any;
})();

export const pencodeUtf8: Term<PLam<PString, PByteString>>
& {
    $: ( str: PappArg<PString> ) => TermBS
} = (() => {
    const encodeUtf8  =new Term<PLam<PString, PByteString>>(
            Type.Lambda( Type.Str, Type.BS ),
            _dbn => Builtin.encodeUtf8
        );

    return ObjectUtils.defineReadOnlyProperty(
        encodeUtf8,
        "$",
        ( str: PappArg<PString> ): TermBS => addPByteStringMethods( papp( encodeUtf8, str ) )
    )
})()

export const pdecodeUtf8: Term<PLam<PByteString, PString>>
& {
    $: ( str: PappArg<PByteString> ) => TermStr
} = (() => {
    const decodeUtf8  =new Term<PLam<PByteString, PString>>(
        Type.Lambda( Type.BS, Type.Str ),
        _dbn => Builtin.decodeUtf8,
        );

    return ObjectUtils.defineReadOnlyProperty(
        decodeUtf8,
        "$",
        ( byteStr: PappArg<PByteString> ): TermStr => addPStringMethods( papp( decodeUtf8, byteStr ) )
    )
})()

/*

// alternative implementaiton of polymorphic functions
//
// pros:
//  - is not a function but a constant
//  - infers terms
//
// cons:
//  - type parameters typescript types must be the generic 'PType'
//    this may be annoyng, especially working whit higer order functions
//  - type must be manually specified
//  
const _pstrictIf_: Term<PLam<PBool, PLam<PType, PLam<PType , PType>>>> &
{
    $: ( condtion: Term<PBool> ) => 
        Term<PFn<[PType, PType], PType>> &
        {
            $: <PReturnT extends PType>( caseTrue: Term<PReturnT> ) =>
                Term<PLam<PReturnT,PReturnT>> &
                {
                    $: ( caseFalse: Term<PReturnT> ) => Term<PReturnT>
                }
        }
} = (() => {
    const returnT = Type.Var("pstrictIf_returnType");

    const term = new Term<PFn<[ PBool, PType, PType ], PType>>(
        Type.Fn([ Type.Bool, returnT, returnT ], returnT ),
        _dbn => Builtin.ifThenElse
    );

    return ObjectUtils.defineReadOnlyProperty(
        term,
        "$",
        ( conditon: Term<PBool> ) => {

            const _if = papp( term, conditon );

            return ObjectUtils.defineReadOnlyProperty(
                _if,
                "$",
                <PReturnT extends PType>( caseTrue: Term<PReturnT> ) => {

                    const _ifThen: Term<PLam<PReturnT, PReturnT>> = papp( _if, caseTrue ) as any;

                    return ObjectUtils.defineReadOnlyProperty(
                        _ifThen,
                        "$",
                        ( caseFalse: Term<PReturnT> ) => papp( _ifThen, caseFalse )
                    )
                }
            )
        }
    );
})();
// */

export function pstrictIf<ReturnT extends TermType>( returnType: ReturnT | undefined = undefined ): TermFn<[ PBool, ToPType<ReturnT>, ToPType<ReturnT> ], ToPType<ReturnT>>
{
    const returnT = returnType ?? Type.Var("pstrictIf_returnType");

    return addApplications<[ PBool, ToPType<ReturnT>, ToPType<ReturnT> ], ToPType<ReturnT>>(
        new Term<
            PLam<
                PBool,
                PLam<
                    ToPType<ReturnT>,
                    PLam<
                        ToPType<ReturnT>,
                        ToPType<ReturnT>
                    >
                >
            >
        >
        (
            Type.Fn([ Type.Bool, returnT, returnT ], returnT ) as any,
            _dbn => Builtin.ifThenElse
        ) as any
    ) as any;
}

export function pif<ReturnT extends TermType>( returnType: ReturnT | undefined = undefined )
    : Term<PLam<PBool, PLam<ToPType<ReturnT>, PLam<ToPType<ReturnT>, ToPType<ReturnT>>>>> 
    & {
        $: (condition: PappArg<PBool>) =>
            Term<PLam< ToPType<ReturnT>, PLam< ToPType<ReturnT>, ToPType<ReturnT>>>> 
            & {
                then: ( caseTrue: PappArg<ToPType<ReturnT>> ) =>
                    TermFn<[ ToPType<ReturnT> ], ToPType<ReturnT> >
                    & {
                        else: ( caseFalse: PappArg<ToPType<ReturnT>> ) =>
                        UtilityTermOf<ToPType<ReturnT>> 
                    },
                $: ( caseTrue: PappArg<ToPType<ReturnT>> ) =>
                    TermFn<[ ToPType<ReturnT> ], ToPType<ReturnT> > & {
                        else: ( caseFalse: PappArg<ToPType<ReturnT>> ) =>
                        UtilityTermOf<ToPType<ReturnT>> 
                    }
            }
    }
{

    const returnT = returnType ?? Type.Var("pif_returnType");

    // new term identical to the strict one in order to define new (different) "$" properties
    const _lambdaIf = new Term<
        PLam<
            PBool,
            PLam<
                ToPType<ReturnT>,
                PLam<
                    ToPType<ReturnT>,
                    ToPType<ReturnT>
                >
            >
        >
    >(
        // type is different from the one specified by the generic because
        // ```papp``` throws if types don't match;
        // but the perceived type form the user perspective is the one of the generic
        Type.Fn([ Type.Bool, Type.Delayed( returnT ), Type.Delayed( returnT ) ], Type.Delayed( returnT ) ) as any,
        _dbn => Builtin.ifThenElse
    );

    return ObjectUtils.defineReadOnlyProperty(
        _lambdaIf,
        "$",
        ( condition: Term< PBool > ): TermFn<[ ToPType<ReturnT>, ToPType<ReturnT> ], ToPType<ReturnT> > => (() => {
            
            /*
            [ (builtin ifThenElse) condition ]
            */
            const _lambdaIfThen = papp( _lambdaIf, condition );

            const _lambdaIfThenApp = ObjectUtils.defineReadOnlyProperty(
                _lambdaIfThen,
                "$",
                //@ts-ignore
                ( caseTrue: Term<ToPType<ReturnT>> ): TermFn<[ ToPType<ReturnT> ],ToPType<ReturnT>> => (() => {
                    /*
                    [
                        [ (builtin ifThenElse) condition ]
                        (delay case true)
                    ]
                    */
                    const _lambdaIfThenElse = papp( _lambdaIfThen, pdelay( caseTrue ) as any );

                    const _lambdaIfThenElseApp = ObjectUtils.defineReadOnlyProperty(
                        _lambdaIfThenElse,
                        "$",
                        ( caseFalse: Term<ToPType<ReturnT>> ): Term< ToPType<ReturnT> > =>
                            /*
                            (force [
                                [
                                    [ (builtin ifThenElse) condition ]
                                    (delay caseTrue)
                                ]
                                (delay caseFalse)
                            ])
                            */
                            pforce( papp( _lambdaIfThenElse, pdelay( caseFalse ) as any ) as any ) as any
                    );
                    
                    return ObjectUtils.defineReadOnlyProperty(
                        _lambdaIfThenElseApp,
                        "else",
                        _lambdaIfThenElseApp.$
                    );
                })() 
            );

            return ObjectUtils.defineReadOnlyProperty(
                _lambdaIfThenApp,
                "then",
                _lambdaIfThenApp.$
            );
        })() as any
    ) as any;
}


export const pnot
    : Term<PLam<PBool, PBool>>
    & {
        $: ( bool: PappArg<PBool> ) => TermBool
    }
    =
    phoist(
        plam( Type.Bool, Type.Bool )
        ( bool => 
            addPBoolMethods(
                pstrictIf( Type.Bool ).$( bool )
                .$( pBool( false ) )
                .$( pBool( true  ) )
            )
        )
    ) as any;

export const pstrictAnd
    : Term<PLam<PBool, PLam<PBool, PBool>>>
    & {
        $: ( bool: PappArg<PBool> ) =>
            Term<PLam<PBool, PBool>>
            & {
                $: ( bool: PappArg<PBool> ) => TermBool
            }
    }
    = phoist(
        pfn([ bool, bool ], bool )
        (( a: Term<PBool>, b: Term<PBool> ) => {

            // it makes no sense to use `pif` as
            // what is delayed are variables (already evaluated)
            return addPBoolMethods(
                pstrictIf( bool ).$( a )
                .$( b )
                .$( pBool( false ) )
            );
        })
    ) as any;

export const pand
    : Term<PLam<PBool, PLam<PDelayed<PBool>, PBool>>>
    & {
        $: ( bool: PappArg<PBool> ) =>
            Term<PLam<PDelayed<PBool>, PBool>>
            & {
                $: ( bool: PappArg<PDelayed<PBool>> ) => TermBool
            }
    }
    = phoist(
        pfn([ bool, delayed( bool ) ], bool )
        (( a: Term<PBool>, b: Term<PDelayed<PBool>> ) => {

            return addPBoolMethods(
                pforce(
                    pstrictIf( delayed( bool ) ).$( a )
                    .$( b )
                    .$( pdelay( pBool( false ) ) )
                )
            );
        })
    ) as any;

export const pstrictOr
    : Term<PLam<PBool, PLam<PBool, PBool>>>
    & {
        $: ( bool: PappArg<PBool> ) =>
            Term<PLam<PBool, PBool>>
            & {
                $: ( bool: PappArg<PBool> ) => TermBool
            }
    }
    = phoist(
        pfn([ bool, bool ], bool )
        (( a: Term<PBool>, b: Term<PBool> ) => {

            // it makes no sense to use `pif` as
            // what is delayed are variables (already evaluated)
            return addPBoolMethods(
                pstrictIf( bool  ).$( a )
                .$( pBool( true ) )
                .$( b )
            );
        })
    ) as any;

export const por
    : Term<PLam<PBool, PLam<PDelayed<PBool>, PBool>>>
    & {
        $: ( bool: PappArg<PBool> ) =>
            Term<PLam<PDelayed<PBool>, PBool>>
            & {
                $: ( bool: PappArg<PDelayed<PBool>> ) => TermBool
            }
    }
    = phoist(
        pfn([ bool, delayed( bool ) ], bool )
        (( a: Term<PBool>, b: Term<PDelayed<PBool>> ) => {

            return addPBoolMethods(
                pforce(
                    pstrictIf( delayed( bool ) ).$( a )
                    .$( pdelay( pBool( true ) ) )
                    .$( b )
                )
            );
        })
    ) as any;


export function pchooseUnit<ReturnT extends TermType>( returnType: ReturnT | undefined = undefined )
    : TermFn<[ PUnit, ToPType<ReturnT> ], ToPType<ReturnT>>
{
    const returnT = returnType ?? Type.Var("pchooseUnit_returnType");
    
    return addApplications<[ PUnit, ToPType<ReturnT> ], ToPType<ReturnT>>(
        new Term(
            Type.Fn([ Type.Unit, returnT ], returnT ),
            _dbn => Builtin.chooseUnit,
        )
    );
}

export function ptrace<ReturnT extends TermType>( returnType: ReturnT | undefined = undefined )
    : TermFn<[ PString, ToPType<ReturnT> ], ToPType<ReturnT>>
{
    const returnT = returnType ?? Type.Var("ptrace_returnType");
    
    return addApplications<[ PString, ToPType<ReturnT> ], ToPType<ReturnT> >(
        new Term(
            Type.Fn([ Type.Str, returnT ], returnT ),
            _dbn => Builtin.trace
        )
    );
}

export function pfstPair<A extends TermType, B extends TermType>( fstType: A, sndType: B )
    : TermFn<[ PPair<ToPType<A>,ToPType<B>> ], ToPType<A> >
{
    const a = fstType ?? Type.Var("pfstPair_fstType");
    const b = sndType ?? Type.Var("pfstPair_sndType");

    const bnTerm = new Term<PLam<PPair<ToPType<A>, ToPType<B>>, ToPType<A>>>(
        Type.Lambda( Type.Pair( a, b ), a ),
        _dbn => Builtin.fstPair
    );
    
    ObjectUtils.defineReadOnlyProperty(
        bnTerm,
        "$",
        ( pair: Term<PPair<ToPType<A>,ToPType<B>>> ): UtilityTermOf<ToPType<A>> => {

            if( (pair as any).__isDynamicPair || pair.type[0] === PrimType.PairAsData )
            {
                if( !isConstantableTermType( a ) )
                {
                    throw new BasePlutsError(
                        "is not possible to extract the first element of a (dynamic) pair with non constant type"
                    );
                }

                return addUtilityForType( a )(
                    getFromDataForType( a )(
                        papp(
                            punsafeConvertType( bnTerm, lam( Type.Pair( data, data ), data ) ),
                            punsafeConvertType( pair, Type.Pair( data, data ) )
                        ) as any
                    ) as any
                ) as any;

            }

            return papp( bnTerm, pair );
        }
    );

    return bnTerm as any;
}

export function psndPair<A extends TermType, B extends TermType>( fstType: A, sndType: B )
    : TermFn<[ PPair<ToPType<A>,ToPType<B>> ], ToPType<B>>
{
    const a = fstType ?? Type.Var("psndPair_fstType");
    const b = sndType ?? Type.Var("psndPair_sndType");
   
    const bnTerm = new Term<PLam<PPair<ToPType<A>, ToPType<B>>, ToPType<B>>>(
        Type.Lambda( Type.Pair( a, b ), b ),
        _dbn => Builtin.sndPair
    );
    
    ObjectUtils.defineReadOnlyProperty(
        bnTerm,
        "$",
        ( pair: Term<PPair<ToPType<A>,ToPType<B>>> ): UtilityTermOf<ToPType<B>> => {

            if( (pair as any).__isDynamicPair || pair.type[0] === PrimType.PairAsData )
            {
                if( !isConstantableTermType( b ) )
                {
                    throw new BasePlutsError(
                        "is not possible to extract the first element of a (dynamic) pair with non constant type"
                    );
                }

                return addUtilityForType( b )(
                    getFromDataForType( b )(
                        papp(
                            punsafeConvertType( bnTerm, lam( Type.Pair( data, data ), data ) ),
                            punsafeConvertType( pair, Type.Pair( data, data ) )
                        ) as any
                    ) as any
                ) as any;

            }

            return papp( bnTerm, pair );
        }
    );

    return bnTerm as any;
}

export function pstrictChooseList<ListElemT extends TermType, ReturnT extends TermType>( listElemType: ListElemT, returnType: ReturnT )
    : TermFn<[ PList< ToPType<ListElemT> > , ToPType<ReturnT>, ToPType<ReturnT> ], ToPType<ReturnT> >
{
    const listElemT = listElemType ?? Type.Var("pstrictChooseList_listElemType");
    const returnT = returnType ?? Type.Var("pstrictChooseList_returnType");

    return addApplications<[ PList< ToPType<ListElemT> > , ToPType<ReturnT>, ToPType<ReturnT> ], ToPType<ReturnT> >(
        new Term(
            Type.Fn([ Type.List( listElemT ), returnT, returnT ], returnT ),
            _dbn => Builtin.chooseList
        )
    );
}


export function pchooseList<ListElemT extends TermType, ReturnT extends TermType>(
        listElemType: ListElemT | undefined = undefined ,
        returnType: ReturnT | undefined = undefined
    )
    : Term<PLam< PList< ToPType<ListElemT> > , PLam<ToPType<ReturnT>, PLam<ToPType<ReturnT>, ToPType<ReturnT>>>>>
    & {
        $: ( list: PappArg<PList< ToPType<ListElemT> >>) =>
            Term<PLam<ToPType<ReturnT>, PLam<ToPType<ReturnT>, ToPType<ReturnT>>>>
            & {
                caseNil: ( nilCase: PappArg<ToPType<ReturnT>> ) =>
                    TermFn<[ ToPType<ReturnT> ], ToPType<ReturnT> >
                    & {
                        caseCons: ( consCase: PappArg<ToPType<ReturnT>> ) =>
                        Term<ToPType<ReturnT>> 
                    },
                $: ( nilCase: PappArg<ToPType<ReturnT>> ) =>
                    TermFn<[ ToPType<ReturnT> ], ToPType<ReturnT> > & {
                        caseCons: ( consCase: PappArg<ToPType<ReturnT>> ) =>
                        Term<ToPType<ReturnT>> 
                    }
            }
    }
{
    const listElemT = listElemType ?? Type.Var("pchooseList_listElemType");
    const returnT   = returnType   ?? Type.Var("pchooseList_returnType");

    // new term identical to the strict one in order to define new (different) "$" properties
    const _chooseList = new Term<
        PLam<
            PList<ToPType<ListElemT>>,
            PLam<
                ToPType<ReturnT>,
                PLam<
                    ToPType<ReturnT>,
                    ToPType<ReturnT>
                >
            >
        >
    >(
        Type.Fn([Type.List( listElemT ), Type.Delayed( returnT ), Type.Delayed( returnT )], returnT ),
        _dbn => Builtin.chooseList
    );

    return ObjectUtils.defineReadOnlyProperty(
        _chooseList,
        "$",
        ( list: Term<PList<ToPType<ListElemT>>> ) => {

            const _chooseListNil = papp( _chooseList, list );

            const _chooseListNilApp = ObjectUtils.defineReadOnlyProperty(
                _chooseListNil,
                "$",
                ( nilCase: Term<ToPType<ReturnT>> ) => {

                    const _chooseListNilCons = papp( _chooseListNil, pdelay( nilCase ) as any );

                    const _chooseListNilConsApp = ObjectUtils.defineReadOnlyProperty(
                        _chooseListNilCons,
                        "$",
                        ( consCase: Term<ToPType<ReturnT>> ) => {

                            return pforce(
                                papp(
                                    _chooseListNilCons,
                                    pdelay( consCase ) as any
                                ) as any
                            );
                        }
                    );

                    return ObjectUtils.defineReadOnlyProperty(
                        _chooseListNilConsApp,
                        "caseCons",
                        _chooseListNilConsApp.$
                    )
                }
            );

            return ObjectUtils.defineReadOnlyProperty(
                _chooseListNilApp,
                "caseNil",
                _chooseListNilApp.$
            );
        }
    ) as any;
}

export function pprepend<ListElemT extends TermType>( listElemType: ListElemT | undefined = undefined )
    : TermFn<[ ToPType<ListElemT> , PList< ToPType<ListElemT> > ], PList< ToPType<ListElemT> > >
{
    const listElemT = listElemType ?? Type.Var("pprepend_listElemType");

    return addApplications<[ ToPType<ListElemT> , PList< ToPType<ListElemT> > ], PList< ToPType<ListElemT> > >(
        new Term(
            Type.Fn([ listElemT, Type.List( listElemT ) ], Type.List( listElemT ) ),
            _dbn => Builtin.mkCons
        )
    );
}

export function phead<ListElemT extends TermType>( listElemType: ListElemT | undefined = undefined )
    : TermFn<[ PList<ToPType<ListElemT>> ], ToPType<ListElemT>>
{
    const listElemT = listElemType ?? Type.Var("pprepend_listElemType");

    return addApplications<[ PList< ToPType<ListElemT> > ], ToPType<ListElemT> >(
        new Term(
            Type.Lambda( Type.List( listElemT ), listElemT ),
            _dbn => Builtin.headList
        )
    );
}

export function ptail<ListElemT extends TermType>( listElemT: ListElemT )
    : TermFn<[ PList< ToPType<ListElemT> > ], PList< ToPType<ListElemT> > >
{
    return addApplications<[ PList< ToPType<ListElemT> > ], PList< ToPType<ListElemT> > >(
        new Term(
            Type.Lambda( Type.List( listElemT ), Type.List( listElemT ) ),
            _dbn => Builtin.tailList
        )
    );
}

export const pisEmpty: TermFn<[PList<PType>], PBool> = addApplications<[ PList<PType> ], PBool >(
        new Term(
            Type.Lambda( Type.List( Type.Any ), Type.Bool ),
            _dbn => Builtin.nullList
        )
    );

/**
 * in theory 'chooseData' has 5 type parameters (1 per data constructor)
 * and this means any of those types can be returned
 * 
 * plu-ts wont support that in favor of type determinism
 */
export function pstrictChooseData<ReturnT extends TermType>( returnT: ReturnT )
    : TermFn<[ PData, ToPType<ReturnT>, ToPType<ReturnT>, ToPType<ReturnT>, ToPType<ReturnT>, ToPType<ReturnT> ], ToPType<ReturnT> >
{
    return addApplications<[ PData, ToPType<ReturnT>, ToPType<ReturnT>, ToPType<ReturnT>, ToPType<ReturnT>, ToPType<ReturnT> ], ToPType<ReturnT> >(
        new Term(
            Type.Fn(
                [ Type.Data.Any, returnT, returnT, returnT, returnT, returnT ], returnT
            ),
            _dbn => Builtin.chooseData
        )
    );
}

// only for pchooseData Type definition
// without this it would be impossoble to read
type CaseBFn<RetT extends PType> = ( bCase: PappArg< RetT > ) => UtilityTermOf<RetT>
export type CaseIFn<RetT extends PType> = ( iCase: PappArg< RetT > ) =>
    Term<PLam<RetT , RetT >>
    & {
        caseB: CaseBFn<RetT>
        $: CaseBFn<RetT>
    };
export type CaseListFn<RetT extends PType> = ( listCase: PappArg<RetT> ) =>
    Term<PLam<RetT, PLam<RetT , RetT >>>
    & {
        caseI: CaseIFn<RetT>,
        $: CaseIFn<RetT>
    }
export type CaseMapFn<RetT extends PType> = ( mapCase: PappArg< RetT > ) => 
    Term<PLam<RetT, PLam<RetT, PLam<RetT , RetT >>>>
    & {
        caseList: CaseListFn<RetT>,
        $: CaseListFn<RetT>
    }
export type CaseConstrFn<RetT extends PType> = ( constrCase: PappArg< RetT > ) =>
    Term<PLam<RetT, PLam<RetT, PLam<RetT, PLam<RetT , RetT >>>>>
    & {
        caseMap: CaseMapFn<RetT>,
        $: CaseMapFn<RetT>
    }

/*
@fixme implement a recursive utility function to

automatically add delays to all alrguments except the first;
add aliases for the applications except the first;
force the last application (once provided argument and delayed)
*/
export function pchooseData<ReturnT extends TermType>( returnT: ReturnT )
    : Term< PLam< PData, PLam< ToPType<ReturnT>, PLam<ToPType<ReturnT>, PLam<ToPType<ReturnT>, PLam<ToPType<ReturnT>, PLam<ToPType<ReturnT> , ToPType<ReturnT> >>>>>>>
    & {
        $: ( pdata: PappArg<PData> ) =>
            Term<PLam< ToPType<ReturnT>, PLam<ToPType<ReturnT>, PLam<ToPType<ReturnT>, PLam<ToPType<ReturnT>, PLam<ToPType<ReturnT> , ToPType<ReturnT> >>>>>>
            & {
                caseConstr: CaseConstrFn<ToPType<ReturnT>>,
                $: CaseConstrFn<ToPType<ReturnT>>
            }
    }
{
    // new term identical to the strict one in order to define new (different) "$" properties
    const _chooseData  = new Term<
        PLam<
            PData,
            PLam<
                ToPType<ReturnT>,
                PLam<
                    ToPType<ReturnT>,
                    PLam<
                        ToPType<ReturnT>,
                        PLam<
                            ToPType<ReturnT>,
                            PLam<
                                ToPType<ReturnT>,
                                ToPType<ReturnT>
                            >
                        >
                    >
                >
            >
        >
    >(
        Type.Fn(
            [ Type.Data.Any, Type.Delayed( returnT ), Type.Delayed( returnT ), Type.Delayed( returnT ), Type.Delayed( returnT ), Type.Delayed( returnT ) ], Type.Delayed( returnT )
        ),
        _dbn => Builtin.chooseData
    );

    return ObjectUtils.defineReadOnlyProperty(
        _chooseData,
        "$",
        ( data: Term<PData> ): Term<PLam< ToPType<ReturnT>, PLam<ToPType<ReturnT>, PLam<ToPType<ReturnT>, PLam<ToPType<ReturnT>, PLam<ToPType<ReturnT> , ToPType<ReturnT> >>>>>>
            & {
                caseConstr: CaseConstrFn<ToPType<ReturnT>>,
                $: CaseConstrFn<ToPType<ReturnT>>
            } => {
            // @ts-ignore Type instantiation is excessively deep and possibly infinite.
            const _cDWithData = papp( _chooseData, data );

            const _cDWithDataApp = ObjectUtils.defineReadOnlyProperty(
                _cDWithData,
                "$",
                ( caseConstr: Term<ToPType<ReturnT>> ) => {
                    const _cDDWithConstr = papp( _cDWithData, pdelay(caseConstr) as any );

                    const _cDDWithConstrApp = ObjectUtils.defineReadOnlyProperty(
                        _cDDWithConstr,
                        "$",
                        ( mapCase: Term< ToPType<ReturnT> > ) => {
                            const _cDDCWithMap = papp( _cDDWithConstr, pdelay( mapCase ) as any );

                            const _cDDCWithMapApp = ObjectUtils.defineReadOnlyProperty(
                                _cDDCWithMap,
                                "$",
                                ( listCase: Term< ToPType<ReturnT> > ) => {
                                    const _cDDCMWithList = papp( _cDDCWithMap, pdelay( listCase ) as any );

                                    const _cDDCMWithListApp = ObjectUtils.defineReadOnlyProperty(
                                        _cDDCMWithList,
                                        "$",
                                        ( iCase: Term<ToPType<ReturnT>> ) => {
                                            const _cDDCMLWithInt = papp( _cDDCMWithList, pdelay( iCase ) as any );

                                            const _cDDCMLWithIntApp = ObjectUtils.defineReadOnlyProperty(
                                                _cDDCMLWithInt,
                                                "$",
                                                ( bCase: Term<ToPType<ReturnT>> ) : Term<ToPType<ReturnT>> => {
                                                    return pforce(
                                                        papp( _cDDCMLWithInt, pdelay( bCase ) as any )
                                                    ) as any;
                                                }
                                            );

                                            return ObjectUtils.defineReadOnlyProperty(
                                                _cDDCMLWithIntApp,
                                                "caseB",
                                                _cDDCMLWithIntApp.$
                                            );
                                        }
                                    )

                                    return ObjectUtils.defineReadOnlyProperty(
                                        _cDDCMWithListApp,
                                        "caseI",
                                        _cDDCMWithListApp.$
                                    );
                                }
                            )

                            return ObjectUtils.defineReadOnlyProperty(
                                _cDDCWithMapApp,
                                "caseList",
                                _cDDCWithMapApp.$
                            );

                        }
                    )

                    return ObjectUtils.defineReadOnlyProperty(
                        _cDDWithConstrApp,
                        "caseMap",
                        _cDDWithConstrApp.$
                    );
                }
            );

            return ObjectUtils.defineReadOnlyProperty(
                _cDWithDataApp,
                "caseConstr",
                _cDWithDataApp.$
            ) as any;
        }
    ) as any;
}

export const pConstrToData:
    TermFn<[ PInt, PList<PData> ], PDataConstr>
    = addApplications<[ PInt, PList<PData> ], PDataConstr>(
        new Term(
            Type.Fn([ Type.Int, Type.List( Type.Data.Any ) ], Type.Data.Constr ),
            _dbn => Builtin.constrData
        )
    );

type PMap<K extends PType, V extends PType> = PList<PPair<K,V>>

export function pMapToData<DataKey extends DataType, DataVal extends DataType>
    ( keyDataT: DataKey, valDataT: DataVal )
    : TermFn<[ PMap<ToPDataType<DataKey>, ToPDataType<DataVal>> ], PDataMap<ToPDataType<DataKey>, ToPDataType<DataVal>>>
{
    return addApplications<[ PList<PPair<ToPDataType<DataKey>, ToPDataType<DataVal>>> ], PDataMap<ToPDataType<DataKey>, ToPDataType<DataVal>> >(
        new Term(
            Type.Lambda(
                Type.Map( keyDataT, valDataT ),// keyDataT and valDataT are already as "Data" Types
                Type.Data.Map( keyDataT, valDataT )
            ),
            _dbn => Builtin.mapData
        )
    );
}

export function pListToData<DataListElemT extends DataType>
    ( dataListElemT: DataListElemT )
    : TermFn<[ PList<ToPDataType<DataListElemT>> ], PDataList<ToPDataType<DataListElemT>> >
{
    return addApplications<[ PList<ToPDataType<DataListElemT>> ], PDataList<ToPDataType<DataListElemT>>>(
        new Term(
            Type.Lambda( Type.List( dataListElemT ), Type.Data.List( dataListElemT ) ),
            _dbn => Builtin.listData
        )
    );
} 

export const pIntToData: TermFn<[ PInt ], PDataInt > 
    = addApplications<[ PInt ], PData >(
        new Term<PLam<PInt, PData >>(
            Type.Lambda( Type.Int, Type.Data.Int ),
            _dbn => Builtin.iData
        )
    );

export const pBSToData: TermFn<[ PByteString ], PDataBS > 
    = addApplications<[ PByteString ], PDataBS >(
        new Term<PLam<PByteString, PDataBS >>(
            Type.Lambda( Type.BS, Type.Data.BS ),
            _dbn => Builtin.bData
        )
    );

export const punConstrData
    : TermFn<[ PDataConstr ], PPair<PInt, PList<PData>>>
    = addApplications<[ PDataConstr ], PPair<PInt, PList<PData>>>(
        new Term(
            Type.Lambda( Type.Data.Any, Type.Pair( Type.Int, Type.List( Type.Data.Any ))), // @fixme @todo keep track of the data types in ```Type.List( Type.Data.Any )```
            _dbn => Builtin.unConstrData
        )
    );

export function punMapData<DataK extends DataType, DataV extends DataType>
    ( keyDataT: DataK, valDataT: DataV )
    : TermFn<[ PDataMap<ToPDataType<DataK>, ToPDataType<DataV>> ], PList<PPair<ToPDataType<DataK>, ToPDataType<DataV>>>>
{
    return addApplications<[ PDataMap<ToPDataType<DataK>, ToPDataType<DataV>> ], PList<PPair<ToPDataType<DataK>, ToPDataType<DataV>>>>(
        new Term(
            Type.Lambda( Type.Data.Any, Type.List( Type.PairAsData( keyDataT, valDataT ) ) ),
            _dbn => Builtin.unMapData
        )
    );

}

export function punListData<DataElemT extends DataType>( dataElemT: DataElemT ): TermFn<[ PDataList<ToPDataType<DataElemT>> ], PList<ToPDataType<DataElemT>>>
{
    return addApplications<[ PDataList<ToPDataType<DataElemT>> ], PList<ToPDataType<DataElemT>>>(
        new Term(
            Type.Lambda( Type.Data.Any, Type.List( dataElemT ) ),
            _dbn => Builtin.unListData
        )
    );
}

export const punIData: TermFn<[ PDataInt ], PInt>
    = addApplications<[ PDataInt ], PInt>(
        new Term(
            Type.Lambda( Type.Data.Any, Type.Int ),
            _dbn => Builtin.unIData,
        )
        //, addPIntMethods
    );

export const punBData: Term<PLam<PDataBS, PByteString>>
& {
    $: ( dataBS: PappArg<PDataBS> ) => TermBS
} = (() => {
    const unBData = new Term<PLam<PDataBS, PByteString>>(
        Type.Lambda( Type.Data.Any, Type.BS ),
        _dbn => Builtin.unBData
    );

    return ObjectUtils.defineReadOnlyProperty(
        unBData,
        "$",
        ( dataBS: Term<PDataBS> ): TermBS =>
            addPByteStringMethods( papp( unBData, dataBS ) )
    );
})()

export const peqData: TermFn<[ PData, PData ], PBool >
    = addApplications<[ PData, PData ], PBool >(
        new Term<PLam<PData, PLam< PData, PBool > >>(
            Type.Fn([ Type.Data.Any, Type.Data.Any ], Type.Bool ),
            _dbn => Builtin.equalsData
        )
    );

export function ppairData<DataFst extends DataType, DataSnd extends DataType>( dataFst: DataFst, dataSnd: DataSnd):
    TermFn<[ ToPDataType<DataFst>, ToPDataType<DataSnd> ], PPair<ToPDataType<DataFst>,ToPDataType<DataSnd>>>
{
    return addApplications<[ ToPDataType<DataFst>,ToPDataType<DataSnd> ], PPair<ToPDataType<DataFst>,ToPDataType<DataSnd>> >(
        new Term<PLam<ToPDataType<DataFst>, PLam< ToPDataType<DataSnd>, PPair<ToPDataType<DataFst>,ToPDataType<DataSnd>> > >>(
            Type.Fn([ dataFst, dataSnd ], Type.Data.Pair( dataFst, dataSnd )),
            _dbn => Builtin.mkPairData
        )
    );
}

export const pnilData: Term<PList< PData > >
    = phoist( new Term(
        Type.List( Type.Data.Any ),
        _dbn => new Application( Builtin.mkNilData, UPLCConst.unit )
    ));

export const pnilPairData: Term<PList< PPair<PData, PData>>>
    = phoist( new Term(
        Type.List( Type.Pair( Type.Data.Any, Type.Data.Any ) ),
        _dbn => new Application( Builtin.mkNilPairData, UPLCConst.unit )
    ));


// --------------------------------------------------------------------------------------------------------------------- //
// ----------------------------------------------- [ VASIL (Plutus V2) ] ----------------------------------------------- //
// --------------------------------------------------------------------------------------------------------------------- //

export const pserialiseData: TermFn<[ PData ], PByteString >
    = addApplications<[ PData ], PByteString >(
        new Term(
            Type.Lambda( Type.Data.Any, Type.BS ),
            _dbn => Builtin.serialiseData
        )
    );

/**
 * performs elliptic curve digital signature verification (ANSI [2005, 2020], Johnson and Menezes)
 * over the secp256k1 curve (see Certicom Research [2010], §2.4.1) and conforms to the interface described in
 * Note 5 of Section A.2. The arguments must have the following sizes:
 * • 𝑘: 64 bytes
 * • 𝑚: 32 bytes
 * • 𝑠: 64 bytes.
 * The ECDSA scheme admits two distinct valid signatures for a given message and private key. We follow
 * the restriction imposed by Bitcoin (see Lau and Wuilie [2016], LOW_S) and only accept the smaller
 * signature: verifyEcdsaSecp256k1Signature will return false if the larger one is supplied.
 * 
 * @param {PByteString} key ```PByteString``` of length 32 ( ```PubKeyHash``` )
 * @param {PByteString} message ```PByteString``` of length 32
 * @param {PByteString} signature ```PByteString``` of length 64
 * @returns {PBool} 
 * 
 * @throws
 * @fails
 */
export const pverifySecp256k1ECDSA: TermFn<[ PByteString, PByteString, PByteString ], PBool > =
    addApplications<[ PByteString, PByteString, PByteString ], PBool >(
        new Term(
            Type.Fn([ Type.BS, Type.BS, Type.BS ], Type.Bool),
            _dbn => Builtin.verifyEcdsaSecp256k1Signature
        )
    );

/**
 * performs verification of Schnorr signatures ( Schnorr [1989], Lau et al. [2020]) over the secp256k1 curve
 * 
 * @param {PByteString} key ```PByteString``` of length 64
 * @param {PByteString} message abitrary length ```PByteString```
 * @param {PByteString} signature ```PByteString``` of length 64
 * @returns {PBool} 
 * 
 * @throws
 * @fails
 */
export const pverifySecp256k1Schnorr: TermFn<[ PByteString, PByteString, PByteString ], PBool > =
    addApplications<[ PByteString, PByteString, PByteString ], PBool >(
        new Term(
            Type.Fn([ Type.BS, Type.BS, Type.BS ], Type.Bool),
            _dbn => Builtin.verifySchnorrSecp256k1Signature
        )
    );

// --------------------------------------------------------------------------------------------------------------------- //
// ---------------------------------------------------- [ hoisted ] ---------------------------------------------------- //
// --------------------------------------------------------------------------------------------------------------------- //

export function pid<TermT extends TermType>( termT: TermT ): TermFn<[ ToPType<TermT> ], ToPType<TermT>>
{
    const idTerm = new Term<PLam<ToPType<TermT>,ToPType<TermT>>>(
        lam( termT, termT ),
        _dbn => new Lambda( new UPLCVar(0) )
    );
    return phoist(
        ObjectUtils.defineReadOnlyProperty(
            idTerm,
            "$",
            ( whatever: Term<ToPType<TermT>> ) => papp( idTerm, whatever )
        )
    ) as any;
}