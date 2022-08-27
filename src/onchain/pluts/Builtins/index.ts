import ObjectUtils from "../../../utils/ObjectUtils";
import { Head, Tail } from "../../../utils/ts";
import Application from "../../UPLC/UPLCTerms/Application";
import Builtin from "../../UPLC/UPLCTerms/Builtin";
import PType, { ToCtors } from "../PType";
import PBool from "../PTypes/PBool";
import PByteString from "../PTypes/PByteString";
import PData from "../PTypes/PData";
import PDelayed from "../PTypes/PDelayed";
import PFn from "../PTypes/PFn";
import PLam, { TermFn } from "../PTypes/PFn/PLam";
import PInt from "../PTypes/PInt";
import PList from "../PTypes/PList";
import PPair from "../PTypes/PPair";
import PString, { pStr } from "../PTypes/PString";
import PUnit from "../PTypes/PUnit";
import { papp, pdelay, pforce, plam } from "../Syntax";
import Term from "../Term";

function addApplications<Ins extends [ PType, ...PType[] ], Out extends PType>
    ( lambdaTerm: Term< PFn< Ins, Out > >, types: ToCtors<[ ...Ins, Out ]> )
    : TermFn< Ins, Out >
{
    const inTysLength = types.length - 1;

    if( inTysLength <= 1 )
    {
        return ObjectUtils.defineReadOnlyProperty(
            lambdaTerm,
            "$",
            ( input: Term< Head<Ins> > ) => papp( types[ inTysLength ] )( lambdaTerm as any, input )
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
                papp( PLam )( lambdaTerm as any, input ) as any,
                types.slice( 1 )
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

function intBinOp<Out extends PType>( builtin: Builtin, out: new () => Out ): TermFn<[ PInt, PInt ], Out >
{
    return addApplications<[ PInt, PInt ], Out>(
        new Term(
            dbn => builtin,
            new PLam( new PInt , new PLam( new PInt , new out ) )
        ), [ PInt, PInt, out ]
    );
}

function byteStringBinOp<Out extends PType>( builtin: Builtin, out: new () => Out ): TermFn<[ PByteString, PByteString ], Out >
{
    return addApplications<[ PByteString, PByteString ], Out>(
        new Term(
            dbn => builtin,
            new PLam( new PByteString , new PLam( new PByteString , new out ) )
        ), [ PByteString, PByteString, out ]
    );
}

export const padd: TermFn<[ PInt , PInt ], PInt >    = intBinOp< PInt >( Builtin.addInteger, PInt );
export const psub: TermFn<[ PInt , PInt ], PInt >    = intBinOp< PInt >( Builtin.subtractInteger, PInt );
export const pmult: TermFn<[ PInt , PInt ], PInt >   = intBinOp< PInt >( Builtin.multiplyInteger, PInt );
export const pdiv: TermFn<[ PInt , PInt ], PInt >    = intBinOp< PInt >( Builtin.divideInteger, PInt );
export const pquot: TermFn<[ PInt , PInt ], PInt >   = intBinOp< PInt >( Builtin.quotientInteger, PInt );
export const prem: TermFn<[ PInt , PInt ], PInt >    = intBinOp< PInt >( Builtin.remainderInteger, PInt );
export const pmod: TermFn<[ PInt , PInt ], PInt >    = intBinOp< PInt >( Builtin.modInteger, PInt );

export const peqInt: TermFn<[ PInt , PInt ], PBool > = intBinOp< PBool >( Builtin.equalsInteger, PBool );
export const plessInt: TermFn<[ PInt , PInt ], PBool > = intBinOp< PBool >( Builtin.lessThanInteger, PBool );
export const plessEqInt: TermFn<[ PInt , PInt ], PBool > = intBinOp< PBool >( Builtin.lessThanEqualInteger, PBool );

export const pappendBs: TermFn<[ PByteString , PByteString ], PByteString > = byteStringBinOp< PByteString >( Builtin.appendByteString, PByteString );
export const pconstBs: TermFn<[ PInt , PByteString ], PByteString > =
    addApplications< [ PInt, PByteString ], PByteString >(
        new Term(
            dbn => Builtin.consByteString,
            new PLam( new PInt, new PLam( new PByteString, new PByteString ) )
        ),
        [ PInt, PByteString, PByteString ]
    );
export const psliceBs: TermFn<[ PInt , PInt, PByteString ], PByteString > = 
    addApplications<[ PInt , PInt, PByteString ], PByteString >(
        new Term(
            _dbn => Builtin.sliceByteString,
            new PLam( new PInt, new PLam( new PInt, new PLam( new PByteString , new PByteString) ) )
        ),
        [ PInt , PInt, PByteString, PByteString ]
    );
export const plengthBs: TermFn<[ PByteString ], PInt > =
    addApplications<[ PByteString ], PInt >(
        new Term(
            dbn => Builtin.lengthOfByteString,
            new PLam( new PByteString, new PInt )
        ),
        [ PByteString, PInt ]
    );
export const pindexBs: TermFn<[ PByteString, PInt ], PInt > =
    addApplications<[ PByteString, PInt ], PInt >(
        new Term(
            dbn => Builtin.indexByteString,
            new PLam( new PByteString, new PLam( new PInt, new PInt ) )
        ),
        [ PByteString, PInt, PInt ]
    );
export const peqBs: TermFn<[ PByteString, PByteString ], PBool > = byteStringBinOp< PBool >( Builtin.equalsByteString, PBool );
export const plessBs: TermFn<[ PByteString, PByteString ], PBool > = byteStringBinOp< PBool >( Builtin.lessThanByteString, PBool );
export const plessEqBs: TermFn<[ PByteString, PByteString ], PBool > = byteStringBinOp< PBool >( Builtin.lessThanEqualsByteString, PBool );

export const psha2_256: TermFn<[ PByteString ], PByteString > =
    addApplications<[ PByteString ], PByteString >(
        new Term(
            dbn => Builtin.sha2_256,
            new PLam( new PByteString , new PByteString )
        ),
        [ PByteString, PByteString ]
    );
export const psha3_256: TermFn<[ PByteString ], PByteString > =
    addApplications<[ PByteString ], PByteString >(
        new Term(
            dbn => Builtin.sha3_256,
            new PLam( new PByteString , new PByteString )
        ),
        [ PByteString, PByteString ]
    );
export const pblake2b_256: TermFn<[ PByteString ], PByteString > =
    addApplications<[ PByteString ], PByteString >(
        new Term(
            dbn => Builtin.blake2b_256,
            new PLam( new PByteString , new PByteString )
        ),
        [ PByteString, PByteString ]
    );

export const pverifyEd25519: TermFn<[ PByteString, PByteString, PByteString ], PBool > =
    addApplications<[ PByteString, PByteString, PByteString ], PBool >(
        new Term(
            _dbn => Builtin.verifyEd25519Signature,
            new PLam( new PByteString , new PLam( new PByteString , new PLam( new PByteString , new PBool ) ) )
        ),
        [ PByteString, PByteString, PByteString, PBool ]
    );

export const pappendStr: TermFn<[ PString, PString ], PString > =
    addApplications<[ PString, PString ], PString >(
        new Term(
            _dbn => Builtin.appendString,
            new PLam( new PString, new PLam( new PString , new PString ) )
        ),
        [ PString, PString, PString ]
    );
export const peqStr: TermFn<[ PString, PString ], PBool > =
    addApplications<[ PString, PString ], PBool >(
        new Term(
            dbn => Builtin.equalsString,
            new PLam( new PString, new PLam( new PString, new PBool ) )
        ),
        [ PString, PString, PBool ]
    );

export const pencodeUtf8: TermFn<[ PString ], PByteString > =
    addApplications<[ PString ], PByteString >(
        new Term(
            _dbn => Builtin.encodeUtf8,
            new PLam( new PString, new PByteString )
        ),
        [ PString, PByteString ]
    );
export const pdecodeUtf8: TermFn<[ PByteString ], PString > =
    addApplications<[ PByteString ], PString >(
        new Term(
            _dbn => Builtin.decodeUtf8,
            new PLam( new PByteString, new PString )
        ),
        [ PByteString, PString ]
    );

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

export function pif<ReturnT extends PType>( returnT: new () => ReturnT )
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

automatically add delays to all alrguments exept the first;
add aliases for the applications exept the first;
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