import { Tx } from "../Tx"

describe("Tx.fromCbor", () => {

    test("", () => {

        console.log(
            JSON.stringify(
                Tx.fromCbor(
                    "84a30081825820d11531780938f9fc6110c968b8cd571c3b88aa8981bb52c296090958fe27848f000182825839000456f170a8ee5d0fb93458a394ba3a4d043db096e58c8a1f33a6681dcb15713c952715df00f231200e7a208ddeb718d05fcd34c5f0bfdb801b00000045d952e577825839000456f170a8ee5d0fb93458a394ba3a4d043db096e58c8a1f33a6681dcb15713c952715df00f231200e7a208ddeb718d05fcd34c5f0bfdb801a000f4240021a00029049a0f5f6"
                ).toJson(),
                undefined,
                2
            )
        );
        throw "missing id";


    });

});