import { Machine } from "@harmoniclabs/plutus-machine";
import { pstruct } from "..";
import { pDataI, pInt, phead, phoist, plam, pmakeUnit, pmatch, toData } from "../../../lib"
import { data, list, unit, int } from "../../../../type_system";
import { getElemAtTerm } from "../../../lib/pmatch/getElemAtTerm";


describe("getElemAtTerm", () => {

    test("0", () => {

        expect(
            getElemAtTerm(0).toUPLC(0)
        ).toEqual( phead(data).toUPLC(0) );

    });

    test("1", () => {

        expect(
            getElemAtTerm(1).toUPLC(0)
        ).toEqual(
            phoist(
                plam( list( data ), data )
                ( lst => lst.tail.head )
            ).toUPLC(0)
        );

    });

    test("2", () => {

        expect(
            getElemAtTerm(2).toUPLC(0)
        ).toEqual(
            phoist(
                plam( list( data ), data )
                ( lst => lst.tail.tail.head )
            ).toUPLC(0)
        );

    });

    test("3", () => {

        expect(
            getElemAtTerm(3).toUPLC(0)
        ).toEqual(
            phoist(
                plam( list( data ), data )
                ( lst => lst.tail.tail.tail.head )
            ).toUPLC(0)
        );

    });

    const Struct1 = pstruct({
        Struct1: {
            a: unit,
            b: unit,
            c: unit,
            d: unit,
            e: int,
        }
    });

    const Struct2 = pstruct({
        Struct2: {
            f: unit,
            g: unit,
            h: unit,
            i: Struct1.type,
        }
    });

    const Struct3 = pstruct({
        Struct3: {
            j: unit,
            k: unit,
            l: unit,
            m: Struct2.type
        }
    });

    const unitAsData = toData( unit )( pmakeUnit() );

    const stuff = plam( data, Struct3.type )
    ( unitAsData =>
        Struct3.Struct3({
            j: unitAsData,
            k: unitAsData,
            l: unitAsData,
            m: Struct2.Struct2({
                f: unitAsData,
                g: unitAsData,
                h: unitAsData,
                i: Struct1.Struct1({
                    b: unitAsData,
                    a: unitAsData,
                    c: unitAsData,
                    d: unitAsData,
                    e: pDataI(42),
                }) as any,
            }) as any
        })
    ).$( unitAsData );

    test("extract nested", () => {

        const theTerm = pmatch( stuff )
        .onStruct3( ({ m }) => m.i.e );

        expect(
            Machine.evalSimple(
                theTerm
            )
        ).toEqual(
            Machine.evalSimple(
                pInt( 42 )
            )
        )

    })
})