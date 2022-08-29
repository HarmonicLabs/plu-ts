import UPLCEncoder, { replaceHoistedTermsInplace } from "..";
import Application from "../../UPLCTerms/Application";
import HoistedUPLC, { getSortedHoistedSet } from "../../UPLCTerms/HoistedUPLC"
import Lambda from "../../UPLCTerms/Lambda";
import UPLCConst from "../../UPLCTerms/UPLCConst";
import UPLCVar from "../../UPLCTerms/UPLCVar";


const hId = new HoistedUPLC( new Lambda( new UPLCVar( 0 ) ) );
const hConst = new HoistedUPLC(
    new Lambda(
        new Lambda(
            new UPLCVar( 1 )
        )
    )
);
const flippedConst = new HoistedUPLC(
    new Lambda(
        new Application(
            new Application(
                hConst,
                hId
            ),
            new UPLCVar( 0 )
        )
    )
);

describe("getSortedHoistedSet",() => {

    

    test("[ id (con int 2) ] ",() => {

        expect( replaceHoistedTermsInplace(
            new Application(
                hId,
                UPLCConst.int( 2 )
            )
        )).toEqual(
            new Application(
                new Lambda(
                    new Application(
                        new UPLCVar( 0 ),
                        UPLCConst.int( 2 )
                    )
                ),
                new Lambda( new UPLCVar( 0 ) )
            )
        );

    });

    test("[ [ const (con int 2) ] (con int 3) ] ",() => {

        expect( replaceHoistedTermsInplace(
            new Application(
                new Application(
                    hConst,
                    UPLCConst.int( 2 )
                ),
                UPLCConst.int( 3 )
            )
        )).toEqual(
            new Application(
                new Lambda(
                    new Application(
                        new Application(
                            new UPLCVar( 0 ),
                            UPLCConst.int( 2 )
                        ),
                        UPLCConst.int( 3 )
                    )
                ),
                new Lambda(
                    new Lambda(
                        new UPLCVar( 1 )
                    )
                )
            )
        );

    });

});