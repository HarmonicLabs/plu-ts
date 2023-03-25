import { inferConstTypeFromConstValue } from ".."
import { ByteString } from "../../../../../../types/HexString/ByteString";
import { Integer } from "../../../../../../types/ints/Integer";
import { constT } from "../../ConstType"


describe("ConstValue :: inferConstTypeFromConstValue", () => {

    it("infers simple values correctly", () => {

        expect(
            inferConstTypeFromConstValue( undefined )
        ).toEqual(
            constT.unit
        );

        expect(
            inferConstTypeFromConstValue( 2 )
        ).toEqual(
            constT.int
        );

        expect(
            inferConstTypeFromConstValue( new ByteString( "abcd" ) )
        ).toEqual(
            constT.byteStr
        );

        expect(
            inferConstTypeFromConstValue( "str" )
        ).toEqual(
            constT.str
        );

        expect(
            inferConstTypeFromConstValue( true )
        ).toEqual(
            constT.bool
        );
        
    })

    it.todo("infers data correctly");

    it("infers list types when elements are congruent", () => {
        
        expect(
            inferConstTypeFromConstValue([ 2 ])
        ).toEqual(
            constT.listOf( constT.int )
        )

        expect(
            inferConstTypeFromConstValue([ 2, 3 ])
        ).toEqual(
            constT.listOf( constT.int )
        )

        expect(
            inferConstTypeFromConstValue([
                [ 1, 42 ], 
                [ 2 ]
            ])
        ).toEqual(
            constT.listOf( 
                constT.listOf( constT.int ) 
            )
        )

        expect(
            inferConstTypeFromConstValue([ [], [ 2 ] ])
        ).toEqual(
            constT.listOf( 
                constT.listOf( constT.int ) 
            )
        )

    })

    it("throws if a list with incongruent values is provvided", () => {
        
        expect( () =>
            inferConstTypeFromConstValue([ 2, undefined ] as any )
        ).toThrow()

        expect( () =>
            inferConstTypeFromConstValue([ 2, "str" ] as any )
        ).toThrow()

    })

    it("returns undefined on list with ambigous elements", () => {

        expect(
            inferConstTypeFromConstValue([])
        ).toBe( undefined );

        expect(
            inferConstTypeFromConstValue([ [] ])
        ).toBe( undefined );

        expect(
            inferConstTypeFromConstValue([
                [],
                [],
                []
            ])
        ).toBe( undefined );

        expect(
            inferConstTypeFromConstValue([
                [ [], [] ],
                [],
                [ [] ]
            ])
        ).toBe( undefined );

    })
})