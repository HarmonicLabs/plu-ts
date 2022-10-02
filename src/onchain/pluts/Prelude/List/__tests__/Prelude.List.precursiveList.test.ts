import { pmatchList, precursiveList } from ".."
import evalScript from "../../../../CEK"
import { pInt } from "../../../PTypes/PInt"
import { pList } from "../../../PTypes/PList"
import { pmakeUnit } from "../../../PTypes/PUnit"
import { papp, pfn, plam } from "../../../Syntax"
import Type, { PrimType } from "../../../Term/Type"


describe("precursiveList", () => {
    
    const elemsT =  Type.Var("elemsT");

    test("different result on nil and cons lists", () => {

        const plength = precursiveList( Type.Int )
            .$(
                plam(
                    Type.Lambda<[ PrimType.List, [PrimType.Int] ],[PrimType.Int]>( Type.List( elemsT ), Type.Int ),
                    Type.Int
                )(
                    ( _self ) => pInt( 0 )
                )
            )
            .$(
                pfn([
                    Type.Lambda<[ PrimType.List, [PrimType.Int] ],[PrimType.Int]>( Type.List( elemsT ), Type.Int ),
                    elemsT,
                    Type.List( elemsT )
                ],
                    Type.Int
                )
                (
                    ( self, _x, xs ) => pInt(1).add( papp( self, xs ) )
                )
            )

    })
    
})