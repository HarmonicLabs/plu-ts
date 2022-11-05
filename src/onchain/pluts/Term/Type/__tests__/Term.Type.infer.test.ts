import Type, { TypeShortcut } from "../base"
import DataConstr from "../../../../../types/Data/DataConstr";
import ByteString from "../../../../../types/HexString/ByteString";
import UPLCTerm from "../../../../UPLC/UPLCTerm";
import Application from "../../../../UPLC/UPLCTerms/Application";
import Builtin from "../../../../UPLC/UPLCTerms/Builtin";
import Lambda from "../../../../UPLC/UPLCTerms/Lambda";
import UPLCConst from "../../../../UPLC/UPLCTerms/UPLCConst";
import { constT } from "../../../../UPLC/UPLCTerms/UPLCConst/ConstType";
import UPLCVar from "../../../../UPLC/UPLCTerms/UPLCVar";
import { inferTypeFromUPLC } from "../infer";
import { termTypeToString } from "../utils";

const { lam, fn, bool, int, str, bs, unit, list, map, delayed } = TypeShortcut;

describe("infer", () => {

    test("constants", () => {

        expect(
            inferTypeFromUPLC(
                UPLCConst.int( 2 )
            )
        ).toEqual( int )

        expect(
            inferTypeFromUPLC(
                UPLCConst.bool( true )
            )
        ).toEqual( bool )

        expect(
            inferTypeFromUPLC(
                UPLCConst.byteString( new ByteString("") )
            )
        ).toEqual( bs )

        expect(
            inferTypeFromUPLC(
                UPLCConst.data( new DataConstr( 0 , [] ) )
            )
        ).toEqual( Type.Data.Any )

        expect(
            inferTypeFromUPLC(
                UPLCConst.listOf( constT.int )([])
            )
        ).toEqual( list( int ) )

    })

    test("builtin application", () => {
        
        const a = Type.Var("a");

        /*
        in order to compare parametrized types
        we need to convert them to strings
        since symbols are unique
        */
        
        expect(
            termTypeToString(
                inferTypeFromUPLC( Builtin.ifThenElse )
            )
        ).toEqual(
            termTypeToString(
                fn([ bool, a, a ], a )
            )
        );

        expect(
            termTypeToString(
                inferTypeFromUPLC(
                    new Application(
                        Builtin.ifThenElse,
                        UPLCConst.bool( true )
                    )
                )
            )
        ).toEqual(
            termTypeToString(
                fn([ a, a ], a )
            )
        )

        expect(
            inferTypeFromUPLC(
                new Application(
                    new Application(
                        Builtin.ifThenElse,
                        UPLCConst.bool( true )
                    ),
                    UPLCConst.int( 2 )
                )
            )
        ).toEqual(
            lam( int, int )
        )

        expect(
            inferTypeFromUPLC(
                new Application(
                    new Application(
                        Builtin.ifThenElse,
                        UPLCConst.bool( true )
                    ),
                    UPLCConst.bool( false )
                )
            )
        ).toEqual(
            lam( bool, bool )
        )
        
        expect(
            inferTypeFromUPLC(
                new Application(
                    new Application(
                        new Application(
                            Builtin.ifThenElse,
                            UPLCConst.bool( true )
                        ),
                        UPLCConst.int( 2 )
                    ),
                    UPLCConst.int( 3 )
                )
            )
        ).toEqual(
            int
        )
        
    })

    test.only("lambdas", () => {

        expect(
            inferTypeFromUPLC(
                new Lambda(
                    new Application(
                        new Application(
                            new Application(
                                Builtin.ifThenElse,
                                UPLCConst.bool( true )
                            ),
                            UPLCConst.int( 2 )
                        ),
                        new UPLCVar( 0 )
                    )
                )
            )
        ).toEqual(
            lam( int, int )
        );
        
    })

})