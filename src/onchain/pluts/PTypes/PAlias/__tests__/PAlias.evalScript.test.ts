import { palias } from "../palias"
import { evalScript } from "../../../../CEK";
import { UPLCConst } from "../../../../UPLC/UPLCTerms/UPLCConst";
import { int } from "../../../Term/Type/base"
import { pInt } from "../../../lib/std/int/pInt";


describe("palias", () => {

    const FancyInt = palias( int );
    const fancy69 = FancyInt.from( pInt(69) )

    test("evaluates to the aliased type", () => {

        expect(
            evalScript(
                fancy69
            )
        ).toEqual( UPLCConst.int( 69 ) )

    });

    test("aliases can be used in place of original types", () => {

        expect(
            evalScript(
                pInt(1).add( fancy69 as any )
            )
        ).toEqual( UPLCConst.int( 69 + 1 ) )

    });


})