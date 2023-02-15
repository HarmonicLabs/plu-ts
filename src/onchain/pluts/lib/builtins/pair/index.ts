import { BasePlutsError } from "../../../../../errors/BasePlutsError";
import ObjectUtils from "../../../../../utils/ObjectUtils";
import { Builtin } from "../../../../UPLC/UPLCTerms/Builtin";
import { TermFn, PPair, PLam } from "../../../PTypes";
import { Term } from "../../../Term";
import { TermType, ToPType, lam, pair, PrimType, data, tyVar, isWellFormedType } from "../../../type_system";
import { UtilityTermOf, addUtilityForType } from "../../addUtilityForType";
import { papp } from "../../papp";
import { punsafeConvertType } from "../../punsafeConvertType";
import { addApplications } from "../addApplications";



export function pfstPair<A extends TermType, B extends TermType>( fstType: A, sndType: B )
    : TermFn<[ PPair<ToPType<A>,ToPType<B>> ], ToPType<A>>
{
    const a = fstType;
    const b = sndType;

    return addApplications<[ PPair<ToPType<A>, ToPType<B>> ], ToPType<A>>(
        new Term<PLam<PPair<ToPType<A>, ToPType<B>>, ToPType<A>>>(
            lam( pair( a, b ), a ) as any,
            _dbn => Builtin.fstPair
        )
    );
}

export function psndPair<A extends TermType, B extends TermType>( fstType: A, sndType: B )
    : TermFn<[ PPair<ToPType<A>,ToPType<B>> ], ToPType<B>>
{
    const a = fstType;
    const b = sndType;

    return addApplications<[ PPair<ToPType<A>, ToPType<B>> ], ToPType<B>>(
        new Term<PLam<PPair<ToPType<A>, ToPType<B>>, ToPType<B>>>(
            lam( pair( a, b ), b ) as any,
            _dbn => Builtin.sndPair
        )
    );
}