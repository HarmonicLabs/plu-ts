import { BasePlutsError } from "../../../../../errors/BasePlutsError";
import ObjectUtils from "../../../../../utils/ObjectUtils";
import { Builtin } from "../../../../UPLC/UPLCTerms/Builtin";
import { TermFn, PPair, PLam } from "../../../PTypes";
import { Term } from "../../../Term";
import { TermType, ToPType, lam, pair, PrimType, data, tyVar, isWellFormedType } from "../../../type_system";
import { UtilityTermOf, addUtilityForType } from "../../addUtilityForType";
import { papp } from "../../papp";
import { punsafeConvertType } from "../../punsafeConvertType";



export function pfstPair<A extends TermType, B extends TermType>( fstType: A, sndType: B )
    : TermFn<[ PPair<ToPType<A>,ToPType<B>> ], ToPType<A>>
{
    const a = fstType;
    const b = sndType;

    const bnTerm = new Term<PLam<PPair<ToPType<A>, ToPType<B>>, ToPType<A>>>(
        lam( pair( a, b ), a ),
        _dbn => Builtin.fstPair
    );
    
    ObjectUtils.defineReadOnlyProperty(
        bnTerm,
        "$",
        ( pair: Term<PPair<ToPType<A>,ToPType<B>>> ): UtilityTermOf<ToPType<A>> => {

            if( (pair as any).__isDynamicPair || pair.type[0] === PrimType.PairAsData )
            {
                if( !isWellFormedType( a ) )
                {
                    throw new BasePlutsError(
                        "is not possible to extract the first element of a (dynamic) pair with non constant type"
                    );
                }

                return addUtilityForType( a )(
                    getFromDataForType( a )(
                        papp(
                            punsafeConvertType( bnTerm, lam( pair( data, data ), data ) ),
                            punsafeConvertType( pair, pair( data, data ) )
                        ) as any
                    ) as any
                ) as any;

            }

            return papp( bnTerm, pair );
        }
    );

    return bnTerm as any;
}

export function psndPair<A extends TermType, B extends TermType>( fstType: A, sndType: B )
    : TermFn<[ PPair<ToPType<A>,ToPType<B>> ], ToPType<B>>
{
    const a = fstType ?? tyVar("psndPair_fstType");
    const b = sndType ?? tyVar("psndPair_sndType");
   
    const bnTerm = new Term<PLam<PPair<ToPType<A>, ToPType<B>>, ToPType<B>>>(
        lam( pair( a, b ), b ),
        _dbn => Builtin.sndPair
    );
    
    ObjectUtils.defineReadOnlyProperty(
        bnTerm,
        "$",
        ( pair: Term<PPair<ToPType<A>,ToPType<B>>> ): UtilityTermOf<ToPType<B>> => {

            if( (pair as any).__isDynamicPair || pair.type[0] === PrimType.PairAsData )
            {
                if( !isWellFormedTermType( b ) )
                {
                    throw new BasePlutsError(
                        "is not possible to extract the first element of a (dynamic) pair with non constant type"
                    );
                }

                return addUtilityForType( b )(
                    getFromDataForType( b )(
                        papp(
                            punsafeConvertType( bnTerm, lam( pair( data, data ), data ) ),
                            punsafeConvertType( pair, pair( data, data ) )
                        ) as any
                    ) as any
                ) as any;

            }

            return papp( bnTerm, pair );
        }
    );

    return bnTerm as any;
}