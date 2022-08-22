import ObjectUtils from "../../../utils/ObjectUtils";
import { Head, ReturnT } from "../../../utils/ts";
import Builtin from "../../UPLC/UPLCTerms/Builtin";
import PType from "../PType";
import PFn from "../PTypes/PFn";
import PLam, { TermFn } from "../PTypes/PFn/PLam";
import PInt from "../PTypes/PInt";
import { papp } from "../Syntax";
import Term from "../Term";
// import LamTerm from "../Term/LambdaTerm";


function addApplication<A extends PType, B extends PType>( lambdaTerm: Term< PLam< A, B > > ): Term<PLam<A, B>> & Record<"$", (input: Term<A>) => Term<B>>
{
    return ObjectUtils.defineReadOnlyProperty(
        lambdaTerm,
        "$",
        ( input: Term< A > ) => papp( lambdaTerm, input )
    );
}

function addNApplications<Ins extends [ PType, ...PType[] ], Out extends PType>
    ( lambdaTerm: Term< PFn< Ins, Out > >, n: number = 1 )
    : TermFn< Ins, Out >
{
    if( n <= 1 )
    {
        return ObjectUtils.defineReadOnlyProperty(
            lambdaTerm,
            "$",
            ( input: Term< Head<Ins> > ) => papp( lambdaTerm as any, input )
        ) as any;
    }

    return ObjectUtils.defineReadOnlyProperty(
        lambdaTerm,
        "$",
        ( input: Term< Head<Ins> > ) => addNApplications( papp( lambdaTerm as any, input ) as any, n - 1 )
    ) as any;
}

export const padd: TermFn<[ PInt , PInt], PInt > = addNApplications<[PInt, PInt], PInt>(
    new Term< PLam< PInt, PLam< PInt, PInt > > >(
        dbn => Builtin.addInteger
    ), 2
);