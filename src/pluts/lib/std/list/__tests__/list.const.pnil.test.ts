import { Application, Builtin, UPLCConst, showUPLC } from "@harmoniclabs/uplc";
import { bs, data, int, pair } from "../../../../../type_system"
import { pnil } from "../const"
import { debugOptions } from "../../../../../IR/toUPLC/CompilerOptions";

describe("pnil", () => {

    test("just data", () => {

        const received  = showUPLC(
            pnil( data ).toUPLC(0, debugOptions)
        );
        const expected  = showUPLC(
            new Application( Builtin.mkNilData, UPLCConst.unit )
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
                pnil( pair( data, data ) ).toUPLC(0, debugOptions)
            )
        )
        .toEqual(
            showUPLC(
                new Application( Builtin.mkNilPairData, UPLCConst.unit ) 
            )
        );

    });

    test("pair( int, bs ) (still data elems)", () => {

        expect(
            showUPLC(
                pnil( pair( int, bs ) ).toUPLC(0, debugOptions)
            )
        )
        .toEqual(
            showUPLC(
                new Application( Builtin.mkNilPairData, UPLCConst.unit )
            )
        );

    });

    test("pair( data, data )", () => {

        expect(
            showUPLC(
                pnil( pair( data, data ) ).toUPLC(0, debugOptions)
            )
        )
        .toEqual(
            showUPLC(
                new Application( Builtin.mkNilPairData, UPLCConst.unit )
            )
        );

    });

})