import { showUPLC } from "../../../../UPLC/UPLCTerm"
import Type from "../../../Term/Type"
import { matchNCtorsIdxs } from "../pmatch"


describe("pmatch :: matchNCtorsIdxs", () => {

    test("", () => {

        for( let i = 2; i < 5; i++)
        console.log(
            showUPLC(
                matchNCtorsIdxs(i, Type.Any).toUPLC(0)
            )
        )

    })
})