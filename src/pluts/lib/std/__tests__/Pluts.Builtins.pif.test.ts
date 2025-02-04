import { Force, Application, Builtin, UPLCConst, Delay, showUPLC, Lambda, UPLCVar } from "@harmoniclabs/uplc";
import { int } from "../../../../type_system/types";
import { pif, pstrictIf } from "../../builtins";
import { pBool } from "../bool/pBool";
import { pInt } from "../int/pInt";

describe("pif", () => {

    test.skip("'then/else' and '$' (application) are interchangeable", () => {

        const targetIf_42_69 = new Application(
            new Lambda(
                new Force(
                    new Application(
                        new Application(
                            new Application( new UPLCVar( 0 ), UPLCConst.bool( true ) ),
                            new Delay( UPLCConst.int( 42 ) )
                        ),
                        new Delay( UPLCConst.int( 69 ) )
                    )
                )
            ),
            Builtin.ifThenElse
        )
       
    
        expect(
            showUPLC(
                pif( int ).$( pBool( true ) )
                .then( pInt( 42 ) )
                .else( pInt( 69 ))
        
                .toUPLC( 0 )
            )
        ).toEqual(
            showUPLC( targetIf_42_69 )
        )
    
        expect(
    
            pif( int ).$( pBool( true ) )
            .$( pInt( 42 ) )
            .else( pInt( 69 ))
    
            .toUPLC( 0 )
    
        ).toEqual( targetIf_42_69 )
    
        expect(
    
            pif( int ).$( pBool( true ) )
            .then( pInt( 42 ) )
            .$( pInt( 69 ))
    
            .toUPLC( 0 )
    
        ).toEqual( targetIf_42_69 )
    
        expect(
    
            pif( int ).$( pBool( true ) )
            .$( pInt( 42 ) )
            .$( pInt( 69 ))
    
            .toUPLC( 0 )
    
        ).toEqual( targetIf_42_69 )
        
    })


    test.skip("standard compilation", () => {
        expect(
    
            pstrictIf( int ).$( pBool( true ) )
            .$( pInt( 42 ) )
            .$( pInt( 69 ))
    
            .toUPLC( 0 )
            
        ).toEqual(
            new Application(
                new Lambda(
                    new Application(
                        new Application(
                            new Application( new UPLCVar( 0 ), UPLCConst.bool( true ) ),
                            UPLCConst.int( 42 )
                        ),
                        UPLCConst.int( 69 )
                    )
                ),
                Builtin.ifThenElse
            )
        );
    })

})