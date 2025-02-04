import { UPLCConst, constT, Lambda, Application, Builtin, UPLCVar, showUPLC } from "@harmoniclabs/uplc"
import { IRVar } from "../../../../IR/IRNodes/IRVar"
import { Term } from "../../../Term"
import { pInt } from "../../../lib/std/int/pInt"
import { pList, pnil } from "../../../lib/std/list/const"
import { int } from "../../../../type_system/types"
import { PInt } from "../../PInt"
import { IRConst } from "../../../../IR"


describe("pList", () => {

    test("pList( int )([]) is Nil", () => {

        const expectNil = expect(
            pList( int )([]).toUPLC( 0 )
        );

        expectNil.toEqual(
            UPLCConst.listOf( constT.int )([])
        );

        expectNil.toEqual(
            pnil( int ).toUPLC( 0 )
        );
        
    })

    test("pList( Type.Any )( < only constants > ) is an UPLCConst", () => {

        expect(
            pList( int )([ pInt( 2 ), pInt( 3 ), pInt( 4 ) ]).toUPLC( 0 )
        ).toEqual(
            UPLCConst.listOf( constT.int )([ 2, 3, 4 ] as any )
        );

    })

    test.skip("pList( int )( < any Term<PInt> > ) is a constructed List", () => {

        expect(
            showUPLC(
                pList( int )([
                    // don't use pInt here
                    // we don't tell the compiler this is a constant
                    // otherwise it will be optimized
                    new Term<PInt>(
                        int,
                        _dbn => IRConst.int( 42 )
                    )
                ]).toUPLC( 0 )
            )
        ).toEqual(
            showUPLC(
                new Application(
                    new Lambda(
                        new Application(
                            new Application(
                                new UPLCVar( 0 ), // Builtin.mkCons,
                                UPLCConst.int( 42 )
                            ),
                            pnil( int ).toUPLC( 0 )
                        )
                    ),
                    Builtin.mkCons
                )
            )
            
        );

    })
})