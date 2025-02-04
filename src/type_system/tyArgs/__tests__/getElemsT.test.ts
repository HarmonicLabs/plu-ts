import { list, int, alias } from "../../types";
import { getElemsT } from "../getElemsT"

describe("getElemsT", () => {

    describe("just list", () => {

        test("list(int) -> int", () => {
            expect( getElemsT( list( int ) ) ).toEqual( int );
        });

        test("list(list(int)) -> list(int)", () => {
            expect( getElemsT( list( list( int ) ) ) ).toEqual( list( int ) );
        });

        test("list(list(list(int))) -> list(list(int))", () => {
            expect( getElemsT( list( list( list( int ) ) ) ) ).toEqual( list( list( int ) ) );
        });

    });

    describe("alias list", () => {

        test("alias(list(int)) -> int", () => {
            expect( getElemsT( alias( list( int ) ) ) ).toEqual( int );
        });

    });

})