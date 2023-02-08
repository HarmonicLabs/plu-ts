import { pstruct } from "..";
import { evalScript } from "../../../../CEK";
import { data, int, list, unit } from "../../../Term";
import { pBool, pInt, phead, phoist, plam, pmakeUnit } from "../../../lib"
import { getElemAtTerm, pmatch } from "../pmatch"

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

    const stuff = Struct3.Struct3({
        j: pmakeUnit(),
        k: pmakeUnit(),
        l: pmakeUnit(),
        m: Struct2.Struct2({
            f: pmakeUnit(),
            g: pmakeUnit(),
            h: pmakeUnit(),
            i: Struct1.Struct1({
                a: pmakeUnit(),
                b: pmakeUnit(),
                c: pmakeUnit(),
                d: pmakeUnit(),
                e: pInt(42),
            }),
        })
    })

    test("extract nested", () => {

        expect(
            evalScript(
                pmatch( stuff )
                .onStruct3( _ => _.extract("m").in( ({ m }) =>
                m.extract("i").in( ({ i }) =>
                i.extract("e").in( ({ e }) => e )
                )))
            )
        ).toEqual(
            evalScript(
                pInt( 42 )
            )
        )

    })
})