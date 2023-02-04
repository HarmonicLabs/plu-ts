import { TermType, tyVar, Type } from "../../../Term";
import { papp } from "../../papp";
import { pfn } from "../../pfn";
import { plam } from "../../plam";
import { pInt } from "../int/pInt";
import { precursiveList } from "./precursiveList";


export const plength = ( elemsT: TermType = tyVar("plength_elemsT") ) => {

    return precursiveList( Type.Int, elemsT )
    .$(
        plam(
            Type.Lambda( Type.List( elemsT ), Type.Int ),
            Type.Int
        )(
            ( _self ) => pInt( 0 )
        )
    )
    .$(
        pfn([
            Type.Lambda( Type.List( elemsT ), Type.Int ),
            elemsT,
            Type.List( elemsT )
        ],  Type.Int)
        (
            ( self, _x, xs ) => pInt(1).add( papp( self, xs ) )
        )
    )
};