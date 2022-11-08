import evalScript from ".."
import { pstrictIf } from "../../pluts/stdlib/Builtins"
import { pInt } from "../../pluts/PTypes/PInt"
import Type from "../../pluts/Term/Type/base"
import Application from "../../UPLC/UPLCTerms/Application"
import Builtin from "../../UPLC/UPLCTerms/Builtin"
import Delay from "../../UPLC/UPLCTerms/Delay"
import Force from "../../UPLC/UPLCTerms/Force"
import UPLCConst from "../../UPLC/UPLCTerms/UPLCConst"

describe("CEK :: evalScript", () => {

    describe("ifThenElse", () => {

        test("if( true ) 1 2 -> 1", () => {

            expect(
                evalScript(
                    new Application(
                        new Application(
                            new Application(
                                Builtin.ifThenElse,
                                UPLCConst.bool( true )
                            ),
                            UPLCConst.int( 1 )
                        ),
                        UPLCConst.int( 2 )
                    )
                )
            ).toEqual(
                UPLCConst.int( 1 )
            );

        })

        test("if( false ) 1 2 -> 2", () => {

            expect(
                evalScript(
                    new Application(
                        new Application(
                            new Application(
                                Builtin.ifThenElse,
                                UPLCConst.bool( false )
                            ),
                            UPLCConst.int( 1 )
                        ),
                        UPLCConst.int( 2 )
                    )
                )
            ).toEqual(
                UPLCConst.int( 2 )
            );
            
        })

        test("if( 0 === 0 ) 1 2 -> 1", () => {

            expect(
                evalScript(
                    pstrictIf( Type.Any ).$( pInt( 0 ).eq( pInt( 0 ) ) )
                    .$( pInt( 1 ) )
                    .$( pInt( 2 ) )
                    .toUPLC( 0 )
                )
            ).toEqual(
                UPLCConst.int( 1 )
            );
            
        })

        test("partial forced", () => {

            const mkPartialForce = ( condition: boolean ) => {
                return new Force(
                    new Application(
                        new Application(
                            new Application(
                                Builtin.ifThenElse, UPLCConst.bool( condition )
                            ),
                            UPLCConst.int( 1 )
                        ),
                        new Delay( UPLCConst.int( 2 ) )
                    )
                )
            }

            expect(
                evalScript(
                    mkPartialForce( true )
                )
            ).toEqual(
                UPLCConst.int( 1 )
            );

            expect(
                evalScript(
                    mkPartialForce( false )
                )
            ).toEqual(
                UPLCConst.int( 2 )
            );
        })
    })

})