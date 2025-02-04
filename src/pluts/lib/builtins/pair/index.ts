import { defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { IRNative } from "../../../../IR/IRNodes/IRNative";
import { TermFn, PPair, PLam } from "../../../PTypes";
import { Term } from "../../../Term";
import { PrimType, TermType, ToPType, data, lam, pair } from "../../../../type_system";
import { unwrapAsData } from "../../../../type_system/tyArgs";
import { UtilityTermOf } from "../../std/UtilityTerms/addUtilityForType";
import { papp } from "../../papp";
import { punsafeConvertType } from "../../punsafeConvertType";
import { _fromData, _pfromData } from "../../std/data/conversion/fromData_minimal";


export function pfstPair<A extends TermType, B extends TermType>( fstType: A, sndType: B )
    : TermFn<[ PPair<ToPType<A>,ToPType<B>> ], ToPType<A>>
{
    const a = fstType;
    const b = sndType;

    const outT = a[0] === PrimType.AsData ? unwrapAsData( a as any ) : a;

    const bnTerm = new Term<PLam<PPair<ToPType<A>, ToPType<B>>, ToPType<A>>>(
        lam( pair( a, b ), outT ) as any,
        _dbn =>  IRNative.fstPair
    );

    defineReadOnlyProperty(
        bnTerm,
        "$",
        ( _pair: Term<PPair<ToPType<A>,ToPType<B>>> ): UtilityTermOf<ToPType<A>> => {

            if(
                (_pair as any).__isDynamicPair ||
                a[0] === PrimType.AsData ||
                _pair.type[1][0] === PrimType.AsData
            )
            {
                return punsafeConvertType(
                    _fromData( outT )(
                        papp(
                            punsafeConvertType( bnTerm, lam( pair( data, data ), data ) ),
                            punsafeConvertType( _pair, pair( data, data ) )
                        ) as any
                    ),
                    outT
                ) as any;
            }

            return papp( bnTerm, _pair );
        }
    );

    return bnTerm as any;
}

export function psndPair<A extends TermType, B extends TermType>( fstType: A, sndType: B )
    : TermFn<[ PPair<ToPType<A>,ToPType<B>> ], ToPType<B>>
{
    const a = fstType;
    const b = sndType;

    const outT = b[0] === PrimType.AsData ? unwrapAsData( b as any ) : b;

    const bnTerm = new Term<PLam<PPair<ToPType<A>, ToPType<B>>, ToPType<B>>>(
        lam( pair( a, b ), outT ) as any,
        _dbn =>  IRNative.sndPair
    );

    defineReadOnlyProperty(
        bnTerm,
        "$",
        ( _pair: Term<PPair<ToPType<A>,ToPType<B>>> ): UtilityTermOf<ToPType<B>> => {

            if(
                (_pair as any).__isDynamicPair ||
                b[0] === PrimType.AsData ||
                (_pair.type[2] as any)[0] === PrimType.AsData
            )
            {
                return punsafeConvertType(
                    _fromData( outT )(
                        papp(
                            punsafeConvertType( bnTerm, lam( pair( data, data ), data ) ),
                            punsafeConvertType( _pair, pair( data, data ) )
                        ) as any
                    ),
                    outT
                ) as any;
            }

            return papp( bnTerm, _pair );
        }
    );

    return bnTerm as any;
}