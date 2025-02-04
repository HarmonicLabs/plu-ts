import { defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { TermFn, PLam } from "../../PTypes";
import { Term } from "../../Term";
import { TermType, ToPType, lam } from "../../../type_system";
import { papp } from "../papp";
import { phoist } from "../phoist";
import { IRNative } from "../../../IR/IRNodes/IRNative";


export function pid<TermT extends TermType>( termT: TermT ): TermFn<[ ToPType<TermT> ], ToPType<TermT>>
{
    const idTerm = new Term<PLam<ToPType<TermT>,ToPType<TermT>>>(
        lam( termT, termT ) as any,
        _dbn => IRNative._id
    );
    return phoist(
        defineReadOnlyProperty(
            idTerm,
            "$",
            ( whatever: Term<ToPType<TermT>> ) => papp( idTerm, whatever )
        )
    ) as any;
}