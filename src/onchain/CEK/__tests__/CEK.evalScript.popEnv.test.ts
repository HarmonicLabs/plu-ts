import evalScript from "..";
import Application from "../../UPLC/UPLCTerms/Application";
import Builtin from "../../UPLC/UPLCTerms/Builtin";
import Lambda from "../../UPLC/UPLCTerms/Lambda";
import UPLCConst from "../../UPLC/UPLCTerms/UPLCConst";
import UPLCVar from "../../UPLC/UPLCTerms/UPLCVar";

describe(" CEK :: evalScript ", () => {
    
    test("env.pop", () => {
        
        expect(
            evalScript(
                new Application(
                    new Application(
                        new Lambda(
                            new Lambda(
                                new Application(
                                    new Application(
                                        new Application(
                                            Builtin.ifThenElse,
                                            UPLCConst.bool( true )
                                        ),
                                        new UPLCVar( 1 ),
                                    ),
                                    new UPLCVar( 0 )
                                )
                            )
                        ),
                        UPLCConst.int( 42 )
                    ),
                    new Application(
                        new Lambda(
                            new Application(
                                new Application(
                                    Builtin.addInteger,
                                    UPLCConst.int( 2 )
                                ),
                                new UPLCVar( 0 )
                            )
                        ),
                        UPLCConst.int( 67 )
                    )
                )
            )
        ).toEqual(
            UPLCConst.int( 42 )
        );

    });

})