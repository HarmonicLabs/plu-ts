import { PScriptPurpose } from "../../../../../API";
import { pair, data, asData, typeExtends, list, termTypeToString } from "../../../../../type_system";
import { pList } from "../../../list";
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
    })
})