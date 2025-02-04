import { defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { IRNative } from "../../../../IR/IRNodes/IRNative";
import { TermFn, PPair, PLam } from "../../../PTypes";
import { Term } from "../../../Term";
import { TermType, ToPType, lam, pair } from "../../../../type_system";
import { UtilityTermOf } from "../../std/UtilityTerms/addUtilityForType";
import { papp } from "../../papp";


export function pfstPairNoUnwrap<A extends TermType, B extends TermType>( fstType: A, sndType: B )
    : TermFn<[ PPair<ToPType<A>,ToPType<B>> ], ToPType<A>>
{
    const a = fstType;
    const b = sndType;

    const outT = a;

    const bnTerm = new Term<PLam<PPair<ToPType<A>, ToPType<B>>, ToPType<A>>>(
        lam( pair( a, b ), outT ) as any,
        _dbn =>  IRNative.fstPair
    );

    defineReadOnlyProperty(
        bnTerm,
        "$",
        ( _pair: Term<PPair<ToPType<A>,ToPType<B>>> ): UtilityTermOf<ToPType<A>> => {
            return papp( bnTerm, _pair );
        }
    );

    return bnTerm as any;
}

export function psndPairNoUnwrap<A extends TermType, B extends TermType>( fstType: A, sndType: B )
    : TermFn<[ PPair<ToPType<A>,ToPType<B>> ], ToPType<B>>
{
    const a = fstType;
    const b = sndType;

    const outT = b;

    const bnTerm = new Term<PLam<PPair<ToPType<A>, ToPType<B>>, ToPType<B>>>(
        lam( pair( a, b ), outT ) as any,
        _dbn =>  IRNative.sndPair
    );

    defineReadOnlyProperty(
        bnTerm,
        "$",
        ( _pair: Term<PPair<ToPType<A>,ToPType<B>>> ): UtilityTermOf<ToPType<B>> => {
            return papp( bnTerm, _pair );
        }
    );

    return bnTerm as any;
}