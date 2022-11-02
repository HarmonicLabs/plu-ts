import JsRuntime from "../../../utils/JsRuntime";
import PLam, { TermFn } from "../PTypes/PFn/PLam";
import { papp, pfn, phoist } from "../Syntax";
import { PrimType, TermType, ToPType } from "../Term/Type";
import { typeExtends } from "../Term/Type/extension";
import { isLambdaType } from "../Term/Type/kinds";


export function compose<A extends TermType, B extends TermType, C extends TermType>
    ( funcBToCType: [ PrimType.Lambda, B, C ] , funcAToBType: [ PrimType.Lambda, A, B ] )
    : TermFn<[ PLam<ToPType<B>, ToPType<C>>, PLam<ToPType<A>, ToPType<B>>, ToPType<A> ], ToPType<C>>
{
    JsRuntime.assert(
        isLambdaType( funcAToBType ) &&
        isLambdaType( funcBToCType ),
        "not lambda types"
    );

    const a = funcAToBType[1];
    const _b = funcAToBType[2];
    const b = funcBToCType[1];
    const c = funcBToCType[2];

    JsRuntime.assert(
        typeExtends( _b, b ),
        "cannot compose funcitons"
    );

    return phoist(
        pfn([
            funcBToCType,
            funcAToBType,
            a
        ],  c
        )(( bToC, aToB, _a ) => {
            return papp( bToC, papp( aToB, _a ) ) as any;
        })
    ) as any;
}