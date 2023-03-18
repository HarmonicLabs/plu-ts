import { IRApp } from "../../../../IRNodes/IRApp"
import { IRDelayed } from "../../../../IRNodes/IRDelayed"
import { IRForced } from "../../../../IRNodes/IRForced"
import { IRFunc } from "../../../../IRNodes/IRFunc"
import { IRLetted, getLettedTerms } from "../../../../IRNodes/IRLetted"
import { IRVar } from "../../../../IRNodes/IRVar"
import { groupByScope } from "../groupByScope"

describe("groupByScope", () => {

    test("different scopes", () => {

        const irTree = new IRForced(
            new IRDelayed(
                new IRApp(
                    new IRFunc(2,
                        new IRLetted(
                            new IRVar(0)
                        )
                    ),
                    new IRFunc( 1,
                        new IRLetted(
                            new IRVar( 0 )
                        )
                    )
                )
            )
        );

        console.log(
            groupByScope( getLettedTerms( irTree ) )
        );
    })

})