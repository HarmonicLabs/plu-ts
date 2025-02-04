import { defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import type { PType } from "../../PType";
import type { PFn, TermFn } from "../../PTypes/PFn/PFn";
import type { Term } from "../../Term";

import { getNRequiredLambdaArgs } from "../../../type_system/utils";
import { papp } from "../papp";
import { PappArg } from "../pappArg";
import { Head } from "../../../utils/types";


export function addApplications<Ins extends [ PType, ...PType[] ], Out extends PType>
    (
        lambdaTerm: Term< PFn< Ins, Out > >
    )
    : TermFn< Ins, Out >
{
    const nMissingArgs = getNRequiredLambdaArgs( lambdaTerm.type );

    if( nMissingArgs <= 1 )
    {
        return defineReadOnlyProperty(
            lambdaTerm,
            "$",
            ( input: PappArg< Head<Ins> > ) => {
                let output: any = papp( lambdaTerm as any, input );

                return output;
            }
        ) as any;
    }

    return defineReadOnlyProperty(
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