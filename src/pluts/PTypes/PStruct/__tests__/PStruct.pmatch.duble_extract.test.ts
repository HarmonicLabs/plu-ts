import { Machine } from "@harmoniclabs/plutus-machine";
import { int } from "../../../../type_system";
import { pstruct } from "../pstruct";
import { pInt } from "../../../lib/std/int/pInt";
import { pDataI } from "../../../lib/std/data/pData";


const Child = pstruct({
    Constr: {
        age: int
    }
});

const Parent = pstruct({
    Constr: {
        child: Child.type
    }
});

describe("double extract", () => {

    test("extract child age", () => {

        const childAge = 2;

        const child = Child.Constr({
            age: pDataI( childAge )
        });

        const parent = Parent.Constr({
            child: child as any
        });

        expect(
            Machine.evalSimple(
                parent.child.age
            )
        ).toEqual(
            Machine.evalSimple(
                pInt( childAge )
            )
        )

    })
});
