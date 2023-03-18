import { IRApp } from "../../../../IRNodes/IRApp"
import { IRDelayed } from "../../../../IRNodes/IRDelayed"
import { IRForced } from "../../../../IRNodes/IRForced"
import { IRFunc } from "../../../../IRNodes/IRFunc"
import { IRLetted, getLettedTerms } from "../../../../IRNodes/IRLetted"
import { IRVar } from "../../../../IRNodes/IRVar"
import { groupByScope } from "../groupByScope"

describe("groupByScope", () => {

    test("different scopes", () => {

        const sameLetted = new IRLetted(
            1,
            new IRVar(0)
        )

        const irTree = new IRForced(
            new IRDelayed(
                new IRApp(
                    new IRFunc( 1,
                        sameLetted
                    ),
                    new IRFunc( 1,
                        sameLetted.clone()
                    )
                )
            )
        );

        expect(
            groupByScope( getLettedTerms( irTree ) ).length
        ).toEqual( 2 );

        // make sure we are testing the same terms
        expect(
            sameLetted.hash
        ).toEqual(
            (irTree as any).forced.delayed.arg.body.hash
        );

        expect(
            (irTree as any).forced.delayed.fn.body.hash
        ).toEqual(
            (irTree as any).forced.delayed.arg.body.hash
        );

    })

})