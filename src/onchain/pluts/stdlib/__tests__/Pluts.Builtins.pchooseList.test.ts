import { pchooseList } from "../Builtins";
import Application from "../../../UPLC/UPLCTerms/Application";
import Builtin from "../../../UPLC/UPLCTerms/Builtin";
import Delay from "../../../UPLC/UPLCTerms/Delay";
import Force from "../../../UPLC/UPLCTerms/Force";
import UPLCConst from "../../../UPLC/UPLCTerms/UPLCConst";
import { constT } from "../../../UPLC/UPLCTerms/UPLCConst/ConstType";
import { pBool } from "../../PTypes/PBool";
import { pList } from "../../PTypes/PList";
import { bool, int } from "../../Term/Type/base";

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
            pchooseList( int, bool ).$( pList( int )([]) )
            .caseNil ( pBool( true  ) )
            .caseCons( pBool( false ) )
    
            .toUPLC( 0 )
        ).toEqual( targetChooseListIsNil )
    
        expect(
            pchooseList( int, bool ).$( pList( int )([]) )
            .$       ( pBool( true  ) )
            .caseCons( pBool( false ) )
    
            .toUPLC( 0 )
        ).toEqual( targetChooseListIsNil )
    
        expect(
            pchooseList( int, bool ).$( pList( int )([]) )
            .caseNil ( pBool( true  ) )
            .$       ( pBool( false ) )
    
            .toUPLC( 0 )
        ).toEqual( targetChooseListIsNil )
    
        expect(
            pchooseList( int, bool ).$( pList( int )([]) )
            .$( pBool( true  ) )
            .$( pBool( false ) )
    
            .toUPLC( 0 )
        ).toEqual( targetChooseListIsNil )
        
    })

})