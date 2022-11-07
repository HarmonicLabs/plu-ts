import { isPureUPLCTerm } from "../../UPLCTerm"
import Application from "../Application"
import HoistedUPLC from "../HoistedUPLC"
import Lambda from "../Lambda"
import UPLCConst from "../UPLCConst"
import UPLCVar from "../UPLCVar"

describe("isPureUPLCTerm", () => {
    
    const hoistedId = new HoistedUPLC( new Lambda( new UPLCVar( 0 ) ) );
    const hoistedConst = new HoistedUPLC(
        new Lambda(
            new Lambda(
                new UPLCVar( 1 )
            )
        )
    );
    const flippedConst =new Lambda(
        new Application(
            new Application(
                hoistedConst,
                hoistedId
            ),
            new UPLCVar( 0 )
        )
    );
    
    it("return false if contains an HoistedUPLC", () => {

        expect( isPureUPLCTerm( new HoistedUPLC( UPLCConst.unit ) ) ).toBe( false );
        expect( isPureUPLCTerm( flippedConst ) ).toBe( false );

    });

    it("return true if DOESN'T contain any HoistedUPLC", () => {

        expect( isPureUPLCTerm( new HoistedUPLC( UPLCConst.unit ) ) ).toBe( false );
        expect( isPureUPLCTerm( flippedConst ) ).toBe( false );

    });

})