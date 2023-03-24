import { toHex } from "@harmoniclabs/uint8array-utils"
import { pfoldr } from ".."
import { Machine } from "../../../../../../CEK"
import { showIR } from "../../../../../../IR/utils/showIR"
import { prettyUPLC, showUPLC } from "../../../../../../UPLC/UPLCTerm"
import { compile } from "../../../../../Script"
import { data, int, list } from "../../../../../type_system"
import { punIData } from "../../../../builtins"
import { pDataI } from "../../../data"
import { pInt } from "../../../int"
import { pList } from "../../const"


const add2 = pfoldr( int, list( int ) )
    .$( ( elem, accum ) => accum.prepend( elem.add( 2 ) ) )
    .$( [] );

const fromDataI = pfoldr( data, list( int ) )
    .$( ( elem, accum ) => accum.prepend( punIData.$( elem ) ) )
    .$( [] ); 
    
const lst = pList( data )([
    pDataI(2),
    pDataI(3),
    pDataI(100)
]);

describe("pfoldr", () => {

    test("add2.$([1,2,3])", () => {

        expect(
            Machine.evalSimple(
                add2.$([1,2,3])
            )
        ).toEqual(
            Machine.evalSimple(
                pList( int )
                ([3,4,5].map( pInt ))
            )
        );

    });

    test.skip("fromDataI; list data", () => {

        console.log( showIR( fromDataI.$(lst).toIR() ) );
        console.log( prettyUPLC( fromDataI.$(lst).toUPLC() ) );

        expect(
            Machine.evalSimple(
                fromDataI.$(lst)
            )
        ).toEqual(
            Machine.evalSimple(
                pList( int )
                ([2,3,100].map( pInt ))
            )
        );

    });

    test.skip("show diffs", () => {
        
        expect(
            showUPLC(
                add2.$([1,2,3]).toUPLC()
            )
        ).toEqual(
            showUPLC(
                fromDataI.$(lst).toUPLC()
            )
        );

    })


})