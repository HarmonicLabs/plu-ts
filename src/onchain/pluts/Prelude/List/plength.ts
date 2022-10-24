import { precursiveList } from ".";
import { pInt } from "../../PTypes/PInt";
import { plam, pfn, papp } from "../../Syntax";
import Type, { tyVar } from "../../Term/Type";

export const plength = (() => {

    const elemsT = tyVar("plength_elemsT");

    return precursiveList( Type.Int )
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
})();