import { int } from "../../../../type_system";
import { IRConst } from "../../../IRNodes/IRConst";
import { IRForced } from "../../../IRNodes/IRForced";
import { IRHoisted } from "../../../IRNodes/IRHoisted";
import { _modifyChildFromTo } from "../_modifyChildFromTo";

describe("_modifyChildFromTo", () => {

    test("inline hoisted", () => {
        const elem = new IRConst( int, 0 );
        const hoisted = new IRHoisted( elem );

        const someParent = new IRForced( hoisted );

        _modifyChildFromTo(
            hoisted.parent,
            hoisted,
            hoisted.hoisted
        );

        expect(
            someParent.forced.hash
        ).toEqual(
            elem.hash
        );

    })
})