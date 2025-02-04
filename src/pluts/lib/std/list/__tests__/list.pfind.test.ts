import { CEKError, Machine } from "@harmoniclabs/plutus-machine";
import { pList } from "..";
import { IRHoisted, getHoistedTerms } from "../../../../../IR/IRNodes/IRHoisted";
import { compileIRToUPLC } from "../../../../../IR/toUPLC/compileIRToUPLC";
import { showIR } from "../../../../../IR/utils/showIR";
import { int, list } from "../../../../../type_system";
import { pchooseList, peqInt, pif } from "../../../builtins";
import { pfind } from "../pfind"
import { prettyUPLC, showUPLC } from "@harmoniclabs/uplc";
import { pInt } from "../../int/pInt";
import { plam } from "../../../plam";

describe("pfind", () => {

    const lstInt = pList(int);
    const findInt = pfind( int );

    test("fst is 0", () => {
        const term = plam( list( int ), int )
        ( _lst => {

            const fst = _lst.head;
            
            return pchooseList( int, int )
            .$( _lst )
            .caseNil( pInt( 0 ) )
            .caseCons(
                pif( int )
                .$( peqInt.$( 0 ).$( fst ) )
                .then( pInt( 1 ) )
                .else( fst )
            );
        }).$(lstInt([]));

        // console.log( prettyUPLC( term.toUPLC( 0 ) ) );

        const result = Machine.evalSimple( term );

        // console.log( result ); 
        expect( result instanceof CEKError ).toBe( false )
    })

    test("find empty list", () => {
        const term = lstInt([]).find( peqInt.$( 0 ) );

        // console.log( prettyUPLC( term.toUPLC( 0 ) ) );

        const result = Machine.evalSimple( term );

        // console.log( result );
        expect( result instanceof CEKError ).toBe( false )
    });
})