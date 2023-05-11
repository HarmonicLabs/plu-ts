import { Machine } from "@harmoniclabs/plutus-machine"
import { pstruct } from "../../../../PTypes"
import { bs, int } from "../../../../type_system"
import { plet } from "../../../plet"
import { pDataB, pDataI } from "../../data"
import { pInt } from "../../int"

const SingleCtor = pstruct({
    SingleCtor: {
        num: int,
        byteStr: bs
    }
})

describe("dot notation", () => {

    test("num + bs.length", () => {

        const myStruct = plet(
            SingleCtor.SingleCtor({
                num: pDataI( 2 ),
                byteStr: pDataB("caffee")
            })
        );

        expect(
            Machine.evalSimple(
                myStruct.num.add( myStruct.byteStr.length )
            )
        ).toEqual(
            Machine.evalSimple(
                pInt( 2 + 3 )
            )
        );
        
    })
})