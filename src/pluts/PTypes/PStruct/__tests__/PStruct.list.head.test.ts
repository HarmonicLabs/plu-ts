import { Machine } from "@harmoniclabs/plutus-machine";
import { pDataI, pInt, pList, toData } from "../../../lib";
import { pstruct } from "../pstruct";
import { int, list } from "../../../../type_system";
import { getElemsT } from "../../../../type_system/tyArgs";


const MyStruct = pstruct({
    Hello: { there: int }
});

const myList = pList( MyStruct.type )([
    MyStruct.Hello({ there: pDataI(42) })
]);

describe("structList.head", () => {

    test("type", () => {

        expect(
            myList.head.type
        )
        .toEqual(
            MyStruct.type
        );

    });

    test("get field", () => {

        expect(
            Machine.evalSimple(
                myList.head.there
            )
        ).toEqual(
            Machine.evalSimple(
                pInt( 42 )
            )
        );

    })

});

const MyOtherStruct = pstruct({
    There: { hello: list( MyStruct.type ) }
});

const myOtherStruct = MyOtherStruct.There({ hello: toData( list( MyStruct.type ) )(myList) })

describe("struct.listField.head", () => {

    test("type", () => {

        const hello = myOtherStruct.hello;

        expect(
            hello.type
        ).toEqual(
            list( MyStruct.type )
        )

        expect(
            hello.type[1]
        ).toEqual(
            MyStruct.type
        );

        expect(
            getElemsT( hello.type )
        ).toEqual(
            MyStruct.type
        )

        expect(
            hello.head.type
        ).toEqual(
            MyStruct.type
        );

        const _42 = hello.head.there

        expect(
            Machine.evalSimple(
                _42
            )
        ).toEqual(
            Machine.evalSimple(
                pInt(42)
            )
        );

    })

})