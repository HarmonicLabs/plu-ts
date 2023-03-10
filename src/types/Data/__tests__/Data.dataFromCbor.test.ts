import { fromHex } from "@harmoniclabs/uint8array-utils";
import { Data } from "../Data";
import { DataB } from "../DataB";
import { DataConstr } from "../DataConstr";
import { DataI } from "../DataI";
import { dataFromCbor } from "../fromCbor"

describe("dataFromCbor", () => {

    test("some asset entry", () => {

        let data!: Data;
        expect(
            () => data = dataFromCbor(
                "d87982d8798158208aa67408cffae7f04b6749c0ddedfe576e97b84b12da09605688632dd0ddd7f200"
            )
        ).not.toThrow();

        expect(
            data
        ).toEqual(
            new DataConstr(
                0,
                [
                    new DataConstr(
                        0,
                        [
                            new DataB( fromHex("8aa67408cffae7f04b6749c0ddedfe576e97b84b12da09605688632dd0ddd7f2") )
                        ]
                    ),
                    new DataI( 0 )
                ]
            )
        )
    })
})