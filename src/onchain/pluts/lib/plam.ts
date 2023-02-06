import ObjectUtils from "../../../utils/ObjectUtils";
import { Lambda } from "../../UPLC/UPLCTerms/Lambda";
import { UPLCVar } from "../../UPLC/UPLCTerms/UPLCVar";
import { PLam } from "../PTypes";
import { TermType, Term, Type } from "../Term";
import { isPairType } from "../Term/Type/kinds";
import { ToPType } from "../Term/Type/ts-pluts-conversion";
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
        Type.Lambda( inputType, outputType ),
        dbn => {
            const thisLambdaPtr = dbn + BigInt( 1 );

            const boundVar = new Term<ToPType<A>>(
                inputType as any,
                dbnAccessLevel => new UPLCVar( dbnAccessLevel - thisLambdaPtr )
            );
            
            const body = termFunc( addUtilityForType( inputType )( boundVar ) as any);

            // here the debruijn level is incremented
            return new Lambda( body.toUPLC( thisLambdaPtr ) );
        }
    );

    // define equivalent version but for pairs that are dynamic
    if( isPairType( inputType ) )
    {
        ObjectUtils.defineReadOnlyHiddenProperty(
            lambdaTerm,
            "withDynamicPairAsInput",
            new Term<PLam<ToPType<A>,ToPType<B>>>(
                Type.Lambda( inputType, outputType ),
                dbn => {
                    const thisLambdaPtr = dbn + BigInt( 1 );
    
                    const boundVar = new Term<ToPType<A>>(
                        inputType as any,
                        dbnAccessLevel => new UPLCVar( dbnAccessLevel - thisLambdaPtr )
                    );
                    
                    const body = termFunc(
                        addUtilityForType( inputType )(
                            ObjectUtils.defineReadOnlyHiddenProperty(
                                boundVar,
                                "__isDynamicPair",
                                true
                            )
                        ) as any
                    );
    
                    // here the debruijn level is incremented
                    return new Lambda( body.toUPLC( thisLambdaPtr ) );
                }
            )
        );
    }

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