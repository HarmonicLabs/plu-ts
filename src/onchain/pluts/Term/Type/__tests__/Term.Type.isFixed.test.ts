import Type, { TermType } from "../base";
import { isFixedDataType, isFixedType } from "../kinds";

describe("isFixedDataType", () => {

    const d = Type.Data;

    test("true for fixed", () => {

        function testTrue( someBool: boolean ): void
        {
            expect( someBool ).toBe( true );
        }

        testTrue(isFixedDataType(
            d.BS
        ));
        testTrue(isFixedDataType(
            d.Constr
        ));
        testTrue(isFixedDataType(
            d.Int
        ));
        testTrue(isFixedDataType(
            d.List( d.Int )
        ));
        testTrue(isFixedDataType(
            d.Pair( d.BS, d.Int )
        ));
        testTrue(isFixedDataType(
            d.List( d.Pair( d.Int, d.Constr ) )
        ));
    });

    test("false if **contains** 'Type.Data.Any'", () => {

        function testFalse( someBool: boolean ): void
        {
            expect( someBool ).toBe( false );
        }

        testFalse(isFixedDataType(
            d.Any
        ));
        testFalse(isFixedDataType(
            d.List( d.Any )
        ));
        testFalse(isFixedDataType(
            d.Pair( d.Any, d.Int )
        ));
        testFalse(isFixedDataType(
            d.Pair( d.Int, d.Any )
        ));
        testFalse(isFixedDataType(
            d.Pair( d.Any, d.Any )
        ));
        testFalse(isFixedDataType(
            d.List( d.Pair( d.Any, d.Int ) )
        ));
        testFalse(isFixedDataType(
            d.List( d.Pair( d.Int, d.Any ) )
        ));
        testFalse(isFixedDataType(
            d.List( d.Pair( d.Any, d.Any ) )
        ));

    });

    test("false for non 'Data' types", () => {
        
        function testFalse( someBool: boolean ): void
        {
            expect( someBool ).toBe( false );
        }

        testFalse(isFixedDataType(
            Type.Any
        ));
        testFalse(isFixedDataType(
            Type.BS
        ));
        testFalse(isFixedDataType(
            Type.Int
        ));
        testFalse(isFixedDataType(
            Type.Bool
        ));
        testFalse(isFixedDataType(
            Type.Delayed( Type.Int )
        ));
        testFalse(isFixedDataType(
            Type.List( Type.Int )
        ));
        testFalse(isFixedDataType(
            Type.Pair( Type.Int , Type.Unit )
        ));
        testFalse(isFixedDataType(
            Type.List( Type.Pair( Type.Int , Type.Unit ) )
        ));
    })

})


describe("isFixedType", () => {

    const t = Type;
    const d = Type.Data;

    function testTrue( someType: TermType ): void
    {
        const someBool = isFixedType( someType );
        if( !someBool ) console.log( someType );
        expect(someBool).toBe( true );
    }
    function testFalse( someType: TermType ): void
    {
        const someBool = isFixedType( someType );
        if( someBool ) console.log( someType );
        expect( someBool ).toBe( false );
    }

    const fixedPrimTys = [
        t.Int,
        t.BS,
        t.Bool,
        t.Unit,
        t.Str,
        d.BS,
        d.Constr,
        d.Int
    ];

    test("true for fixed", () => {

        fixedPrimTys.forEach( fixed => {
            testTrue(fixed);
            testTrue(t.Delayed( fixed ));
            testTrue(t.Lambda(fixed,fixed));
            testTrue(t.List(fixed));
            testTrue(t.Pair(fixed,fixed))
        });

    })

    test("false for any", () => {

        [ t.Any, t.Data.Any, t.Var() ].forEach( notFix => {
            testFalse(notFix);
            testFalse(t.Delayed( notFix ));
            testFalse(t.Lambda(notFix,notFix));
            testFalse(t.List(notFix));
            testFalse(t.Pair(notFix,notFix))
        });
    })

})