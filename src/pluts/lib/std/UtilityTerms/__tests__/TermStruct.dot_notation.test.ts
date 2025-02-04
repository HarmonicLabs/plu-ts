import { Machine } from "@harmoniclabs/plutus-machine"
import { pmatch, pstruct } from "../../../../PTypes"
import { bs, int, list, unit } from "../../../../../type_system"
import { plet } from "../../../plet"
import { pDataB, pDataI } from "../../data"
import { pInt } from "../../int"
import { passert } from "../../passert"
import { pList } from "../../list/const"
import { PTxOut } from "../../../../API/V2/Tx/PTxOut"
import { phoist } from "../../../phoist"
import { PTxInInfo } from "../../../../API/V2/Tx/PTxInInfo"
import { pfn } from "../../../pfn"
import { UtilityTermOf } from "../addUtilityForType"
import { pmakeUnit } from "../../unit/pmakeUnit"
import { TermStruct } from "../TermStruct"

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
        
    });
    
})