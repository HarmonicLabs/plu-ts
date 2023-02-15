import { Application } from "../../../../UPLC/UPLCTerms/Application"
import { Builtin } from "../../../../UPLC/UPLCTerms/Builtin"
import { Lambda } from "../../../../UPLC/UPLCTerms/Lambda"
import { UPLCConst } from "../../../../UPLC/UPLCTerms/UPLCConst"
import { constT } from "../../../../UPLC/UPLCTerms/UPLCConst/ConstType"
import { UPLCVar } from "../../../../UPLC/UPLCTerms/UPLCVar"
import { Term } from "../../../Term"
import { pInt } from "../../../lib/std/int/pInt"
import { pList, pnil } from "../../../lib/std/list/const"
import { int } from "../../../type_system/types"
import { PInt } from "../../PInt"


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

    test("pList( int )( < any Term<PInt> > ) is a constructed List", () => {

        expect(
            new Lambda(
                pList( int )([
                    new Term<PInt>(
                        int,
                        _dbn => new UPLCVar( 0 )
                    )
                ]).toUPLC( 0 )
            )
        ).toEqual(
            new Lambda(
                new Application(
                    new Application(
                        Builtin.mkCons,
                        new UPLCVar( 0 )
                    ),
                    pnil( int ).toUPLC( 0 )
                )
            )
        );

    })
})