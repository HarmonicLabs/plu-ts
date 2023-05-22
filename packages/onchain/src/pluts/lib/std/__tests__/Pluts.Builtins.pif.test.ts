import { Force, Application, Builtin, UPLCConst, Delay } from "@harmoniclabs/uplc";
import { int } from "../../../type_system/types";
import { pif, pstrictIf } from "../../builtins";
import { pBool } from "../bool/pBool";
import { pInt } from "../int/pInt";

describe("pif", () => {

    it("'then/else' and '$' (application) are interchangeable", () => {

        const targetIf_42_69 = new Force(
            new Application(
                new Application(
                    new Application( Builtin.ifThenElse, UPLCConst.bool( true ) ),
                    new Delay( UPLCConst.int( 42 ) )
                ),
                new Delay( UPLCConst.int( 69 ) )
            )
        );
    
        expect(
            pif( int ).$( pBool( true ) )
            .then( pInt( 42 ) )
            .else( pInt( 69 ))
    
            .toUPLC( 0 )
        ).toEqual( targetIf_42_69 )
    
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


    expect(

        pstrictIf( int ).$( pBool( true ) )
        .$( pInt( 42 ) )
        .$( pInt( 69 ))

        .toUPLC( 0 )
        
    ).toEqual(
        new Application(
            new Application(
                new Application( Builtin.ifThenElse, UPLCConst.bool( true ) ),
                UPLCConst.int( 42 )
            ),
            UPLCConst.int( 69 )
        )
    )

})