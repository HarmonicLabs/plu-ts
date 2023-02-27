import ObjectUtils from "../../../../../utils/ObjectUtils";
import { Builtin } from "../../../../UPLC/UPLCTerms/Builtin";
import { TermFn, PPair, PLam } from "../../../PTypes";
import { Term } from "../../../Term";
import { TermType, ToPType, lam, pair } from "../../../type_system";
import { UtilityTermOf } from "../../addUtilityForType";
import { papp } from "../../papp";


export function psndPairNoUnwrap<A extends TermType, B extends TermType>( fstType: A, sndType: B )
    : TermFn<[ PPair<ToPType<A>,ToPType<B>> ], ToPType<B>>
{
    const a = fstType;
    const b = sndType;

    const outT = b;

    const bnTerm = new Term<PLam<PPair<ToPType<A>, ToPType<B>>, ToPType<B>>>(
        lam( pair( a, b ), outT ) as any,
        _dbn =>  Builtin.sndPair
    );

    ObjectUtils.defineReadOnlyProperty(
        bnTerm,
        "$",
        ( _pair: Term<PPair<ToPType<A>,ToPType<B>>> ): UtilityTermOf<ToPType<B>> => {
            return papp( bnTerm, _pair );
        }
    );

    return bnTerm as any;
}