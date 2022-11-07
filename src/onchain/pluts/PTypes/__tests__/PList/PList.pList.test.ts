import Application from "../../../../UPLC/UPLCTerms/Application"
import Builtin from "../../../../UPLC/UPLCTerms/Builtin"
import Lambda from "../../../../UPLC/UPLCTerms/Lambda"
import UPLCConst from "../../../../UPLC/UPLCTerms/UPLCConst"
import { constT } from "../../../../UPLC/UPLCTerms/UPLCConst/ConstType"
import UPLCVar from "../../../../UPLC/UPLCTerms/UPLCVar"
import { pprepend } from "../../../stdlib/Builtins"
import Term from "../../../Term"
import Type from "../../../Term/Type/base"
import PInt, { pInt } from "../../PInt"
import { pList, pnil } from "../../PList"


describe("pList", () => {

    test("pList( Type.Int )([]) is Nil", () => {

        const expectNil = expect(
            pList( Type.Int )([]).toUPLC( 0 )
        );

        expectNil.toEqual(
            UPLCConst.listOf( constT.int )([])
        );

        expectNil.toEqual(
            pnil( Type.Int ).toUPLC( 0 )
        );
        
    })

    test("pList( Type.Any )( < only constants > ) is an UPLCConst", () => {

        expect(
            pList( Type.Int )([ pInt( 2 ), pInt( 3 ), pInt( 4 ) ]).toUPLC( 0 )
        ).toEqual(
            UPLCConst.listOf( constT.int )([ 2, 3, 4 ] as any )
        );

    })

    test("pList( Type.Int )( < any Term<PInt> > ) is a constructed List", () => {

        expect(
            new Lambda(
                pList( Type.Int )([
                    new Term<PInt>(
                        Type.Int,
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
                    pnil( Type.Int ).toUPLC( 0 )
                )
            )
        );

    })
})