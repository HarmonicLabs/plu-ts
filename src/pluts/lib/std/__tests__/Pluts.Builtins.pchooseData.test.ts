import { DataConstr } from "@harmoniclabs/plutus-data";
import { Force, Application, Builtin, UPLCConst, Delay, showUPLC, UPLCVar, Lambda } from "@harmoniclabs/uplc";
import { int } from "../../../../type_system/types";
import { pchooseData } from "../../builtins";
import { pData } from "../data/pData";
import { pInt } from "../int/pInt";

describe("pchooseData", () => {

    test.skip("'caseConstr/caseMap/caseList/caseI/CaseB' and '$' (application) are interchangeable", () => {

        const target = new Application(
            new Lambda(

                new Force(
                    new Application(
                        new Application(
                            new Application(
                                new Application(
                                    new Application(
                                        new Application(
                                            new UPLCVar( 0 ), // Builtin.chooseData,
                                            UPLCConst.data( new DataConstr( 0, [] ) )
                                        ),
                                        new Delay( UPLCConst.int( 69420 ) ) // caseConstr
                                    ),
                                    new Delay( UPLCConst.int( 42069 ) ) // caseMap
                                ),
                                new Delay( UPLCConst.int( 420 ) ) // caseList
                            ),
                            new Delay( UPLCConst.int( 42 ) ) // caseI
                        ),
                        new Delay( UPLCConst.int( 69 ) ) // caseB
                    )
                )
            ),
            Builtin.chooseData
        );
    
        expect(
            showUPLC(
                pchooseData( int ).$( pData( new DataConstr( 0, [] ) ) )
                .$         ( pInt( 69420 ) )
                .caseMap   ( pInt( 42069 ) )
                .caseList  ( pInt( 420   ) )
                .caseI     ( pInt( 42    ) )
                .caseB     ( pInt( 69    ) )
        
                .toUPLC( 0 )
            )
        ).toEqual( showUPLC( target ) )
    
        expect(
            pchooseData( int ).$( pData( new DataConstr( 0, [] ) ) )
            .caseConstr( pInt( 69420 ) )
            .$         ( pInt( 42069 ) )
            .caseList  ( pInt( 420   ) )
            .caseI     ( pInt( 42    ) )
            .caseB     ( pInt( 69    ) )
    
            .toUPLC( 0 )
        ).toEqual( target )
    
        expect(
            pchooseData( int ).$( pData( new DataConstr( 0, [] ) ) )
            .caseConstr( pInt( 69420 ) )
            .caseMap   ( pInt( 42069 ) )
            .$         ( pInt( 420   ) )
            .caseI     ( pInt( 42    ) )
            .caseB     ( pInt( 69    ) )
    
            .toUPLC( 0 )
        ).toEqual( target )
    
        expect(
            pchooseData( int ).$( pData( new DataConstr( 0, [] ) ) )
            .caseConstr( pInt( 69420 ) )
            .caseMap   ( pInt( 42069 ) )
            .caseList  ( pInt( 420   ) )
            .$         ( pInt( 42    ) )
            .caseB     ( pInt( 69    ) )
    
            .toUPLC( 0 )
        ).toEqual( target )
    
        expect(
            pchooseData( int ).$( pData( new DataConstr( 0, [] ) ) )
            .caseConstr( pInt( 69420 ) )
            .caseMap   ( pInt( 42069 ) )
            .caseList  ( pInt( 420   ) )
            .caseI     ( pInt( 42    ) )
            .$         ( pInt( 69    ) )
    
            .toUPLC( 0 )
        ).toEqual( target );
        
        expect(
            pchooseData( int ).$( pData( new DataConstr( 0, [] ) ) )
            .$         ( pInt( 69420 ) )
            .caseMap   ( pInt( 42069 ) )
            .$         ( pInt( 420   ) )
            .caseI     ( pInt( 42    ) )
            .$         ( pInt( 69    ) )
    
            .toUPLC( 0 )
        ).toEqual( target );

        expect(
            pchooseData( int ).$( pData( new DataConstr( 0, [] ) ) )
            .caseConstr( pInt( 69420 ) )
            .$         ( pInt( 42069 ) )
            .caseList  ( pInt( 420   ) )
            .$         ( pInt( 42    ) )
            .caseB     ( pInt( 69    ) )
    
            .toUPLC( 0 )
        ).toEqual( target );
    })
    
})