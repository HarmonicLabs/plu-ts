import { DataConstr } from "@harmoniclabs/plutus-data";
import { handleHoistedAndReturnRoot } from "..";
import { IRApp } from "../../../../IRNodes/IRApp";
import { IRConst } from "../../../../IRNodes/IRConst";
import { IRFunc } from "../../../../IRNodes/IRFunc";
import { IRHoisted } from "../../../../IRNodes/IRHoisted";
import { IRNative } from "../../../../IRNodes/IRNative";
import { IRVar } from "../../../../IRNodes/IRVar";
import { IRTerm } from "../../../../IRTerm";
import { prettyIRText } from "../../../../utils/showIR";


describe("handleHoistedAndReturnRoot", () => {

    test.skip("two inlined", () => {

        let root: IRTerm = new IRApp(
            new IRApp(
                new IRHoisted(
                    new IRFunc( 1,
                        new IRFunc( 1,
                            new IRApp(
                                new IRVar( 0 ),
                                new IRApp(
                                    new IRHoisted( IRNative.sndPair ),
                                    new IRApp(
                                        new IRHoisted( IRNative.unConstrData ),
                                        new IRVar( 1 )
                                    )
                                )
                            )
                        )
                    )
                ),
                new IRHoisted(
                    IRConst.data( new DataConstr( 0, [] ) )
                )
            ),
            new IRFunc( 1, IRConst.int( 1 ) )
        );

        const initalRootClone = root.clone();

        const expected = new IRApp(
            new IRApp(
                new IRFunc( 1,
                    new IRFunc( 1,
                        new IRApp(
                            new IRVar( 0 ),
                            new IRApp(
                                IRNative.sndPair,
                                new IRApp(
                                    IRNative.unConstrData,
                                    new IRVar( 1 )
                                )
                            )
                        )
                    )
                ),
                IRConst.data( new DataConstr( 0, [] ) )
            ),
            new IRFunc( 1, IRConst.int( 1 ) )
        );

        root = handleHoistedAndReturnRoot( root );

        console.log( prettyIRText( expected ) );
        console.log( prettyIRText( root ) );

        expect( root.toJson() )
        .toEqual(
            expected.toJson()
        );

    });

})