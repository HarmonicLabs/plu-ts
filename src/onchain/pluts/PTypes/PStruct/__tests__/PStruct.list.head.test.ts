import { Machine } from "../../../../CEK";
import { pDataI, pInt, pList, toData } from "../../../lib";
import { int, list, termTypeToString } from "../../../type_system";
import { getElemsT } from "../../../type_system/tyArgs";
import { pstruct } from "../pstruct";


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
                myList.head.extract("there").in( ({ there }) => there )
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

        const _42 = myOtherStruct.extract("hello").in( ({ hello }) => {

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

            return hello.head.extract("there").in( ({ there }) => there )
        });

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