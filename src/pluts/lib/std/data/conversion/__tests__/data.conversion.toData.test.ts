import { Machine } from "@harmoniclabs/plutus-machine";
import { PAssetsEntry, PCurrencySymbol, PScriptPurpose, PTokenName, PValue, PValueEntry } from "../../../../../API";
import { pair, data, asData, typeExtends, list, termTypeToString, int, bs } from "../../../../../../type_system";
import { pByteString } from "../../../bs";
import { pInt } from "../../../int";
import { pList } from "../../../list";
import { pPair } from "../../../pair";
import { pData, pDataI } from "../../pData";
import { toData } from "../toData";
import { _toData } from "../toData_minimal"
import { DataList, DataB, DataI } from "@harmoniclabs/plutus-data";
import { ErrorUPLC } from "@harmoniclabs/uplc";


describe("_toData", () => {

    test("pList( pair( PScriptPurpose.type, data ) )([])", () => {

        const lst = pList( pair( PScriptPurpose.type, data ) )([]);

        expect(
            typeExtends(
                lst.type,
                list( pair( data, data ) )
            )
        ).toEqual( true )

        /*
        console.log(
            termTypeToString(
                lst.type
            ),"\n\n",
            termTypeToString(
                _toData( lst.type )( lst ).type
            )
        )
        //*/

        expect(
            _toData( lst.type )( lst ).type
        ).toEqual(
            asData( lst.type )
        )
    });

    const myPair = pPair( bs, int )( pByteString(""), pInt(42) );

    test("_toData( int )( pair.snd )", () => {

        expect(
            (myPair as any).isConstant
        ).toBe( true );

        const stuff = _toData( int )( myPair.snd );
        const uplc = stuff.toUPLC(0);
        // console.log( showUPLC( uplc ) );

        expect(
            Machine.evalSimple(
                uplc
            )
        ).toEqual(
            Machine.evalSimple(
                pDataI( 42 )
            )
        );

    });

    test("_toData( pair.type )( pair )", () => {

        const myPair = pPair( bs, int )( "", 42 );

        expect(
            (myPair as any).isConstant
        ).toBe( true );

        const stuff = _toData( myPair.type )( myPair );

        const uplc = stuff.toUPLC(0);

        expect(
            Machine.evalSimple(
                uplc
            )
        ).toEqual(
            Machine.evalSimple(
                pData(
                    new DataList([
                        new DataB(""),
                        new DataI(42)
                    ])
                )
            )
        );

    });

    test("_toData( PValue.type )( beef32 )", () => {
        const beef32 = PValue.from(
            pList( PValueEntry.type )([
                PValueEntry.from([
                    PCurrencySymbol.from( pByteString("deadbeef") ),
                    pList( PAssetsEntry.type )([
                        PAssetsEntry.from([
                            PTokenName.from( pByteString("beef") ),
                            pInt( 32 )
                        ])
                    ])
                ])
            ])
        );
        
        const beef32AsData = toData( PValue.type )( beef32 );

        expect(
            Machine.evalSimple( beef32AsData ) instanceof ErrorUPLC
        ).toBe( false )
    });
})