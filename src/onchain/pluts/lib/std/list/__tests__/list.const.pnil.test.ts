import { showUPLC } from "../../../../../UPLC/UPLCTerm"
import { Application } from "../../../../../UPLC/UPLCTerms/Application"
import { Builtin } from "../../../../../UPLC/UPLCTerms/Builtin"
import { HoistedUPLC } from "../../../../../UPLC/UPLCTerms/HoistedUPLC"
import { UPLCConst } from "../../../../../UPLC/UPLCTerms/UPLCConst"
import { asData, bs, data, int, pair } from "../../../../type_system"
import { pnil } from "../const"

describe("pnil", () => {

    test("just data", () => {

        const received  = showUPLC(
            pnil( data ).toUPLC(0)
        );
        const expected  = showUPLC(
            new HoistedUPLC(
                new Application( Builtin.mkNilData, UPLCConst.unit )
            )
        );

        expect(
            received
        )
        .toEqual(
            expected
        );

    });

    test("pair( data, data )", () => {

        expect(
            showUPLC(
                pnil( pair( data, data ) ).toUPLC(0)
            )
        )
        .toEqual(
            showUPLC(
                new HoistedUPLC(
                    new Application( Builtin.mkNilPairData, UPLCConst.unit )
                )
            )
        );

    });

    test("pair( asData( int ), asData( bs ) )", () => {

        expect(
            showUPLC(
                pnil( pair( asData( int ), asData( bs ) ) ).toUPLC(0)
            )
        )
        .toEqual(
            showUPLC(
                new HoistedUPLC(
                    new Application( Builtin.mkNilPairData, UPLCConst.unit )
                )
            )
        );

    });

    test("pair( data, data )", () => {

        expect(
            showUPLC(
                pnil( pair( data, data ) ).toUPLC(0)
            )
        )
        .toEqual(
            showUPLC(
                new HoistedUPLC(
                    new Application( Builtin.mkNilPairData, UPLCConst.unit )
                )
            )
        );

    });

})