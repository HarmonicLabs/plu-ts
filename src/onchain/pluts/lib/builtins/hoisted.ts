import ObjectUtils from "../../../../utils/ObjectUtils";
import { IRNative } from "../../../IR/IRNodes/IRNative";
import { Lambda } from "../../../UPLC/UPLCTerms/Lambda";
import { UPLCVar } from "../../../UPLC/UPLCTerms/UPLCVar";
import { TermFn, PLam } from "../../PTypes";
import { Term } from "../../Term";
import { TermType, ToPType, lam } from "../../type_system";
import { papp } from "../papp";
import { phoist } from "../phoist";



export function pid<TermT extends TermType>( termT: TermT ): TermFn<[ ToPType<TermT> ], ToPType<TermT>>
{
    const idTerm = new Term<PLam<ToPType<TermT>,ToPType<TermT>>>(
        lam( termT, termT ) as any,
        _dbn => IRNative._id
    );
    return phoist(
        ObjectUtils.defineReadOnlyProperty(
            idTerm,
            "$",
            ( whatever: Term<ToPType<TermT>> ) => papp( idTerm, whatever )
        )
    ) as any;
}