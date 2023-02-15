import ObjectUtils from "../../../../utils/ObjectUtils";
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