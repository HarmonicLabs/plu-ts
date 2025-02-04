import { Lambda, UPLCConst } from "@harmoniclabs/uplc";
import { productionOptions } from "../../../IR/toUPLC/CompilerOptions";
import { data, unit } from "../../../type_system";
import { pfn, pmakeUnit } from "../../lib";

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