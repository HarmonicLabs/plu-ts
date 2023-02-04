import { getFromDataForType } from "../getFromDataTermForType"
import { bs, data, dynPair, int, list, pair } from "../../../../Term/Type/base";
import { PValue } from "../../../../API/V1/Value/PValue"
import { Term } from "../../../../Term";
import { PData } from "../../PData";
import { UPLCConst } from "../../../../../UPLC/UPLCTerms/UPLCConst";
import { dataFromCbor } from "../../../../../../types/Data/fromCbor";
import { CborString } from "../../../../../../cbor/CborString";
import { ByteString } from "../../../../../../types/HexString/ByteString";
import { evalScript } from "../../../../../CEK";
import { addPListMethods } from "../../../../stdlib";

describe("getFromDataForType", () => {

    test("PValue", () => {
        
        expect(
            () => getFromDataForType( PValue.type )
        ).not.toThrow();

    });

    test("data a240a14000581caf4da81764e9157c6c7cc1ab05a43e4a6f3e76d19d6fa1d9910548e5a1434e465401", () => {

        const someValueAsData = new Term<PData>(
            data,
            _dbn => UPLCConst.data(
                dataFromCbor(
                    new CborString(
                        "a240a14000581caf4da81764e9157c6c7cc1ab05a43e4a6f3e76d19d6fa1d9910548e5a1434e465401"
                    )
                )
            )
        );

        const result = addPListMethods(
            getFromDataForType(
                list(pair(
                    bs,
                    list(pair(
                        bs,
                        int
                    ))
                ))
            )(
                someValueAsData
            )
        );

        expect(
            result.type
        ).toEqual(
            list(
                dynPair(
                    bs,
                    list(
                        dynPair(
                            bs,
                            int
                        )
                    )
                )
            )
        );

        expect(
            evalScript(
                result.head.fst
            )
        ).toEqual(
            UPLCConst.byteString(ByteString.fromAscii(""))
        );

        //*
        console.log(
            evalScript(
                result.tail.head.fst
            )
        );
        //*/

        console.log(
            result.tail.head.snd.type
        )

        console.log(
            evalScript(
                result.tail.head.snd.head.snd
            )
        );
    })

})