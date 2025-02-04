import { Force, Application, Builtin, UPLCConst, constT, Delay } from "@harmoniclabs/uplc";
import { bool, int } from "../../../../type_system/types";
import { pchooseList } from "../../builtins";
import { pBool } from "../bool/pBool";
import { pList } from "../list/const";

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