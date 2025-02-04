import { TermType, bool, fn, list } from "../../../../../type_system";
import { papp } from "../../../papp";
import { pfn } from "../../../pfn";
import { phoist } from "../../../phoist";
import { pstdEq } from "../../stdEq";

export function pincludes<
    ElemsT extends TermType
>( 
    elems_t: ElemsT
)
{
    return phoist(
        phoist(
            pfn([
                fn([ elems_t, elems_t ], bool ),
                list( elems_t ),
                elems_t
            ],  bool)
            (( eqFn, lst, elem ) => lst.some( papp( eqFn, elem ) ), "mk_pincludes")
        ).$(
            pstdEq( elems_t )
        )
    )
}