import { CEKError, Machine } from "@harmoniclabs/plutus-machine";
import { PMaybe } from "..";
import { int } from "../../../../../type_system/types";
import { pDataI } from "../../data/pData";
import { pInt } from "../../int/pInt";

describe("PMaybe", () => {

    const PMaybeInt = PMaybe( int );
    const just = PMaybeInt.Just({ val: pDataI( 1 ) });
    const nothing = PMaybeInt.Nothing({});

    test("unwrap just", () => {

        const res = Machine.evalSimple(
            just.unwrap
        );

        const expected = Machine.evalSimple( pInt( 1 ) );

        expect( res ).toEqual( expected );

    });

    test("unwrap nothing", () => {

        const res = Machine.evalSimple(
            nothing.unwrap
        );

        // const expected = Machine.evalSimple( perror( int ) );

        expect( res instanceof CEKError ).toEqual( true );

    });

    test("default just", () => {

        const res = Machine.evalSimple(
            just.default( 0 )
        );

        const expected = Machine.evalSimple( pInt( 1 ) );

        expect( res ).toEqual( expected );

    });

    test("default nothing", () => {

        const res = Machine.evalSimple(
            nothing.default( 0 )
        );

        const expected = Machine.evalSimple( pInt( 0 ) );

        expect( res ).toEqual( expected );

    });
})