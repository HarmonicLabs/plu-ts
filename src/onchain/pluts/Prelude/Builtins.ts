import BasePlutsError from "../../../errors/BasePlutsError";
import Pair from "../../../types/structs/Pair";
import ObjectUtils from "../../../utils/ObjectUtils";
import { Head, ReturnT, Tail } from "../../../utils/ts";
import Application from "../../UPLC/UPLCTerms/Application";
import Builtin from "../../UPLC/UPLCTerms/Builtin";
import Lambda from "../../UPLC/UPLCTerms/Lambda";
import UPLCConst from "../../UPLC/UPLCTerms/UPLCConst";
import UPLCVar from "../../UPLC/UPLCTerms/UPLCVar";
import PType, { ToCtors } from "../PType";
import PBool, { pBool } from "../PTypes/PBool";
import PByteString from "../PTypes/PByteString";
import PData from "../PTypes/PData";
import PDataBS from "../PTypes/PData/PDataBS";
import PDataConstr from "../PTypes/PData/PDataConstr";
import PDataInt from "../PTypes/PData/PDataInt";
import PDataList from "../PTypes/PData/PDataList";
import PDataMap from "../PTypes/PData/PDataMap";
import PDelayed from "../PTypes/PDelayed";
import PFn from "../PTypes/PFn";
import PLam, { TermFn } from "../PTypes/PFn/PLam";
import PInt from "../PTypes/PInt";
import PList from "../PTypes/PList";
import PPair, { PMap } from "../PTypes/PPair";
import PString from "../PTypes/PString";
import PUnit from "../PTypes/PUnit";
import { papp, pdelay, pfn, pforce, plam } from "../Syntax";
import Term from "../Term";
import phoist, { HoistedTerm } from "../Term/HoistedTerm";
import Type from "../Term/Type";
import TermBool, { addPBoolMethods } from "./TermBool";
import TermBS, { addPByteStringMethods } from "./TermBS";
import TermInt, { addPIntMethods } from "./TermInt";
import TermStr, { addPStringMethods } from "./TermStr";

function addApplications<Ins extends [ PType, ...PType[] ], Out extends PType, TermOutput extends TermFn< Ins, Out > = TermFn< Ins, Out >>
    (
        lambdaTerm: Term< PFn< Ins, Out > >,
        types: ToCtors<[ ...Ins, Out ]>,
        addOutputMethods?: ( termOut: Term<Out> ) => TermOutput
    )
    : TermOutput
{
    const inTysLength = types.length - 1;

    if( inTysLength <= 1 )
    {
        return ObjectUtils.defineReadOnlyProperty(
            lambdaTerm,
            "$",
            ( input: Term< Head<Ins> > ) => {
                let output: any = papp( lambdaTerm, input );

                if( addOutputMethods !== undefined )
                {
                    output = addOutputMethods( output );
                }

                return output;
            }
        ) as any;
    }

    return ObjectUtils.defineReadOnlyProperty(
        lambdaTerm,
        "$",
        ( input: Term< Head<Ins> > ) =>
            // @ts-ignore
            // Type 'PType[]' is not assignable to type '[PType, ...PType[]]'.
            // Source provides no match for required element at position 0 in target
            addApplications< Tail<Ins>, Out >(
                papp( lambdaTerm , input ) as any,
                types.slice( 1 ),
                addOutputMethods
            )
    ) as any;
}

type MultiPLam<Args extends [ PType, PType, ...PType[] ]> =
    Args extends [ infer PA extends PType, infer PB extends PType ] ? PLam<PA,PB> :
    Args extends [ infer PA extends PType, infer PB extends PType , infer PC extends PType ] ? PLam<PA,PLam<PB, PC> > :
    Args extends [ infer PA extends PType, ...infer Ps extends [ PType, PType,...PType[] ] ] ? PLam<PA, MultiPLam<Ps> > :
    never

function makePLamObj<A extends PType,B extends PType, Cs extends PType[]>
    ( a: A, b: B, ...ptypes: Cs ): MultiPLam<[A,B,...Cs]>
{
    if( ptypes.length === 0 ) return new PLam( a, b ) as any;
    return new PLam( a, makePLamObj( b , ptypes[0] , ...ptypes.slice(1) ) ) as MultiPLam<[A, B, ...Cs]>;
}

type IntBinOPToInt = Term< PLam< PInt, PLam< PInt, PInt >>>
& {
    $: ( input: Term<PInt> ) => 
        Term<PLam<PInt,PInt>>
        & {
            $: ( input: Term<PInt> ) => 
                TermInt
        }
}

function intBinOpToInt( builtin: Builtin )
    : IntBinOPToInt
{
    const op = new Term(
        Type.Fn([ Type.Int, Type.Int ], Type.Int ),
        _dbn => builtin
    );

    return  ObjectUtils.defineReadOnlyProperty(
        op,
        "$",
        ( fstIn: Term<PInt> ): Term<PLam<PInt, PInt>> => {
            const oneIn = papp( op, fstIn );

            return ObjectUtils.defineReadOnlyProperty(
                oneIn,
                "$",
                ( sndIn: Term<PInt> ): TermInt => {
                    return addPIntMethods( papp( PInt )( oneIn as any, sndIn ) )
                }
            ) as any;
        }
    ) as any;
}

type IntBinOPToBool = Term< PLam< PInt, PLam< PInt, PInt >>>
& {
    $: ( input: Term<PInt> ) => 
        Term<PLam<PInt,PInt>>
        & {
            $: ( input: Term<PInt> ) => 
                TermBool
        }
}

function intBinOpToBool( builtin: Builtin )
    : IntBinOPToBool
{
    const op = new Term(
        _dbn => builtin,
        new PLam( new PInt , new PLam( new PInt , new PBool ) )
    );

    return  ObjectUtils.defineReadOnlyProperty(
        op,
        "$",
        ( fstIn: Term<PInt> ): Term<PLam<PInt, PInt>> => {
            const oneIn = papp( PLam )( op, fstIn );

            return ObjectUtils.defineReadOnlyProperty(
                oneIn,
                "$",
                ( sndIn: Term<PInt> ): TermBool => {
                    return addPBoolMethods( papp( PBool )( oneIn as any, sndIn ) )
                }
            ) as any;
        }
    ) as any;
}

/**
 * @deprecated use 'byteStrBinOpTo<Output>'
*/
function byteStringBinOp<Out extends PType>( builtin: Builtin, out: new () => Out ): TermFn<[ PByteString, PByteString ], Out >
{
    return addApplications<[ PByteString, PByteString ], Out>(
        new Term(
            _dbn => builtin,
            new PLam( new PByteString , new PLam( new PByteString , new out ) )
        ), [ PByteString, PByteString, out ]
    );
}

type ByteStrBinOPToBS = Term< PLam< PByteString, PLam< PByteString, PByteString >>>
& {
    $: ( input: Term<PByteString> ) => 
        Term<PLam<PByteString,PByteString>>
        & {
            $: ( input: Term<PByteString> ) => 
                TermBS
        }
}

function byteStrBinOpToBS( builtin: Builtin )
    : ByteStrBinOPToBS
{
    const op = new Term(
        _dbn => builtin,
        new PLam( new PByteString , new PLam( new PByteString , new PByteString ) )
    );

    return  ObjectUtils.defineReadOnlyProperty(
        op,
        "$",
        ( fstIn: Term<PByteString> ): Term<PLam<PByteString, PByteString>> => {
            const oneIn = papp( PLam )( op, fstIn );

            return ObjectUtils.defineReadOnlyProperty(
                oneIn,
                "$",
                ( sndIn: Term<PByteString> ): TermBS => {
                    return addPByteStringMethods( papp( PByteString )( oneIn as any, sndIn ) )
                }
            ) as any;
        }
    ) as any;
}

type ByteStrBinOPToBool = Term< PLam< PByteString, PLam< PByteString, PBool >>>
& {
    $: ( input: Term<PByteString> ) => 
        Term<PLam<PByteString,PBool>>
        & {
            $: ( input: Term<PByteString> ) => 
                TermBool
        }
}

function byteStrBinOpToBool( builtin: Builtin )
    : ByteStrBinOPToBool
{
    const op = new Term(
        _dbn => builtin,
        new PLam( new PByteString , new PLam( new PByteString , new PBool ) )
    );

    return  ObjectUtils.defineReadOnlyProperty(
        op,
        "$",
        ( fstIn: Term<PByteString> ): Term<PLam<PByteString, PBool>> => {
            const oneIn = papp( PLam )( op, fstIn );

            return ObjectUtils.defineReadOnlyProperty(
                oneIn,
                "$",
                ( sndIn: Term<PByteString> ): TermBool => {
                    return addPBoolMethods( papp( PBool )( oneIn as any, sndIn ) )
                }
            ) as any;
        }
    ) as any;
}

export function pflip< A extends PType, B extends PType, ReturnT extends PType>
    ( aCtor: new () => A, bCtor: new () => B, returnCtor: new () => ReturnT )
        : TermFn<[ PFn<[ A, B ], ReturnT > ], PFn<[ B, A ], ReturnT>>
        & {
            $: ( toBeFlipped: TermFn<[A, B], ReturnT> ) => TermFn<[ B, A ], ReturnT>
        }
{
    return phoist(
        plam<PFn<[ A, B ], ReturnT >, PFn<[ B, A ], ReturnT >>( PLam, PLam )
        (( toBeFlipped: Term<PFn<[ A, B ], ReturnT>>): TermFn<[ B, A ], ReturnT> => {
            return new Term(
                dbn => new Lambda( // b
                    new Lambda( // a
                        new Application(
                            new Application(
                                toBeFlipped.toUPLC(dbn + BigInt( 2 )),
                                new UPLCVar( 0 ) // a
                            ),
                            new UPLCVar( 1 ) // b
                        )
                    )
                ),
                new PLam( new bCtor, new PLam( new aCtor, new returnCtor ) )
            ) as any
        })
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

export const pgreaterInt: IntBinOPToBool =
    phoist(
        pfn<[ PInt , PInt ], PBool>( PInt, PInt, PBool )(
            ( a: Term<PInt>, b: Term<PInt> ): TermBool => plessInt.$( b ).$( a )
        )
    ) as any;

export const pgreaterEqInt: IntBinOPToBool =
    phoist(
        pfn<[ PInt , PInt ], PBool>( PInt, PInt, PBool )(
            ( a: Term<PInt>, b: Term<PInt> ): TermBool => plessEqInt.$( b ).$( a )
        )
    ) as any;

export const pappendBs = byteStrBinOpToBS( Builtin.appendByteString );
export const pconsBs: Term<PLam<PInt, PLam< PByteString, PByteString>>>
& {
    $: ( input: Term<PInt> ) => 
        Term<PLam<PByteString,PByteString>>
        & {
            $: ( input: Term<PByteString> ) => 
                TermBS
        }
} = (() => {
    const consByteString = new Term(
        _dbn => Builtin.consByteString,
        new PLam( new PInt , new PLam( new PByteString , new PByteString ) )
    );

    return  ObjectUtils.defineReadOnlyProperty(
        consByteString,
        "$",
        ( byte: Term<PInt> ): Term<PLam<PByteString, PByteString>> => {
            const consByteStringFixedByte = papp( PLam )( consByteString, byte );

            return ObjectUtils.defineReadOnlyProperty(
                consByteStringFixedByte,
                "$",
                ( toByteString: Term<PByteString> ): TermBS => {
                    return addPByteStringMethods( papp( PByteString )( consByteStringFixedByte as any, toByteString ) )
                }
            ) as any;
        }
    ) as any;
})()

export const psliceBs: Term<PLam<PInt, PLam< PInt, PLam< PByteString, PByteString>>>>
& {
    $: ( fromIndex: Term<PInt> ) => 
        Term<PLam< PInt, PLam<PByteString,PByteString>>>
        & {
            $: ( ofLength: Term<PInt> ) => 
                Term<PLam<PByteString,PByteString>>
                & {
                    $: ( onByteString: Term<PByteString> ) => TermBS
                }
        }
} = (() => {
    const sliceBs = new Term(
        _dbn => Builtin.sliceByteString,
        new PLam( new PInt , new PLam( new PInt , new PLam( new PByteString, new PByteString ) ) )
    );

    return ObjectUtils.defineReadOnlyProperty(
        sliceBs,
        "$",
        ( fromIndex: Term<PInt> ): Term<PLam< PInt, PLam<PByteString,PByteString>>>
        & {
            $: ( ofLength: Term<PInt> ) => 
                Term<PLam<PByteString,PByteString>>
                & {
                    $: ( onByteString: Term<PByteString> ) => TermBS
                }
        } =>{
            const sliceBsFromIdx = papp( PLam )( sliceBs, fromIndex );
            
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
                    const sliceBsFromIdxOfLength = papp( PLam )( sliceBsFromIdx as any, ofLength );

                    return ObjectUtils.defineReadOnlyProperty(
                        sliceBsFromIdxOfLength,
                        "$",
                        ( onByteString: Term<PByteString> ): TermBS =>
                            addPByteStringMethods( papp( PByteString )( sliceBsFromIdxOfLength as any, onByteString ) )
                    ) as any
                }
            ) as any
        }
    )
})();

export const plengthBs
    :TermFn<[ PByteString ], PInt >
    & {
        $: ( ofByteString: Term<PByteString> ) => TermInt
    }
    = (() => {
        const lenBS = new Term(
            _dbn => Builtin.lengthOfByteString,
            new PLam( new PByteString, new PInt )
        );

        return ObjectUtils.defineReadOnlyProperty(
            lenBS,
            "$",
            ( ofByteString: Term<PByteString> ): TermInt =>
                addPIntMethods( papp( PInt )( lenBS, ofByteString ) )
        );
    })();

export const pindexBs
    : Term<PLam<PByteString, PLam<PInt , PInt>>>
    & {
        $: ( ofByteString: Term<PByteString> ) =>
            Term<PLam<PInt, PInt>>
            & {
                $: ( index: Term<PInt> ) => TermInt
            }
    }
    = (() => {
        const idxBS = new Term(
                _dbn => Builtin.indexByteString,
                new PLam( new PByteString, new PLam( new PInt, new PInt ) )
            );
        
        return ObjectUtils.defineReadOnlyProperty(
            idxBS,
            "$",
            ( ofByteString: Term<PByteString> ):
                Term<PLam<PInt, PInt>>
                & {
                    $: ( index: Term<PInt> ) => TermInt
                } =>
            {
                const idxOfBS = papp( PLam )( idxBS, ofByteString );

                return ObjectUtils.defineReadOnlyProperty(
                    idxOfBS,
                    "$",
                    ( index: Term<PInt> ): TermInt =>
                        addPIntMethods( papp( PInt )( idxOfBS as any, index ) )
                ) as any;
            }
        )
    })();

export const peqBs      = byteStrBinOpToBool( Builtin.equalsByteString );
export const plessBs    = byteStrBinOpToBool( Builtin.lessThanByteString );
export const plessEqBs  = byteStrBinOpToBool( Builtin.lessThanEqualsByteString );

export const pgreaterBS: ByteStrBinOPToBool =
    phoist(
        pfn<[ PByteString , PByteString ], PBool>( PByteString, PByteString, PBool )(
            ( a: Term<PByteString>, b: Term<PByteString> ): TermBool => plessBs.$( b ).$( a )
        )
    ) as any;

export const pgreaterEqBS: ByteStrBinOPToBool =
    phoist(
        pfn<[ PByteString , PByteString ], PBool>( PByteString, PByteString, PBool )(
            ( a: Term<PByteString>, b: Term<PByteString> ): TermBool => plessEqBs.$( b ).$( a )
        )
    ) as any;

export const psha2_256: TermFn<[ PByteString ], PByteString > =
    addApplications<[ PByteString ], PByteString >(
        new Term(
            _dbn => Builtin.sha2_256,
            new PLam( new PByteString , new PByteString )
        ),
        [ PByteString, PByteString ]
    );
export const psha3_256: TermFn<[ PByteString ], PByteString > =
    addApplications<[ PByteString ], PByteString >(
        new Term(
            _dbn => Builtin.sha3_256,
            new PLam( new PByteString , new PByteString )
        ),
        [ PByteString, PByteString ]
    );
export const pblake2b_256: TermFn<[ PByteString ], PByteString > =
    addApplications<[ PByteString ], PByteString >(
        new Term(
            _dbn => Builtin.blake2b_256,
            new PLam( new PByteString , new PByteString )
        ),
        [ PByteString, PByteString ]
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
            _dbn => Builtin.verifyEd25519Signature,
            new PLam( new PByteString , new PLam( new PByteString , new PLam( new PByteString , new PBool ) ) )
        ),
        [ PByteString, PByteString, PByteString, PBool ]
    );



type StrBinOPToStr = Term< PLam< PString, PLam< PString, PString >>>
& {
    $: ( input: Term<PString> ) => 
        Term<PLam<PString,PString>>
        & {
            $: ( input: Term<PString> ) => 
                TermStr
        }
}

export const pappendStr: StrBinOPToStr = (() => {
    const op = new Term(
        _dbn => Builtin.appendString,
        new PLam( new PString , new PLam( new PString , new PString ) )
    );

    return  ObjectUtils.defineReadOnlyProperty(
        op,
        "$",
        ( fstIn: Term<PString> ): Term<PLam<PString, PString>> => {
            const oneIn = papp( PLam )( op, fstIn );

            return ObjectUtils.defineReadOnlyProperty(
                oneIn,
                "$",
                ( sndIn: Term<PString> ): TermStr => {
                    return addPStringMethods( papp( PString )( oneIn as any, sndIn ) )
                }
            ) as any;
        }
    ) as any;
})();

type StrBinOPToBool = Term< PLam< PString, PLam< PString, PBool >>>
& {
    $: ( input: Term<PString> ) => 
        Term<PLam<PString,PBool>>
        & {
            $: ( input: Term<PString> ) => 
                TermBool
        }
}
export const peqStr: StrBinOPToBool = (() => {
    const op = new Term(
        _dbn => Builtin.equalsString,
        new PLam( new PString , new PLam( new PString , new PBool ) )
    );

    return  ObjectUtils.defineReadOnlyProperty(
        op,
        "$",
        ( fstIn: Term<PString> ): Term<PLam<PString, PBool>> => {
            const oneIn = papp( PLam )( op, fstIn );

            return ObjectUtils.defineReadOnlyProperty(
                oneIn,
                "$",
                ( sndIn: Term<PString> ): TermBool => {
                    return addPBoolMethods( papp( PBool )( oneIn as any, sndIn ) )
                }
            ) as any;
        }
    ) as any;
})();

export const pencodeUtf8: Term<PLam<PString, PByteString>>
& {
    $: ( str: Term<PString> ) => TermBS
} = (() => {
    const encodeUtf8  =new Term(
            _dbn => Builtin.encodeUtf8,
            new PLam( new PString, new PByteString )
        );

    return ObjectUtils.defineReadOnlyProperty(
        encodeUtf8,
        "$",
        ( str: Term<PString> ): TermBS => addPByteStringMethods( papp( PByteString )( encodeUtf8 as any, str ) )
    )
})()

export const pdecodeUtf8: Term<PLam<PByteString, PString>>
& {
    $: ( str: Term<PByteString> ) => TermStr
} = (() => {
    const decodeUtf8  =new Term(
            _dbn => Builtin.decodeUtf8,
            new PLam( new PByteString, new PString )
        );

    return ObjectUtils.defineReadOnlyProperty(
        decodeUtf8,
        "$",
        ( byteStr: Term<PByteString> ): TermStr => addPStringMethods( papp( PString )( decodeUtf8 as any, byteStr ) )
    )
})()


export function pstrictIf<ReturnT extends PType>( returnT: new () => ReturnT ): TermFn<[ PBool, ReturnT, ReturnT ], ReturnT>
{
    return addApplications<[ PBool, ReturnT, ReturnT ], ReturnT>(
        new Term(
            _dbn => Builtin.ifThenElse,
            new PLam( new PBool, new PLam( new returnT, new PLam( new returnT, new returnT ) ) )
        ),
        [ PBool, returnT, returnT, returnT ]
    );
}

export function pif<ReturnT extends PType>( returnT: new () => ReturnT = PType as any )
    : Term<PLam<PBool, PLam<ReturnT, PLam<ReturnT, ReturnT>>>> 
    & {
        $: (condition: Term<PBool>) =>
            Term<PLam< ReturnT, PLam< ReturnT, ReturnT>>> 
            & {
                then: ( caseTrue: Term<ReturnT> ) =>
                    TermFn<[ ReturnT ], ReturnT >
                    & {
                        else: ( caseTrue: Term<ReturnT> ) =>
                        Term<ReturnT> 
                    },
                $: ( caseTrue: Term<ReturnT> ) =>
                    TermFn<[ ReturnT ], ReturnT > & {
                        else: ( caseTrue: Term<ReturnT> ) =>
                        Term<ReturnT> 
                    }
            }
    }
{
    // new term identical to the strict one in order to define new (different) "$" properties
    const _lambdaIf = new Term(
        _dbn => Builtin.ifThenElse,
        new PLam( new PBool, new PLam( new returnT, new PLam( new returnT, new returnT ) ) )
    );

    return ObjectUtils.defineReadOnlyProperty(
        _lambdaIf,
        "$",
        ( condition: Term< PBool > ): TermFn<[ ReturnT, ReturnT ], ReturnT > => (() => {
            
            /*
            [ (builtin ifThenElse) condition ]
            */
            const _lambdaIfThen = papp( PLam )( _lambdaIf, condition ) as TermFn<[ ReturnT, ReturnT ], ReturnT >;

            const _lambdaIfThenApp = ObjectUtils.defineReadOnlyProperty(
                _lambdaIfThen,
                "$",
                //@ts-ignore
                ( caseTrue: Term<ReturnT> ): TermFn<[ ReturnT ],ReturnT> => (() => {
                    /*
                    [
                        [ (builtin ifThenElse) condition ]
                        (delay case true)
                    ]
                    */
                    const _lambdaIfThenElse = papp( PLam )( _lambdaIfThen, pdelay( returnT )( caseTrue ) ) as Term<PLam<PType, PDelayed<ReturnT>>>;

                    const _lambdaIfThenElseApp = ObjectUtils.defineReadOnlyProperty(
                        _lambdaIfThenElse,
                        "$",
                        ( caseFalse: Term<ReturnT> ): Term< ReturnT > =>
                            /*
                            (force [
                                [
                                    [ (builtin ifThenElse) condition ]
                                    (delay caseTrue)
                                ]
                                (delay caseFalse)
                            ])
                            */
                            pforce( returnT )( papp( PDelayed as new () => PDelayed<ReturnT> )( _lambdaIfThenElse, pdelay( returnT )( caseFalse ) ) )
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
        })()
    ) as any;
}

export const pnot
    : Term<PLam<PBool, PBool>>
    & {
        $: ( bool: Term<PBool> ) => TermBool
    }
    =
    phoist(
        plam( PBool, PBool )
        ( bool => 
            addPBoolMethods(
                pstrictIf( PBool ).$( bool )
                .$( pBool( false ) )
                .$( pBool( true  ) )
            )
        )
    ) as any;

export const pand
    : Term<PLam<PBool, PLam<PBool, PBool>>>
    & {
        $: ( bool: Term<PBool> ) =>
            Term<PLam<PBool, PBool>>
            & {
                $: ( bool: Term<PBool> ) => TermBool
            }
    }
    = phoist(
        pfn<[ PBool, PBool ], PBool >( PBool, PBool, PBool )
        (( a: Term<PBool>, b: Term<PBool> ) =>
            addPBoolMethods(
                pforce( PBool )(
                    pstrictIf( PDelayed as new () => PDelayed<PBool> ).$( a )
                    .$( pdelay( PBool )( b ) )
                    .$( pBool( false ) as any )
                )
            )
        )
    ) as any;

export const por
    : Term<PLam<PBool, PLam<PBool, PBool>>>
    & {
        $: ( bool: Term<PBool> ) =>
            Term<PLam<PBool, PBool>>
            & {
                $: ( bool: Term<PBool> ) => TermBool
            }
    }
    = phoist(
        pfn<[ PBool, PBool ], PBool >( PBool, PBool, PBool )
        (( a: Term<PBool>, b: Term<PBool> ) =>
            addPBoolMethods(
                pforce( PBool )(
                    pstrictIf( PDelayed as new () => PDelayed<PBool> ).$( a )
                    .$( pBool( true ) as any )
                    .$( pdelay( PBool )( b ) )
                )
            )
        )
    ) as any;

export function pchooseUnit<ReturnT extends PType>( returnT: new () => ReturnT )
    : TermFn<[ PUnit, ReturnT ], ReturnT >
{
    return addApplications<[ PUnit, ReturnT ], ReturnT >(
        new Term(
            _dbn => Builtin.chooseUnit,
            new PLam( new PUnit, new PLam( new returnT, new returnT ) )
        ),
        [ PUnit, returnT, returnT ]
    );
}

export function ptrace<ReturnT extends PType>( returnT: new () => ReturnT )
    : TermFn<[ PString, ReturnT ], ReturnT >
{
    return addApplications<[ PString, ReturnT ], ReturnT >(
        new Term(
            _dbn => Builtin.trace,
            new PLam( new PString, new PLam( new returnT, new returnT ) )
        ),
        [ PString, returnT, returnT ]
    );
}

export function pfstPair<A extends PType, B extends PType>( a: new () => A, b: new () => B )
    : TermFn<[ PPair<A,B> ], A >
{
    return addApplications<[ PPair<A,B> ], A >(
        new Term(
            _dbn => Builtin.fstPair,
            new PLam( new PPair( new a, new b ), new a )
        ),
        [ PPair, a ]
    );
}

export function psndPair<A extends PType, B extends PType>( a: new () => A, b: new () => B )
    : TermFn<[ PPair<A,B> ], B >
{
    return addApplications<[ PPair<A,B> ], B >(
        new Term(
            _dbn => Builtin.sndPair,
            new PLam( new PPair( new a, new b ), new b )
        ),
        [ PPair, b ]
    );
}

export function pstrictChooseList<ListElemT extends PType, ReturnT extends PType>( listElemT: new () => ListElemT, returnT: new () => ReturnT )
    : TermFn<[ PList< ListElemT > , ReturnT, ReturnT ], ReturnT >
{
    return addApplications<[ PList< ListElemT > , ReturnT, ReturnT ], ReturnT >(
        new Term(
            _dbn => Builtin.chooseList,
            new PLam( new PList( [ new listElemT ] ), new PLam( new returnT, new PLam( new returnT, new returnT ) ) )
        ),
        [ PList, returnT, returnT, returnT ]
    );
}


export function pchooseList<ListElemT extends PType, ReturnT extends PType>( listElemT: new () => ListElemT, returnT: new () => ReturnT )
    : Term<PLam< PList< ListElemT > , PLam<ReturnT, PLam<ReturnT, ReturnT>>>>
    & {
        $: ( list: Term<PList< ListElemT >>) =>
            Term<PLam<ReturnT, PLam<ReturnT, ReturnT>>>
            & {
                caseNil: ( nilCase: Term<ReturnT> ) =>
                    TermFn<[ ReturnT ], ReturnT >
                    & {
                        caseCons: ( consCase: Term<ReturnT> ) =>
                        Term<ReturnT> 
                    },
                $: ( nilCase: Term<ReturnT> ) =>
                    TermFn<[ ReturnT ], ReturnT > & {
                        caseCons: ( consCase: Term<ReturnT> ) =>
                        Term<ReturnT> 
                    }
            }
    }
{
    // new term identical to the strict one in order to define new (different) "$" properties
    const _chooseList = new Term(
        _dbn => Builtin.chooseList,
        new PLam( new PList( [ new listElemT ] ), new PLam( new returnT, new PLam( new returnT, new returnT ) ) )
    );

    return ObjectUtils.defineReadOnlyProperty(
        _chooseList,
        "$",
        ( list: Term<PList<ListElemT>> ) => {

            const _chooseListNil = papp( returnT )( _chooseList as any, list );

            const _chooseListNilApp = ObjectUtils.defineReadOnlyProperty(
                _chooseListNil,
                "$",
                ( nilCase: Term<ReturnT> ) => {

                    const _chooseListNilCons = papp( returnT )( _chooseListNil as any, pdelay( returnT )( nilCase ) ) as any;

                    const _chooseListNilConsApp = ObjectUtils.defineReadOnlyProperty(
                        _chooseListNilCons,
                        "$",
                        ( consCase: Term<ReturnT> ) => {

                            return pforce( returnT )(
                                papp( PDelayed as new () => PDelayed<ReturnT> )(
                                    _chooseListNilCons,
                                    pdelay( returnT )(
                                        consCase
                                    )
                                )
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

export function pprepend< ListElemT extends PType >( listElemT: new () => ListElemT )
    : TermFn<[ ListElemT , PList< ListElemT > ], PList< ListElemT > >
{
    return addApplications<[ ListElemT , PList< ListElemT > ], PList< ListElemT > >(
        new Term(
            _dbn => Builtin.mkCons,
            new PLam( new listElemT , new PLam( new PList( [ new listElemT ] ), new PList( [ new listElemT ] ) ) )
        ),
        [ listElemT, PList, PList ]
    );
}

export function phead< ListElemT extends PType >( listElemT: new () => ListElemT )
    : TermFn<[ PList< ListElemT > ], ListElemT >
{
    return addApplications<[ PList< ListElemT > ], ListElemT >(
        new Term(
            _dbn => Builtin.headList,
            new PLam( new PList( [ new listElemT ] ), new listElemT )
        ),
        [ PList, listElemT ]
    );
}

export function ptail< ListElemT extends PType >( listElemT: new () => ListElemT )
    : TermFn<[ PList< ListElemT > ], PList< ListElemT > >
{
    return addApplications<[ PList< ListElemT > ], PList< ListElemT > >(
        new Term(
            _dbn => Builtin.tailList,
            new PLam( new PList( [ new listElemT ] ), new PList( [ new listElemT ] ) )
        ),
        [ PList, PList ]
    );
}

export function pisEmpty< ListElemT extends PType >( listElemT: new () => ListElemT )
    : TermFn<[ PList< ListElemT > ], PBool >
{
    return addApplications<[ PList< ListElemT > ], PBool >(
        new Term(
            _dbn => Builtin.nullList,
            new PLam( new PList( [ new listElemT ] ), new PBool )
        ),
        [ PList, PBool ]
    );
}

/**
 * in theory 'chooseData' has 5 type parameters (1 per data constructor)
 * and this means any of those types can be returned
 * 
 * plu-ts wont support that in favor of type determinism
 */
export function pstrictChooseData< ReturnT extends PType >( returnT: new () => ReturnT )
    : TermFn<[ PData, ReturnT, ReturnT, ReturnT, ReturnT, ReturnT ], ReturnT >
{
    return addApplications<[ PData, ReturnT, ReturnT, ReturnT, ReturnT, ReturnT ], ReturnT >(
        new Term(
            _dbn => Builtin.chooseData,
            new PLam(
                new PData,
                new PLam(
                    new returnT,
                    new PLam(
                        new returnT,
                        new PLam(
                            new returnT,
                            new PLam(
                                new returnT,
                                new PLam(
                                    new returnT,
                                    new returnT
                                )
                            )
                        )
                    )
                )
            )
        ),
        [ PData, returnT, returnT, returnT, returnT, returnT , returnT ]
    );
}

// only for pchooseData Type definition
// without this it would be impossoble to read
type CaseBFn<RetT extends PType> = ( bCase: Term< RetT > ) => Term<RetT>
type CaseIFn<RetT extends PType> = ( iCase: Term< RetT > ) =>
    Term<PLam<RetT , RetT >>
    & {
        caseB: CaseBFn<RetT>
        $: CaseBFn<RetT>
    };
type CaseListFn<RetT extends PType> = ( listCase: Term<RetT> ) =>
    Term<PLam<RetT, PLam<RetT , RetT >>>
    & {
        caseI: CaseIFn<RetT>,
        $: CaseIFn<RetT>
    }
type CaseMapFn<RetT extends PType> = ( mapCase: Term< RetT > ) => 
    Term<PLam<RetT, PLam<RetT, PLam<RetT , RetT >>>>
    & {
        caseList: CaseListFn<RetT>,
        $: CaseListFn<RetT>
    }
type CaseConstrFn<RetT extends PType> = ( constrCase: Term< RetT > ) =>
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
export function pchooseData< ReturnT extends PType >( returnT: new () => ReturnT )
    : Term< PLam< PData, PLam< ReturnT, PLam<ReturnT, PLam<ReturnT, PLam<ReturnT, PLam<ReturnT , ReturnT >>>>>>>
    & {
        $: ( pdata: Term<PData> ) =>
            Term<PLam< ReturnT, PLam<ReturnT, PLam<ReturnT, PLam<ReturnT, PLam<ReturnT , ReturnT >>>>>>
            & {
                caseConstr: CaseConstrFn<ReturnT>,
                $: CaseConstrFn<ReturnT>
            }
    }
{
    // new term identical to the strict one in order to define new (different) "$" properties
    const _chooseData  =new Term(
        _dbn => Builtin.chooseData,
        new PLam(
            new PData,
            new PLam(
                new returnT,
                new PLam(
                    new returnT,
                    new PLam(
                        new returnT,
                        new PLam(
                            new returnT,
                            new PLam(
                                new returnT,
                                new returnT
                            )
                        )
                    )
                )
            )
        )
    );

    return ObjectUtils.defineReadOnlyProperty(
        _chooseData,
        "$",
        ( data: Term<PData> ): Term<PLam< ReturnT, PLam<ReturnT, PLam<ReturnT, PLam<ReturnT, PLam<ReturnT , ReturnT >>>>>>
            & {
                caseConstr: CaseConstrFn<ReturnT>,
                $: CaseConstrFn<ReturnT>
            } => {
            const _cDWithData = papp( PLam )( _chooseData, data );

            const _cDWithDataApp = ObjectUtils.defineReadOnlyProperty(
                _cDWithData,
                "$",
                ( caseConstr: Term<ReturnT> ) => {
                    const _cDDWithConstr = papp( PLam )( _cDWithData as any , pdelay( returnT )(caseConstr) );

                    const _cDDWithConstrApp = ObjectUtils.defineReadOnlyProperty(
                        _cDDWithConstr,
                        "$",
                        ( mapCase: Term< ReturnT > ) => {
                            const _cDDCWithMap = papp( PLam )( _cDDWithConstr as any, pdelay( returnT )( mapCase ) );

                            const _cDDCWithMapApp = ObjectUtils.defineReadOnlyProperty(
                                _cDDCWithMap,
                                "$",
                                ( listCase: Term< ReturnT > ) => {
                                    const _cDDCMWithList = papp( PLam )( _cDDCWithMap as any, pdelay( returnT )( listCase ) );

                                    const _cDDCMWithListApp = ObjectUtils.defineReadOnlyProperty(
                                        _cDDCMWithList,
                                        "$",
                                        ( iCase: Term<ReturnT> ) => {
                                            const _cDDCMLWithInt = papp( PLam )( _cDDCMWithList as any, pdelay( returnT )( iCase ) );

                                            const _cDDCMLWithIntApp = ObjectUtils.defineReadOnlyProperty(
                                                _cDDCMLWithInt,
                                                "$",
                                                ( bCase: Term<ReturnT> ) : Term<ReturnT> => {
                                                    return pforce( returnT )(
                                                        papp( PLam )( _cDDCMLWithInt as any, pdelay( returnT )( bCase ) ) as any
                                                    );
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

export const pConstrToData: TermFn<[ PInt, PList<PData> ], PDataConstr >
    = addApplications<[ PInt, PList<PData> ], PDataConstr >(
        new Term(
            _dbn => Builtin.constrData,
            makePLamObj( new PInt, new PList([ new PData ]), new PDataConstr )
        ),
        [ PInt, PList as new () => PList<PData>, PDataConstr ]
    );

export function pMapToData<PDataKey extends PData, PDataVal extends PData>
    ( keyCtor: new () => PDataKey, valCtor: new () => PDataVal )
    : TermFn<[ PMap<PDataKey, PDataVal> ], PDataMap<PDataKey, PDataVal>>
{
    return addApplications<[ PList<PPair<PDataKey, PDataVal>> ], PDataMap<PDataKey, PDataVal> >(
        new Term(
            _dbn => Builtin.mapData,
            makePLamObj( new PList([ new PPair( new keyCtor, new valCtor ) ]), new PData )
        ),
        [ PList as new () => PList<PPair<PDataKey,PDataVal>>, PData ]
    );
}

export function pListToData<PDataListElem extends PData>
    ( dataListElemCtor: new () => PDataListElem )
    : TermFn<[ PList<PDataListElem> ], PDataList<PDataListElem> >
{
    return addApplications<[ PList<PDataListElem> ], PDataList<PDataListElem>>(
        new Term(
            _dbn => Builtin.listData,
            makePLamObj( new PList([ new dataListElemCtor ]), new PDataList )
        ),
        [ PList , PDataList ]
    );
} 

export const pIntToData: TermFn<[ PInt ], PDataInt > 
    = addApplications<[ PInt ], PData >(
        new Term<PLam<PInt, PData >>(
            _dbn => Builtin.iData,
            new PLam( new PInt, new PData )
        ),
        [ PInt, PData ]
    );

export const pBSToData: TermFn<[ PByteString ], PDataBS > 
    = addApplications<[ PByteString ], PData >(
        new Term<PLam<PByteString, PData >>(
            _dbn => Builtin.bData,
            new PLam( new PByteString, new PData )
        ),
        [ PByteString, PData ]
    );

export const punConstrData: TermFn<[ PDataConstr ], PPair<PInt, PList<PData>>>
    = addApplications<[ PDataConstr ], PPair<PInt, PList<PData>>>(
        new Term(
            _dbn => Builtin.unConstrData,
            new PLam( new PDataConstr, new PPair( new PInt, new PList([ new PData ]) ) )
        ),
        [ PData, PPair ]
    );
    
export function punMapData<PDataKey extends PData, PDataVal extends PData>
    ( keyCtor: new () => PDataKey, valCtor: new () => PDataVal )
    : TermFn<[ PData ], PList<PPair<PData, PData>>>
    {
        return addApplications<[ PData ], PList<PPair<PData, PData>>>(
            new Term(
                _dbn => Builtin.unMapData,
                new PLam( new PData, new PList([ new PPair( new keyCtor, new valCtor ) ]))
            ),
            [ PData, PList ]
        );

    }

export const punListData: TermFn<[ PData ], PList<PData>>
    = addApplications<[ PData ], PList<PData>>(
        new Term(
            _dbn => Builtin.unListData,
            new PLam( new PData, new PList([ new PData ]))
        ),
        [ PData, PList ]
    );

export const punIData: TermFn<[ PDataInt ], PInt>
    = addApplications<[ PDataInt ], PInt>(
        new Term(
            _dbn => Builtin.unIData,
            new PLam( new PData, new PInt)
        ),
        [ PData, PInt ]
    );

export const punBData: Term<PLam<PDataBS, PByteString>>
& {
    $: ( dataBS: Term<PDataBS> ) => TermBS
} = (() => {
    const unBData = new Term(
        _dbn => Builtin.unBData,
        new PLam( new PDataBS, new PByteString)
    );

    return ObjectUtils.defineReadOnlyProperty(
        unBData,
        "$",
        ( dataBS: Term<PDataBS> ): TermBS =>
            addPByteStringMethods( papp( PByteString )( unBData, dataBS ) )
    );
})()

export const peqData: TermFn<[ PData, PData ], PBool >
    = addApplications<[ PData, PData ], PBool >(
        new Term<PLam<PData, PLam< PData, PBool > >>(
            _dbn => Builtin.equalsData,
            new PLam( new PData, new PLam( new PData, new PBool ) )
        ),
        [ PData, PData, PBool ]
    );

export function peq<PT extends PInt | PByteString | PString | PData >( pt: new () => PT )
    : TermFn<[ PT, PT ], PBool >
{
    if( pt.prototype === PInt.prototype )           return peqInt as any;
    if( pt.prototype === PByteString.prototype )    return peqBs as any;
    if( pt.prototype === PData.prototype )          return peqData as any;
    if( pt.prototype === PString.prototype )        return peqStr as any

    /**
     * @fixme add proper error
    */
    throw new BasePlutsError(
        "unsupported low level equality using 'peq'"
    );
}

export const ppairData: TermFn<[ PData, PData ], PPair<PData,PData> >
    = addApplications<[ PData, PData ], PPair<PData,PData> >(
        new Term<PLam<PData, PLam< PData, PPair<PData,PData> > >>(
            _dbn => Builtin.mkPairData,
            new PLam( new PData, new PLam( new PData, new PPair( new PData, new PData ) ) )
        ),
        [ PData, PData, PPair ]
    );

/**
 * @fixme **hoist**
 */
export const pnilData: Term<PList< PData > >
    = new Term(
        _dbn => new Application( Builtin.mkNilData, UPLCConst.unit ),
        new PList([ new PData ])
    );

/**
 * @fixme **hoist**
 */
export const pnilPairData: Term<PList< PPair<PData, PData>>>
    = new Term(
        _dbn => new Application( Builtin.mkNilPairData, UPLCConst.unit ),
        new PList([ new PPair( new PData, new PData) ])
    );

export function pnil<PListElem extends PData | PPair<PData,PData> >( elemT: new () => PListElem )
    : Term<PList< PListElem > >
{
    if( elemT.prototype === PData.prototype )
    {
        return pnilData as any;
    }
    if( elemT.prototype === PPair.prototype )
    {
        return pnilPairData as any;
    }

    /**
     * @fixme add proper error
    */
     throw new BasePlutsError(
        "unsupported low level 'nil' element'"
    );
}


// --------------------------------------------------------------------------------------------------------------------- //
// ----------------------------------------------- [ VASIL (Plutus V2) ] ----------------------------------------------- //
// --------------------------------------------------------------------------------------------------------------------- //

export const pserialiseData: TermFn<[ PData ], PByteString >
    = addApplications<[ PData ], PByteString >(
        new Term(
            _dbn => Builtin.serialiseData,
            new PLam( new PData, new PByteString )
        ),
        [ PData, PByteString ]
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
            _dbn => Builtin.verifyEcdsaSecp256k1Signature,
            new PLam( new PByteString , new PLam( new PByteString , new PLam( new PByteString , new PBool ) ) )
        ),
        [ PByteString, PByteString, PByteString, PBool ]
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
            _dbn => Builtin.verifySchnorrSecp256k1Signature,
            new PLam( new PByteString , new PLam( new PByteString , new PLam( new PByteString , new PBool ) ) )
        ),
        [ PByteString, PByteString, PByteString, PBool ]
    );