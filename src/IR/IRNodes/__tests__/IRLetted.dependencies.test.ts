import { int } from "../../../type_system/types";
import { IRApp } from "../IRApp";
import { IRConst } from "../IRConst";
import { IRLetted, getLettedTerms, getSortedLettedSet, jsonLettedSetEntry } from "../IRLetted";
import { IRNative } from "../IRNative";
import { IRNativeTag } from "../IRNative/IRNativeTag";

describe("IRLetted.dependencies", () => {

    test("one dependency", () => {
        // `add2`
        const dep = new IRLetted(
            0,
            new IRApp(
                new IRNative( IRNativeTag.addInteger ),
                new IRConst( int, 2 )
            )
        );

        // fancy `add4`
        const lettedWithDep = new IRLetted(
            0,
            new IRApp(
                new IRNative( IRNativeTag.addInteger ),
                new IRApp(
                    dep,
                    new IRConst( int, 2 )
                )
            )
        );

        expect( lettedWithDep.dependencies.length ).toEqual( 1 );
        
    });

    test("one dependency has 1 ref", () => {

        const dep = new IRLetted(
            0,
            new IRApp(
                new IRNative( IRNativeTag.addInteger ),
                new IRConst( int, 2 )
            )
        );

        // fancy `add4`
        const lettedWithDep = new IRLetted(
            0,
            new IRApp(
                new IRNative( IRNativeTag.addInteger ),
                new IRApp(
                    dep,
                    new IRConst( int, 2 )
                )
            )
        );

        // console.log( getLettedTerms( lettedWithDep ).map( jsonLettedSetEntry ) )

        const allLetted = getLettedTerms( lettedWithDep );
        const result = getSortedLettedSet( allLetted )
        const resultJson = result.map( jsonLettedSetEntry );

        // console.log( resultJson );

        expect(
            resultJson
        ).toEqual([
            {
                letted: dep,
                nReferences: 1
            },
            {
                letted: lettedWithDep,
                nReferences: 1
            }
        ].map( jsonLettedSetEntry ) )
    })


})