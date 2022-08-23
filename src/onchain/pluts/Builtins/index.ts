import ObjectUtils from "../../../utils/ObjectUtils";
import { Head, Tail } from "../../../utils/ts";
import Builtin from "../../UPLC/UPLCTerms/Builtin";
import PType, { ToCtors } from "../PType";
import PBool from "../PTypes/PBool";
import PByteString from "../PTypes/PByteString";
import PDelayed from "../PTypes/PDelayed";
import PFn from "../PTypes/PFn";
import PLam, { TermFn } from "../PTypes/PFn/PLam";
import PInt from "../PTypes/PInt";
import PString from "../PTypes/PString";
import { papp, pdelay, pforce } from "../Syntax";
import Term from "../Term";

function addNApplications<Ins extends [ PType, ...PType[] ], Out extends PType>
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
            addNApplications< Tail<Ins>, Out >
            ( papp( PLam )( lambdaTerm as any, input ) as any, types.slice( 1 ) )
    ) as any;
}


function intBinOp<Out extends PType>( builtin: Builtin, out: new () => Out ): TermFn<[ PInt, PInt ], Out >
{
    return addNApplications<[ PInt, PInt ], Out>(
        new Term(
            dbn => builtin,
            new PLam( new PInt , new PLam( new PInt , new out ) )
        ), [ PInt, PInt, out ]
    );
}

function byteStringBinOp<Out extends PType>( builtin: Builtin, out: new () => Out ): TermFn<[ PByteString, PByteString ], Out >
{
    return addNApplications<[ PByteString, PByteString ], Out>(
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
    addNApplications< [ PInt, PByteString ], PByteString >(
        new Term(
            dbn => Builtin.consByteString,
            new PLam( new PInt, new PLam( new PByteString, new PByteString ) )
        ),
        [ PInt, PByteString, PByteString ]
    );
export const psliceBs: TermFn<[ PInt , PInt, PByteString ], PByteString > = 
    addNApplications<[ PInt , PInt, PByteString ], PByteString >(
        new Term(
            _dbn => Builtin.sliceByteString,
            new PLam( new PInt, new PLam( new PInt, new PLam( new PByteString , new PByteString) ) )
        ),
        [ PInt , PInt, PByteString, PByteString ]
    );
export const plengthBs: TermFn<[ PByteString ], PInt > =
    addNApplications<[ PByteString ], PInt >(
        new Term(
            dbn => Builtin.lengthOfByteString,
            new PLam( new PByteString, new PInt )
        ),
        [ PByteString, PInt ]
    );
export const pindexBs: TermFn<[ PByteString, PInt ], PInt > =
    addNApplications<[ PByteString, PInt ], PInt >(
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
    addNApplications<[ PByteString ], PByteString >(
        new Term(
            dbn => Builtin.sha2_256,
            new PLam( new PByteString , new PByteString )
        ),
        [ PByteString, PByteString ]
    );
export const psha3_256: TermFn<[ PByteString ], PByteString > =
    addNApplications<[ PByteString ], PByteString >(
        new Term(
            dbn => Builtin.sha3_256,
            new PLam( new PByteString , new PByteString )
        ),
        [ PByteString, PByteString ]
    );
export const pblake2b_256: TermFn<[ PByteString ], PByteString > =
    addNApplications<[ PByteString ], PByteString >(
        new Term(
            dbn => Builtin.blake2b_256,
            new PLam( new PByteString , new PByteString )
        ),
        [ PByteString, PByteString ]
    );

export const pverifyEd25519: TermFn<[ PByteString, PByteString, PByteString ], PBool > =
    addNApplications<[ PByteString, PByteString, PByteString ], PBool >(
        new Term(
            _dbn => Builtin.verifyEd25519Signature,
            new PLam( new PByteString , new PLam( new PByteString , new PLam( new PByteString , new PBool ) ) )
        ),
        [ PByteString, PByteString, PByteString, PBool ]
    );

export const pappendStr: TermFn<[ PString, PString ], PString > =
    addNApplications<[ PString, PString ], PString >(
        new Term(
            _dbn => Builtin.appendString,
            new PLam( new PString, new PLam( new PString , new PString ) )
        ),
        [ PString, PString, PString ]
    );
export const peqStr: TermFn<[ PString, PString ], PBool > =
    addNApplications<[ PString, PString ], PBool >(
        new Term(
            dbn => Builtin.equalsString,
            new PLam( new PString, new PLam( new PString, new PBool ) )
        ),
        [ PString, PString, PBool ]
    );

export const pencodeUtf8: TermFn<[ PString ], PByteString > =
    addNApplications<[ PString ], PByteString >(
        new Term(
            _dbn => Builtin.encodeUtf8,
            new PLam( new PString, new PByteString )
        ),
        [ PString, PByteString ]
    );
export const pdecodeUtf8: TermFn<[ PByteString ], PString > =
    addNApplications<[ PByteString ], PString >(
        new Term(
            _dbn => Builtin.decodeUtf8,
            new PLam( new PByteString, new PString )
        ),
        [ PByteString, PString ]
    );

export function pstrictIf<ReturnT extends PType>( returnT: new () => ReturnT ): TermFn<[ PBool, ReturnT, ReturnT ], ReturnT>
{
    return addNApplications<[ PBool, ReturnT, ReturnT ], ReturnT>(
        new Term(
            _dbn => Builtin.ifThenElse,
            new PLam( new PBool, new PLam( new returnT, new PLam( new returnT, new returnT ) ) )
        ),
        [ PBool, returnT, returnT, returnT ]
    );
}

export function pif<ReturnT extends PType>( returnT: new () => ReturnT ): TermFn<[ PBool, ReturnT, ReturnT ], ReturnT>
{
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

            return ObjectUtils.defineReadOnlyProperty(
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
1
                    return ObjectUtils.defineReadOnlyProperty(
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
                    )
                })() 
            );
        })()
    )
}