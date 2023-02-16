import { BitStream } from "../../../../types/bits/BitStream";
import { Application } from "../Application";
import { HoistedUPLC, getSortedHoistedSet } from "../HoistedUPLC"
import { Lambda } from "../Lambda";
import { UPLCConst } from "../UPLCConst";
import { UPLCVar } from "../UPLCVar";

(expect as any).addEqualityTesters([
    (a: HoistedUPLC, b: HoistedUPLC) => {
        if(!(
            a instanceof HoistedUPLC &&
            b instanceof HoistedUPLC
        )) return undefined;

        return BitStream.eq( a.compiled, b.compiled );
    }
])

describe("getSortedHoistedSet",() => {

    const hoistedId = new HoistedUPLC( new Lambda( new UPLCVar( 0 ) ), undefined );
    const hoistedConst = new HoistedUPLC(
        new Lambda(
            new Lambda(
                new UPLCVar( 1 )
            )
        ), undefined
    );
    const flippedConst = new HoistedUPLC(
        new Lambda(
            new Application(
                new Application(
                    hoistedConst,
                    hoistedId
                ),
                new UPLCVar( 0 )
            )
        ), undefined
    );

    test("[] is []",() => {
        expect( getSortedHoistedSet([]) ).toEqual( [] );
    });

    test("singleton is singleton", () => {
        
        expect( getSortedHoistedSet([
            new HoistedUPLC( UPLCConst.unit, undefined )
        ])).toEqual([
            new HoistedUPLC( UPLCConst.unit, undefined )
        ]);

        expect( getSortedHoistedSet([
            new HoistedUPLC( UPLCConst.int( 32 ), undefined )
        ])).toEqual([
            new HoistedUPLC( UPLCConst.int( 32 ), undefined )
        ]);

        expect( getSortedHoistedSet([ hoistedId ]) ).toEqual([ hoistedId ]);

    });

    test("dependecy before dependent; [ dependecy, dependent ]", () => {

        const dependecy = new HoistedUPLC( UPLCConst.int( 42 ), undefined );
        const dependent = new HoistedUPLC( new Lambda( dependecy ), undefined );

        expect(
            getSortedHoistedSet([ dependent ])
        ).toEqual([
            dependecy, dependent
        ]);

    })

    test("hoisted with dependencies includes dependecies", () => {

        expect(
            getSortedHoistedSet([ flippedConst ])
        ).toEqual([
            hoistedId, hoistedConst, flippedConst
        ]);

    });

    test("hoisted included once", () => {

        expect(
            getSortedHoistedSet([ hoistedId, hoistedId ])
        ).toEqual([ hoistedId ]);

        expect(
            getSortedHoistedSet([ hoistedId, hoistedConst ])
        ).toEqual([
            hoistedId, hoistedConst
        ]);

        expect(
            getSortedHoistedSet([ hoistedConst, hoistedId ])
        ).toEqual([
            hoistedConst, hoistedId
        ]);

        expect(
            getSortedHoistedSet([ flippedConst, hoistedId, hoistedConst ])
        ).toStrictEqual([
            hoistedId, hoistedConst, flippedConst
        ]);
        
        expect(
            getSortedHoistedSet([ flippedConst, hoistedConst, hoistedId ])
        ).toEqual([
            hoistedId, hoistedConst, flippedConst
        ]);

        expect(
            getSortedHoistedSet([ hoistedConst, hoistedId, flippedConst ])
        ).toEqual([
            hoistedConst, hoistedId, flippedConst
        ]);

    });

});