import { handleHoistedAndReturnRoot } from "..";
import { DataConstr } from "../../../../../../types/Data";
import { showUPLC } from "../../../../../UPLC/UPLCTerm";
import { IRApp } from "../../../../IRNodes/IRApp";
import { IRConst } from "../../../../IRNodes/IRConst";
import { IRFunc } from "../../../../IRNodes/IRFunc";
import { IRHoisted } from "../../../../IRNodes/IRHoisted";
import { IRNative } from "../../../../IRNodes/IRNative";
import { IRVar } from "../../../../IRNodes/IRVar";
import { IRTerm } from "../../../../IRTerm";
import { compileIRToUPLC } from "../../../compileIRToUPLC";


describe("handleHoistedAndReturnRoot", () => {

    test("two inlined", () => {

        let root: IRTerm = new IRApp(
            new IRApp(
                new IRHoisted(
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
                    )
                ),
                new IRHoisted(
                    IRConst.data( new DataConstr( 0, [] ) )
                )
            ),
            new IRFunc( 1, IRConst.int( 1 ) )
        );

        const initalRootClone = root.clone();

        root = handleHoistedAndReturnRoot( root );

        expect( root.toJson() )
        .toEqual(
            new IRApp(
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
            ).toJson()
        );

        console.log( showUPLC( root.toUPLC() ) )

        console.log( showUPLC( compileIRToUPLC( initalRootClone ) ) )

    });

})