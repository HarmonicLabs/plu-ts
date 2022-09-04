import HoistedUPLC from "../HoistedUPLC"
import Lambda from "../Lambda";
import UPLCVar from "../UPLCVar"


describe("HoistedUPLC", () => {

    test("throws on non closed terms", () => {

        expect(() => new HoistedUPLC( new UPLCVar( 0 ) ) ).toThrow();
        expect(() => new HoistedUPLC( new Lambda( new UPLCVar( 0 ) ) ) ).not.toThrow();
        
    })
})