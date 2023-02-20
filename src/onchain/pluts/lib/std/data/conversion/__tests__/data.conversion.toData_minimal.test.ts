import { DataB, DataI, DataList } from "../../../../../../../types/Data";
import { Machine } from "../../../../../../CEK";
import { showUPLC } from "../../../../../../UPLC/UPLCTerm";
import { PScriptPurpose } from "../../../../../API";
import { pair, data, asData, typeExtends, list, termTypeToString, int, bs } from "../../../../../type_system";
import { pByteString } from "../../../bs";
import { pInt } from "../../../int";
import { pList } from "../../../list";
import { pPair } from "../../../pair";
import { pData, pDataI } from "../../pData";
import { toData_minimal } from "../toData_minimal"


describe("toData_minimal", () => {

    test("pList( pair( PScriptPurpose.type, data ) )([])", () => {

        const lst = pList( pair( PScriptPurpose.type, data ) )([]);

        expect(
            typeExtends(
                lst.type,
                list( pair( data, data ) )
            )
        ).toEqual( true )

        //*
        console.log(
            termTypeToString(
                lst.type
            ),"\n\n",
            termTypeToString(
                toData_minimal( lst.type )( lst ).type
            )
        )
        expect(
            toData_minimal( lst.type )( lst ).type
        ).toEqual(
            asData( lst.type )
        )
        //*/
    });

    const myPair = pPair( bs, int )( pByteString(""), pInt(42) );

    test("toData_minimal( int )( pair.snd )", () => {

        expect(
            (myPair as any).isConstant
        ).toBe( true );

        const stuff = toData_minimal( int )( myPair.snd );
        const uplc = stuff.toUPLC(0);
        console.log( showUPLC( uplc ) );

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

    test("toData_minimal( pair.type )( pair )", () => {

        const myPair = pPair( bs, int )( pByteString(""), pInt(42) );

        expect(
            (myPair as any).isConstant
        ).toBe( true );

        const stuff = toData_minimal( myPair.type )( myPair );
        const uplc = stuff.toUPLC(0);
        console.log( showUPLC( uplc ) );

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
})