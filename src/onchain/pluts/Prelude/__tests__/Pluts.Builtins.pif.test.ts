import { pif, pstrictIf } from "../Builtins";
import Application from "../../../UPLC/UPLCTerms/Application";
import Builtin from "../../../UPLC/UPLCTerms/Builtin";
import Delay from "../../../UPLC/UPLCTerms/Delay";
import Force from "../../../UPLC/UPLCTerms/Force";
import UPLCConst from "../../../UPLC/UPLCTerms/UPLCConst";
import { pBool } from "../../PTypes/PBool";
import PInt, { pInt } from "../../PTypes/PInt";

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
            pif( PInt ).$( pBool( true ) )
            .then( pInt( 42 ) )
            .else( pInt( 69 ))
    
            .toUPLC( 0 )
        ).toEqual( targetIf_42_69 )
    
        expect(
    
            pif( PInt ).$( pBool( true ) )
            .$( pInt( 42 ) )
            .else( pInt( 69 ))
    
            .toUPLC( 0 )
    
        ).toEqual( targetIf_42_69 )
    
        expect(
    
            pif( PInt ).$( pBool( true ) )
            .then( pInt( 42 ) )
            .$( pInt( 69 ))
    
            .toUPLC( 0 )
    
        ).toEqual( targetIf_42_69 )
    
        expect(
    
            pif( PInt ).$( pBool( true ) )
            .$( pInt( 42 ) )
            .$( pInt( 69 ))
    
            .toUPLC( 0 )
    
        ).toEqual( targetIf_42_69 )
        
    })


    expect(

        pstrictIf( PInt ).$( pBool( true ) )
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