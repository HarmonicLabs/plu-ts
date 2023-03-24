import { Machine, pInt, pmap, punIData, punListData } from "../../../../../..";
import { DataI, DataList } from "../../../../../../../types/Data"
import { showIR } from "../../../../../../IR/utils/showIR";
import { prettyUPLC } from "../../../../../../UPLC/UPLCTerm";
import { data, int, list } from "../../../../../type_system";
import { pData, pDataI } from "../../pData";
import { fromData } from "../fromData";


const d = new DataList([
    new DataI(2),
    new DataI(3),
    new DataI(100),
]);

const pd = pData( d );

describe("fromData", () => {

    test.only("just unListData", () => {

        const plistInt = punListData.$( pd );

        console.log( showIR( plistInt.toIR() ) );
        console.log( prettyUPLC( plistInt.toUPLC() ) );

        console.log(
            Machine.evalSimple(
                plistInt
            )
        );

        expect(
            Machine.evalSimple(
                plistInt.at(0)
            )
        ).toEqual(
            Machine.evalSimple( pDataI( 2 ) )
        )

        expect(
            Machine.evalSimple(
                plistInt.at(1)
            )
        ).toEqual(
            Machine.evalSimple( pDataI( 3 ) )
        )

        expect(
            Machine.evalSimple(
                plistInt.at(2)
            )
        ).toEqual(
            Machine.evalSimple( pDataI( 100 ) )
        )
    
    })

    test("normal pmap", () => {

        const plistInt = pmap( data, int )
        .$( punIData )
        .$( punListData.$( pd ) )

        console.log( showIR( plistInt.toIR() ) );
        console.log( prettyUPLC( plistInt.toUPLC() ) );

        console.log(
            Machine.evalSimple(
                plistInt
            )
        );

        expect(
            Machine.evalSimple(
                plistInt.at(0)
            )
        ).toEqual(
            Machine.evalSimple( pInt( 2 ) )
        )

        expect(
            Machine.evalSimple(
                plistInt.at(1)
            )
        ).toEqual(
            Machine.evalSimple( pInt( 3 ) )
        )

        expect(
            Machine.evalSimple(
                plistInt.at(2)
            )
        ).toEqual(
            Machine.evalSimple( pInt( 100 ) )
        )

    })

    test("list(int)", () => {

        const plistInt = fromData( list( int ) )( pd );
        
        console.log( showIR( plistInt.toIR() ) );
        console.log( prettyUPLC( plistInt.toUPLC() ) );

        console.log(
            Machine.evalSimple(
                plistInt
            )
        );

        expect(
            Machine.evalSimple(
                plistInt.at(0)
            )
        ).toEqual(
            Machine.evalSimple( pInt( 2 ) )
        )

        expect(
            Machine.evalSimple(
                plistInt.at(1)
            )
        ).toEqual(
            Machine.evalSimple( pInt( 3 ) )
        )

        expect(
            Machine.evalSimple(
                plistInt.at(2)
            )
        ).toEqual(
            Machine.evalSimple( pInt( 100 ) )
        )

    })
})