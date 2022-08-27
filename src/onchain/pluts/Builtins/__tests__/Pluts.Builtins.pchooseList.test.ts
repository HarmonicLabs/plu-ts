import { pchooseList } from "..";
import Application from "../../../UPLC/UPLCTerms/Application";
import Builtin from "../../../UPLC/UPLCTerms/Builtin";
import Delay from "../../../UPLC/UPLCTerms/Delay";
import Force from "../../../UPLC/UPLCTerms/Force";
import UPLCConst from "../../../UPLC/UPLCTerms/UPLCConst";
import { constT } from "../../../UPLC/UPLCTerms/UPLCConst/ConstType";
import PBool, { pBool } from "../../PTypes/PBool";
import PInt from "../../PTypes/PInt";
import { pList } from "../../PTypes/PList";

describe.skip("pchooseList", () => {

    it("'caseNil/caseCons' and '$' (application) are interchangeable", () => {

        const targetChooseListIsNil = new Force(
            new Application(
                new Application(
                    new Application( Builtin.chooseList, UPLCConst.listOf( constT.int )([]) ),
                    new Delay( UPLCConst.bool( true ) )
                ),
                new Delay( UPLCConst.bool( false ) )
            )
        );

        expect(
            pchooseList( PInt, PBool ).$( pList( PInt )([]) )
            .caseNil ( pBool( true  ) )
            .caseCons( pBool( false ) )
    
            .toUPLC( 0 )
        ).toEqual( targetChooseListIsNil )
    
        expect(
            pchooseList( PInt, PBool ).$( pList( PInt )([]) )
            .$       ( pBool( true  ) )
            .caseCons( pBool( false ) )
    
            .toUPLC( 0 )
        ).toEqual( targetChooseListIsNil )
    
        expect(
            pchooseList( PInt, PBool ).$( pList( PInt )([]) )
            .caseNil ( pBool( true  ) )
            .$       ( pBool( false ) )
    
            .toUPLC( 0 )
        ).toEqual( targetChooseListIsNil )
    
        expect(
            pchooseList( PInt, PBool ).$( pList( PInt )([]) )
            .$( pBool( true  ) )
            .$( pBool( false ) )
    
            .toUPLC( 0 )
        ).toEqual( targetChooseListIsNil )
        
    })

})