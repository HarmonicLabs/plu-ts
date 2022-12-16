import PCurrencySymbol from "../../../API/V1/Value/PCurrencySymbol";
import PTokenName from "../../../API/V1/Value/PTokenName";
import Type, { dynPair, int, list, TermType } from "../base";
import { isConstantableTermType } from "../kinds";

function truthyTest( equalsBool: boolean, f: ( termT: TermType ) => boolean )
{
    return ( someType: TermType ) => {
        const someBool = f( someType );
        if( someBool !== equalsBool) console.log( someType );
        expect( someBool ).toBe( equalsBool );
    }
}

describe("isConstantable", () => {

    const testTrue = truthyTest( true, isConstantableTermType );
    const testFalse = truthyTest( false, isConstantableTermType );

    const d = Type.Data;

    const withConstRepr = [
        Type.BS,
        Type.Bool,
        Type.Int,
        Type.Str,
        d.Any,
        d.BS,
        d.Constr,
        d.Int,
        d.List( d.Any ),
        d.Map( d.Any, d.Any ),
        d.Pair( d.Any, d.Any )
    ];

    test("types with constant repr are true", () => {

        withConstRepr.forEach( constantable => {
            testTrue( constantable );
            testTrue(Type.List(constantable));
            testTrue(Type.Pair(constantable,constantable));
            testTrue(Type.Map(constantable,constantable));
        });

    });

    test("types without const repr are false", () => {

        const nopes = [
            Type.Var(),
            Type.Any,
            Type.Lambda( withConstRepr[0], withConstRepr[1] ),
            Type.Delayed( withConstRepr[2] )
        ];

        nopes.forEach( nope => {
            testFalse( nope );
            testFalse(Type.List(nope));
            testFalse(Type.Pair(nope,nope));
            testFalse(Type.Map(nope,nope));
        });

        [
            ...nopes,
            ...withConstRepr
        ].forEach( whatever => {
            testFalse(Type.Lambda( whatever, whatever ));
            testFalse(Type.Delayed( whatever ));
        });
        
    });

    test("dynPair( alias( bs ), list( dynPair( alias( bs ), int )))", () => {

        testTrue(
            dynPair(
                PCurrencySymbol.type,
                list(dynPair(
                    PTokenName.type,
                    int
                ))
            )
        );

    })

})