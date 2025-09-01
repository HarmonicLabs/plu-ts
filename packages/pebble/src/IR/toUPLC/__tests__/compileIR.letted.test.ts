import { IRApp } from "../../IRNodes/IRApp";
import { IRDelayed } from "../../IRNodes/IRDelayed";
import { IRForced } from "../../IRNodes/IRForced";
import { IRFunc } from "../../IRNodes/IRFunc";
import { IRLetted } from "../../IRNodes/IRLetted";
import { IRVar } from "../../IRNodes/IRVar";
import { IRTerm } from "../../IRTerm";
import { handleLettedAndReturnRoot } from "../subRoutines/handleLetted/index";
import { _ir_apps } from "../../tree_utils/_ir_apps";
import { prettyIRJsonStr } from "../../utils/showIR";


describe("compileIRToUPLC", () => {

    describe("letted", () => {

        test("keeps different scope", () => {

            let irTree: IRTerm = new IRForced(
                new IRDelayed(
                    new IRApp(
                        new IRFunc(1,
                            new IRLetted(
                                1,
                                new IRDelayed(
                                    new IRVar(0)
                                )
                            )
                        ),
                        new IRFunc( 1,
                            new IRLetted(
                                1,
                                new IRDelayed(
                                    new IRVar(0)
                                )
                            )
                        )
                    )
                )
            );

            // const beforeTree = prettyIRJsonStr( irTree );
            irTree = handleLettedAndReturnRoot( irTree );

            expect(
                irTree.toJson()
            ).toEqual(
                new IRForced(
                    new IRDelayed(
                        new IRApp(
                            new IRFunc(1,
                                new IRDelayed(
                                    new IRVar(0)
                                )
                            ),
                            new IRFunc( 1,
                                new IRDelayed(
                                    new IRVar(0)
                                )
                            )
                        )
                    )
                ).toJson()
            );

        });

        test("same scope; different DeBruijn", () => {

            // we use `IRDelayed` because plain `IRVars`a re inlined
            let tree: IRTerm = new IRFunc(
                1,
                new IRApp(
                    new IRFunc(
                        2,
                        new IRLetted(
                            3,
                            new IRDelayed(
                                new IRVar(2)
                            )
                        )
                    ),
                    new IRLetted(
                        1,
                        new IRDelayed(
                            new IRVar(0)
                        )
                    )
                )
            );

            expect(
                (tree as any).body.fn.body.hash
            ).toEqual(
                (tree as any).body.arg.hash
            );

            tree = handleLettedAndReturnRoot( tree )

            expect( tree.toJson() )
            .toEqual(
                new IRFunc(
                    1,
                    new IRApp(
                        new IRFunc(
                            1,
                            new IRApp(
                                new IRFunc(
                                    2,
                                    new IRVar( 2 )
                                ),
                                new IRVar( 0 )
                            )
                        ),
                        new IRDelayed(
                            new IRVar( 0 )
                        )
                    )
                ).toJson()
            );
 
        });

    });

});