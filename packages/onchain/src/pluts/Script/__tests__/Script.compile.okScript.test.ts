import { Lambda, UPLCConst } from "@harmoniclabs/uplc";
import { data, pfn, pmakeUnit, unit } from "../..";
import { productionOptions } from "../../../IR/toUPLC/CompilerOptions";

test("okScript", () => {

    const okScript = pfn([ data, data, data ], unit )
    (( d, r, c ) => pmakeUnit());

    expect(
        okScript.toUPLC(0, { ...productionOptions, addMarker: false })
    ).toEqual(
        new Lambda(
            new Lambda(
                new Lambda(
                    UPLCConst.unit
                )
            )
        )
    );

})