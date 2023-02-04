import { ConstType, constPairTypeUtils, constT, constTypeToStirng, ConstTyTag } from "..";
import { makeRandomWellFormed } from "../test_utils";

describe("constPairTypeUtils.getFirstTypeArgument", () => {

    const {
        int,
        str,
        bool,
        unit,
        byteStr,
        listOf,
        pairOf,
        data
    } = constT;

    it("works on well formed pair types", () => {

        const wfPairTypesArgs: [ ConstType, ConstType ][] = [
            [ int, int ],
            [ bool, bool ],
            [ unit, int ],

            [ listOf( int ) , int ],
            [ listOf( listOf( int ) ), int ],

            [ pairOf( listOf( int ), int ), int ],
            [ pairOf( int , listOf( int ) ), str ],
            [ pairOf( byteStr, pairOf( int, unit ) ), pairOf( str, int ) ],
        ];

        for( const pairArg of wfPairTypesArgs )
        {
            expect( constTypeToStirng(
                constPairTypeUtils.getFirstTypeArgument(
                    pairOf( ...pairArg )
                )
            ) ).toEqual(
                constTypeToStirng(
                    pairArg[0]
                )
            )
        }

    });

    it.concurrent("works on well formed pair types, random", () => {

        let wellFormedTypePair: [ ConstType, ConstType ];

        for( let i = 0; i < 10_000; i++ )
        {
            wellFormedTypePair = [ makeRandomWellFormed(), makeRandomWellFormed() ];

            // Debug.log( wellFormedType );
            expect( constTypeToStirng(
                constPairTypeUtils.getFirstTypeArgument(
                    pairOf( ...wellFormedTypePair )
                )
            ) ).toEqual(
                constTypeToStirng(
                    wellFormedTypePair[0]
                )
            )
        }
    });

    it("throws if the pair type is not well formed", () => {

        const non_wfPairTypesArgs: [ ConstType, ConstType ][] = [
            [ [ ConstTyTag.list ] , int ],
            [ [ ConstTyTag.pair ] , int ],
            [ [ ConstTyTag.int, ConstTyTag.int ], int ],
            [ [ ConstTyTag.pair, ConstTyTag.int ] , int ],

            [ int, [ ConstTyTag.list ] ],
            [ int, [ ConstTyTag.pair ] ],
            [ int, [ ConstTyTag.int, ConstTyTag.int ] ],
            [ int, [ ConstTyTag.pair, ConstTyTag.int ] ],
        ];

        for( const pairArg of non_wfPairTypesArgs )
        {
            expect( () =>
                constPairTypeUtils.getFirstTypeArgument(
                    pairOf( ...pairArg )
                )
            ).toThrow();
        }

    });

});