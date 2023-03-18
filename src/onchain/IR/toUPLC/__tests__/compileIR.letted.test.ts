import { logJson } from "../../../../utils/ts/ToJson";
import { IRApp } from "../../IRNodes/IRApp";
import { IRDelayed } from "../../IRNodes/IRDelayed";
import { IRForced } from "../../IRNodes/IRForced";
import { IRFunc } from "../../IRNodes/IRFunc";
import { IRLetted } from "../../IRNodes/IRLetted";
import { IRVar } from "../../IRNodes/IRVar";
import { IRTerm } from "../../IRTerm";
import { handleLettedAndReturnRoot } from "../subRoutines/handleLettedAndReturnRoot/index";


describe("compileIRToUPLC", () => {

    describe("letted", () => {

        test("keeps scope", () => {

            let irTree: IRTerm = new IRForced(
                new IRDelayed(
                    new IRApp(
                        new IRFunc(1,
                            new IRLetted(
                                new IRVar(0)
                            )
                        ),
                        new IRFunc( 1,
                            new IRLetted(
                                new IRVar( 0 )
                            )
                        )
                    )
                )
            );

            irTree = handleLettedAndReturnRoot( irTree );

            logJson( irTree );

            expect(
                irTree.toJson()
            ).toEqual(
                new IRForced(
                    new IRDelayed(
                        new IRApp(
                            new IRFunc(1,
                                new IRVar(0)
                            ),
                            new IRFunc( 1,
                                new IRVar(0)
                            )
                        )
                    )
                ).toJson()
            );

        });

        test("same scope; different DeBruijn", () => {

            const tree = new IRFunc(
                1,
                new IRApp(
                    new IRFunc(
                        2,
                        new IRLetted(
                            new IRVar(2)
                        )
                    ),
                    new IRLetted(
                        new IRVar(0)
                    )
                )
            );

            handleLettedAndReturnRoot( tree )

            expect( tree.toJson() )
            .toEqual(
                new IRFunc(
                    1,
                    // new IRApp(
                    //     new IRFunc(
                    //         1,
                            new IRApp(
                                new IRFunc(
                                    2,
                                    new IRVar( 2 )
                                ),
                                new IRVar( 0 )
                            )
                    //     ),
                    //     new IRVar( 0 )
                    // )
                ).toJson()
            )
        });

    });


});