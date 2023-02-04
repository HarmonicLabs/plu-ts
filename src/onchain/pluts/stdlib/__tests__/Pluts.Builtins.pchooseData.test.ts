import { pchooseData } from "../Builtins";
import { DataConstr } from "../../../../types/Data/DataConstr";
import { Application } from "../../../UPLC/UPLCTerms/Application";
import { Builtin } from "../../../UPLC/UPLCTerms/Builtin";
import { Delay } from "../../../UPLC/UPLCTerms/Delay";
import { Force } from "../../../UPLC/UPLCTerms/Force";
import { UPLCConst } from "../../../UPLC/UPLCTerms/UPLCConst";
import { pData } from "../../PTypes/PData/PData";
import { pInt } from "../../PTypes/PInt";
import { Type } from "../../Term/Type/base";

describe("pchooseData", () => {

    it("'caseConstr/caseMap/caseList/caseI/CaseB' and '$' (application) are interchangeable", () => {

        const target = new Force(
            new Application(
                new Application(
                    new Application(
                        new Application(
                            new Application(
                                new Application(
                                    Builtin.chooseData,
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
        );
    
        expect(
            pchooseData( Type.Int ).$( pData( new DataConstr( 0, [] ) ) )
            .$         ( pInt( 69420 ) )
            .caseMap   ( pInt( 42069 ) )
            .caseList  ( pInt( 420   ) )
            .caseI     ( pInt( 42    ) )
            .caseB     ( pInt( 69    ) )
    
            .toUPLC( 0 )
        ).toEqual( target )
    
        expect(
            pchooseData( Type.Int ).$( pData( new DataConstr( 0, [] ) ) )
            .caseConstr( pInt( 69420 ) )
            .$         ( pInt( 42069 ) )
            .caseList  ( pInt( 420   ) )
            .caseI     ( pInt( 42    ) )
            .caseB     ( pInt( 69    ) )
    
            .toUPLC( 0 )
        ).toEqual( target )
    
        expect(
            pchooseData( Type.Int ).$( pData( new DataConstr( 0, [] ) ) )
            .caseConstr( pInt( 69420 ) )
            .caseMap   ( pInt( 42069 ) )
            .$         ( pInt( 420   ) )
            .caseI     ( pInt( 42    ) )
            .caseB     ( pInt( 69    ) )
    
            .toUPLC( 0 )
        ).toEqual( target )
    
        expect(
            pchooseData( Type.Int ).$( pData( new DataConstr( 0, [] ) ) )
            .caseConstr( pInt( 69420 ) )
            .caseMap   ( pInt( 42069 ) )
            .caseList  ( pInt( 420   ) )
            .$         ( pInt( 42    ) )
            .caseB     ( pInt( 69    ) )
    
            .toUPLC( 0 )
        ).toEqual( target )
    
        expect(
            pchooseData( Type.Int ).$( pData( new DataConstr( 0, [] ) ) )
            .caseConstr( pInt( 69420 ) )
            .caseMap   ( pInt( 42069 ) )
            .caseList  ( pInt( 420   ) )
            .caseI     ( pInt( 42    ) )
            .$         ( pInt( 69    ) )
    
            .toUPLC( 0 )
        ).toEqual( target );
        
        expect(
            pchooseData( Type.Int ).$( pData( new DataConstr( 0, [] ) ) )
            .$         ( pInt( 69420 ) )
            .caseMap   ( pInt( 42069 ) )
            .$         ( pInt( 420   ) )
            .caseI     ( pInt( 42    ) )
            .$         ( pInt( 69    ) )
    
            .toUPLC( 0 )
        ).toEqual( target );

        expect(
            pchooseData( Type.Int ).$( pData( new DataConstr( 0, [] ) ) )
            .caseConstr( pInt( 69420 ) )
            .$         ( pInt( 42069 ) )
            .caseList  ( pInt( 420   ) )
            .$         ( pInt( 42    ) )
            .caseB     ( pInt( 69    ) )
    
            .toUPLC( 0 )
        ).toEqual( target );
    })
    
})