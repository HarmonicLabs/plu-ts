import { showUPLC } from "../../../../../UPLC/UPLCTerm"
import { Application } from "../../../../../UPLC/UPLCTerms/Application"
import { Builtin } from "../../../../../UPLC/UPLCTerms/Builtin"
import { HoistedUPLC } from "../../../../../UPLC/UPLCTerms/HoistedUPLC"
import { genHoistedSourceUID } from "../../../../../UPLC/UPLCTerms/HoistedUPLC/HoistedSourceUID/genHoistedSourceUID"
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
                new Application( Builtin.mkNilData, UPLCConst.unit ),
                genHoistedSourceUID() // doesn't matter
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
                    new Application( Builtin.mkNilPairData, UPLCConst.unit ),
                    genHoistedSourceUID() // doesn't matter
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
                    new Application( Builtin.mkNilPairData, UPLCConst.unit ),
                    genHoistedSourceUID() // doesn't matter
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
                    new Application( Builtin.mkNilPairData, UPLCConst.unit ),
                    genHoistedSourceUID() // doesn't matter
                )
            )
        );

    });

})