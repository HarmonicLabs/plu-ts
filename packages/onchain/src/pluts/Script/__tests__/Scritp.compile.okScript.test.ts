import { Lambda, UPLCConst } from "@harmoniclabs/uplc";
import { data, pfn, pmakeUnit, unit } from "../../../.."

test("okScript", () => {

    const okScript = pfn([ data, data, data ], unit )
    (( d, r, c ) => pmakeUnit());

    expect(
        okScript.toUPLC()
    ).toEqual(
        new Lambda(
            new Lambda(
                new Lambda(
                    UPLCConst.unit
                )
            )
        )
    )

})