import { Application } from "../Application";
import { HoistedUPLC, getSortedHoistedSet } from "../HoistedUPLC"
import { Lambda } from "../Lambda";
import { UPLCConst } from "../UPLCConst";
import { UPLCVar } from "../UPLCVar";


describe("getSortedHoistedSet",() => {

    const hoistedId = new HoistedUPLC( new Lambda( new UPLCVar( 0 ) ) );
    const hoistedConst = new HoistedUPLC(
        new Lambda(
            new Lambda(
                new UPLCVar( 1 )
            )
        )
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
        )
    );

    test("[] is []",() => {
        expect( getSortedHoistedSet([]) ).toEqual( [] );
    });

    test("singleton is singleton", () => {
        
        expect( getSortedHoistedSet([
            new HoistedUPLC( UPLCConst.unit )
        ])).toEqual([
            new HoistedUPLC( UPLCConst.unit )
        ]);

        expect( getSortedHoistedSet([
            new HoistedUPLC( UPLCConst.int( 32 ) )
        ])).toEqual([
            new HoistedUPLC( UPLCConst.int( 32 ) )
        ]);

        expect( getSortedHoistedSet([ hoistedId ]) ).toEqual([ hoistedId ]);

    });

    test("dependecy before dependent; [ dependecy, dependent ]", () => {

        const dependecy = new HoistedUPLC( UPLCConst.int( 42 ) );
        const dependent = new HoistedUPLC( new Lambda( dependecy ) );

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
        ).toEqual([
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