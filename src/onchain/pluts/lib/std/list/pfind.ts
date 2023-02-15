import { TermFn, PLam, PBool, PList } from "../../../PTypes";
import { TermType, ToPType, fn, lam, bool, list } from "../../../type_system";
import { pif, pisEmpty, phead, ptail } from "../../builtins";
import { papp } from "../../papp";
import { pfn } from "../../pfn";
import { phoist } from "../../phoist";
import { plet } from "../../plet";
import { precursive } from "../../precursive";
import { PMaybeT, PMaybe } from "../PMaybe/PMaybe";

export function pfind<ElemsT extends TermType, PElemsT extends ToPType<ElemsT> = ToPType<ElemsT>>( elemsT: ElemsT )
: TermFn<[ PLam<PElemsT,PBool>, PList<PElemsT> ], PMaybeT<PElemsT>>
{

const PMaybeElem = PMaybe( elemsT ) as any as PMaybeT<PElemsT>;

return phoist(
    precursive(
        pfn([
            fn([
                lam( elemsT, bool ),
                list( elemsT )
            ],  PMaybeElem.type ),
            lam( elemsT, bool ),
            list( elemsT )
        ],  PMaybeElem.type )

        (( self, predicate, _list ) => 
            pif( PMaybeElem.type ).$( pisEmpty.$( _list ) )
            .then( PMaybeElem.Nothing({}) )
            .else(
                plet( phead( elemsT ).$( _list ) ).in( head => 
                    pif( PMaybeElem.type ).$( papp( predicate, head ) )
                    .then( PMaybeElem.Just({ val: head as any }))
                    .else( papp( papp( self, predicate) , ptail( elemsT ).$( _list ) ) )
                )
            )
        )

    )
) as any;
}