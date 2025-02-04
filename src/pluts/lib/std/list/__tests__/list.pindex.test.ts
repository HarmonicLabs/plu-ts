import { Machine } from "@harmoniclabs/plutus-machine";
import { int } from "../../../../../type_system"
import { pInt } from "../../int"
import { pList } from "../const"

describe("pindex", () => {

    test("[1,2,3]", () => {

        const arr: number[]  = new Array( 10 ).fill( 0 ).map( (_, i) => i + 1) ;
        const myList = pList( int )( arr.map( pInt ) );

        for(const n of arr)
        {
            expect(
                Machine.evalSimple(
                    myList.at(n - 1)    
                )
            ).toEqual(
                Machine.evalSimple(
                    pInt( n )
                )
            )
        }
    });

})