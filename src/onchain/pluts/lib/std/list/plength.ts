import { TermType, int, lam, list } from "../../../type_system";
import { papp } from "../../papp";
import { pfn } from "../../pfn";
import { plam } from "../../plam";
import { pInt } from "../int/pInt";
import { precursiveList } from "./precursiveList";


export const plength = ( elemsT: TermType ) => {

    return precursiveList( int, elemsT )
    .$(
        plam(
            lam( list( elemsT ), int ),
            int
        )(
            ( _self ) => pInt( 0 )
        )
    )
    .$(
        pfn([
            lam( list( elemsT ), int ),
            elemsT,
            list( elemsT )
        ],  int)
        (
            ( self, _x, xs ) => pInt(1).add( papp( self, xs ) )
        )
    )
};