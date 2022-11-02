import palias from ".."
import evalScript from "../../../../CEK";
import UPLCConst from "../../../../UPLC/UPLCTerms/UPLCConst";
import { padd } from "../../../stdlib/Builtins";
import { pfn } from "../../../Syntax";
import { int } from "../../../Term/Type"
import { pInt } from "../../PInt";


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

    test("original types can't be used in place of aliases", () => {

        const fancyAdd = pfn(
            [
                FancyInt.type,
                FancyInt.type
            ],
            FancyInt.type
        )(
            (fInt1, fInt2) => padd.$( fInt1 as any ).$( fInt2 as any )
        );

        expect(
            evalScript(
                fancyAdd.$( fancy69 ).$( fancy69 )
            )
        ).toEqual( UPLCConst.int( 69 * 2 ) );

        expect(
            () => evalScript(
                fancyAdd.$( fancy69 ).$( pInt(1) )
            )
        ).toThrow();

        expect(
            () => evalScript(
                fancyAdd.$( pInt(1) ).$( fancy69 )
            )
        ).toThrow();

        expect(
            () => evalScript(
                fancyAdd.$( pInt(1) ).$( pInt(1) )
            )
        ).toThrow();

    });

})