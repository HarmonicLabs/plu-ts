import { TermType, delayed, int, lam, list } from "../../../../type_system";
import { papp } from "../../papp";
import { pdelay } from "../../pdelay";
import { pfn } from "../../pfn";
import { phoist } from "../../phoist";
import { plam } from "../../plam";
import { pInt } from "../int/pInt";
import { precursiveList } from "./precursiveList";


export const plength = ( elemsT: TermType ) => {

    return phoist(
        precursiveList( int, elemsT )
        .$(
            plam(
                lam( list( elemsT ), int ),
                delayed(int)
            )
            (_self => pdelay( pInt( 0 ) ) )
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

    )
};