import { Application } from "../../../UPLC/UPLCTerms/Application";
import { HoistedUPLC } from "../../../UPLC/UPLCTerms/HoistedUPLC";
import { genHoistedSourceUID } from "../../../UPLC/UPLCTerms/HoistedUPLC/HoistedSourceUID/genHoistedSourceUID";
import { Lambda } from "../../../UPLC/UPLCTerms/Lambda";
import { UPLCVar } from "../../../UPLC/UPLCTerms/UPLCVar";

const _pflipUPLCUID  = genHoistedSourceUID();
// identicall to `pflip` just at UPLC level to avoid using `papp`
export const _pflipUPLC = new HoistedUPLC(
    new Lambda( // toFlip
        new Lambda( // secondArg
            new Lambda( // firstArg
                new Application(
                    new Application(
                        new UPLCVar( 2 ),   // toFlip,
                        new UPLCVar( 0 )    // firstArg
                    ),
                    new UPLCVar( 1 )        // secondArg
                )
            )
        )
    ),
    _pflipUPLCUID
);