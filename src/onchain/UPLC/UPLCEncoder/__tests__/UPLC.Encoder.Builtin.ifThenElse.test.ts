import UPLCEncoder, { serializeBuiltin } from ".."
import BitStream from "../../../../types/bits/BitStream"
import UPLCDecoder from "../../UPLCDecoder"
import UPLCProgram from "../../UPLCProgram"
import UPLCVersion from "../../UPLCProgram/UPLCVersion"
import { showUPLC } from "../../UPLCTerm"
import Application from "../../UPLCTerms/Application"
import Builtin from "../../UPLCTerms/Builtin"
import Force from "../../UPLCTerms/Force"
import Lambda from "../../UPLCTerms/Lambda"
import UPLCConst from "../../UPLCTerms/UPLCConst"


describe("serializeBuiltin", () => {

    describe("ifThenElse", () => {

        test.skip("simple ifThenElse", () => {

            expect(
                serializeBuiltin(
                    Builtin.ifThenElse
                )
            ).toEqual(
                BitStream.fromBinStr([
                    "0101", // force
                    "0111", // builtin
                    "0011010" // UPLCBuiltinTag.ifThenElse.toString(2).padStart(7,'0')
                ].join(''))
            );

        });

        describe("manually compiled", () => {

            test.only("with 3 apps", () => {

                const with3Apps = 
                    new Application( 
                        new Application( 
                            new Application( 
                                Builtin.ifThenElse,
                                UPLCConst.bool( true )
                            ),
                            UPLCConst.int(42)
                        ),
                        UPLCConst.int( 69 )
                    );

                console.log(
                    showUPLC(
                        with3Apps
                    )
                );
    
                const progr = new UPLCProgram(
                    new UPLCVersion( 1, 0, 0 ),
                    with3Apps
                );
    
                expect(
                    UPLCDecoder.parse(
                        UPLCEncoder.compile(
                            progr
                        ).toBuffer().buffer,
                        "flat"
                    )
                ).toEqual(
                    progr
                )

            })

            test("after some lambdas", () => {

                const noIdeaHowIGotHere =
                new Application(
                    new Lambda( // a
                        new Application(
                            new Lambda( // b
                                new Application(
                                    new Lambda( // c
                                        new Application(
                                            new Lambda( // d
                                                new Lambda( new Lambda( new Lambda( // e f g
                                                    new Force(
                                                        new Application( new Application( new Application( 
                                                            Builtin.ifThenElse,
                                                            new Application( new Application( new Application(
                                                                new Lambda( new Lambda( new Lambda( // h i l
                                                                    new Application(
                                                                        new Lambda( // m
                                                                            new Application(
                                                                                new Lambda( // o
                                                                                    UPLCConst.unit
                                                                                ),
                                                                                UPLCConst.unit
                                                                            ) 
                                                                        ),
                                                                        UPLCConst.unit
                                                                    )
                                                                ) ) ), UPLCConst.unit
                                                            ), UPLCConst.unit ), UPLCConst.unit )
                                                        ), UPLCConst.unit ), UPLCConst.unit )
                                                    )
                                                ) ) )
                                            ),
                                            UPLCConst.unit
                                        )
                                    ),
                                    UPLCConst.unit
                                )
                            ),
                            UPLCConst.unit
                        )
                    ),
                    UPLCConst.unit
                );
    
            })
    
        })
        
        test("after some lambdas", () => {

            const noIdeaHowIGotHere =
            new Application(
                new Lambda( // a
                    new Application(
                        new Lambda( // b
                            new Application(
                                new Lambda( // c
                                    new Application(
                                        new Lambda( // d
                                            new Lambda( new Lambda( new Lambda( // e f g
                                                new Force(
                                                    new Application( new Application( new Application( 
                                                        Builtin.ifThenElse,
                                                        new Application( new Application( new Application(
                                                            new Lambda( new Lambda( new Lambda( // h i l
                                                                new Application(
                                                                    new Lambda( // m
                                                                        new Application(
                                                                            new Lambda( // o
                                                                                UPLCConst.unit
                                                                            ),
                                                                            UPLCConst.unit
                                                                        ) 
                                                                    ),
                                                                    UPLCConst.unit
                                                                )
                                                            ) ) ), UPLCConst.unit
                                                        ), UPLCConst.unit ), UPLCConst.unit )
                                                    ), UPLCConst.unit ), UPLCConst.unit )
                                                )
                                            ) ) )
                                        ),
                                        UPLCConst.unit
                                    )
                                ),
                                UPLCConst.unit
                            )
                        ),
                        UPLCConst.unit
                    )
                ),
                UPLCConst.unit
            );

            console.log(
                showUPLC(
                    noIdeaHowIGotHere
                )
            );

            const progr = new UPLCProgram(
                new UPLCVersion( 1, 0, 0 ),
                noIdeaHowIGotHere
            );

            expect(
                UPLCDecoder.parse(
                    UPLCEncoder.compile(
                        progr
                    ).toBuffer().buffer,
                    "flat"
                )
            ).toEqual(
                progr
            )

        })

    })

})