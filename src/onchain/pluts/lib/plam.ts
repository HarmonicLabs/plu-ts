import ObjectUtils from "../../../../../src/utils/ObjectUtils";
import { IRFunc } from "../../../../../src/onchain/IR/IRNodes/IRFunc";
import { IRVar } from "../../../../../src/onchain/IR/IRNodes/IRVar";
import { PLam } from "../PTypes";
import { Term } from "../Term";
import { includesDynamicPairs } from "../type_system/includesDynamicPairs";
import { ToPType } from "../type_system/ts-pluts-conversion";
import { TermType, lam } from "../type_system/types";
import { UtilityTermOf, addUtilityForType } from "./addUtilityForType";
import { PappResult, papp } from "./papp";


export function plam<A extends TermType, B extends TermType >( inputType: A, outputType: B )
: ( termFunc : 
    ( input:  UtilityTermOf<ToPType<A>>
    ) => Term<ToPType<B>> 
) => PappResult<PLam<ToPType<A>,ToPType<B>>>
{
return ( termFunc: ( input: UtilityTermOf<ToPType<A>> ) => Term<ToPType<B>> ): PappResult<PLam<ToPType<A>,ToPType<B>>> =>
{
    const lambdaTerm  = new Term<PLam<ToPType<A>,ToPType<B>>>(
        lam( inputType, outputType ) as any,
        dbn => {
            const thisLambdaPtr = dbn + BigInt( 1 );

            const boundVar = new Term<ToPType<A>>(
                inputType as any,
                dbnAccessLevel => new IRVar( dbnAccessLevel - thisLambdaPtr )
            );
            
            const body = termFunc( addUtilityForType( inputType )( boundVar ) as any);

            // here the debruijn level is incremented
            return new IRFunc( 1, body.toIR( thisLambdaPtr ) );
        }
    );

    ObjectUtils.defineReadOnlyHiddenProperty(
        lambdaTerm, "unsafeWithInputOfType",
        ( inT: TermType ) => new Term<PLam<ToPType<A>,ToPType<B>>>(
            lam(
                inT, 
                outputType
            ) as any,
            dbn => {
                const thisLambdaPtr = dbn + BigInt( 1 );
    
                const boundVar = new Term<ToPType<A>>(
                    inT as any,
                    dbnAccessLevel => new IRVar( dbnAccessLevel - thisLambdaPtr )
                );
                
                const body = termFunc(
                    addUtilityForType( inT )(
                        ObjectUtils.defineReadOnlyHiddenProperty(
                            boundVar,
                            "__isDynamicPair",
                            includesDynamicPairs( inT )
                        )
                    ) as any
                );
    
                // here the debruijn level is incremented
                return new IRFunc( 1, body.toIR( thisLambdaPtr ) );
            }
        )
    )

    // allows ```lambdaTerm.$( input )``` syntax
    // rather than ```papp( lambdaTerm, input )```
    // preserving Term Type
    return ObjectUtils.defineReadOnlyProperty(
        lambdaTerm,
        "$",
        ( input: UtilityTermOf<ToPType<A>> ) => papp( lambdaTerm, input )
    ) as any;
};
}