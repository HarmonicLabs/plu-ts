import { showUPLC } from "../../../../../UPLC/UPLCTerm"
import { Application } from "../../../../../UPLC/UPLCTerms/Application"
import { Builtin } from "../../../../../UPLC/UPLCTerms/Builtin"
import { HoistedUPLC } from "../../../../../UPLC/UPLCTerms/HoistedUPLC"
import { UPLCConst } from "../../../../../UPLC/UPLCTerms/UPLCConst"
import { Type, data, dynPair, pair } from "../../../../Term/Type/base"
import { pnil } from "../const"

describe("pnil", () => {

    test.only("just data", () => {

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

    test("dataPair( data, data )", () => {

        expect(
            showUPLC(
                pnil( Type.Data.Pair( data, data ) ).toUPLC(0)
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

    test("dynPair( data, data )", () => {

        expect(
            showUPLC(
                pnil( dynPair( data, data ) ).toUPLC(0)
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