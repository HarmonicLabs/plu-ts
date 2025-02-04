import { IRApp } from "../../../../IRNodes/IRApp"
import { IRDelayed } from "../../../../IRNodes/IRDelayed"
import { IRForced } from "../../../../IRNodes/IRForced"
import { IRFunc } from "../../../../IRNodes/IRFunc"
import { IRLetted, getLettedTerms, getSortedLettedSet } from "../../../../IRNodes/IRLetted"
import { IRVar } from "../../../../IRNodes/IRVar"
import { groupByScope } from "../groupByScope"
import { data, list } from "../../../../../type_system"
import { DataI, dataFromCbor } from "@harmoniclabs/plutus-data"
import { IRNative } from "../../../../IRNodes/IRNative"
import { IRConst } from "../../../../IRNodes/IRConst"

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

    });

    test.only("same letted different scopes", () => {

        const sameLetted = new IRLetted(
            1,
            new IRApp(
                IRNative.unIData,
                new IRApp(
                    IRNative.headList,
                    new IRVar(0)
                )
            )
        );

        const lettedInFn = new IRFunc(
            1,
            sameLetted.clone()
        );

        const doStuffFn = new IRFunc(
            3,
            new IRApp(
                new IRApp(
                    IRNative.equalsInteger,
                    new IRApp(
                        new IRVar( 2 ),
                        new IRVar( 0 )
                    )
                ),
                new IRApp(
                    new IRVar( 1 ),
                    new IRVar( 0 )
                )
            )
        );

        const irTree = new IRLetted(
            1,
            new IRApp(
                new IRApp(
                    new IRApp(
                        doStuffFn,
                        lettedInFn.clone()
                    ),
                    lettedInFn.clone()
                ),
                IRConst.listOf( data )([ new DataI(0) ])
            )
        );

        const letteds = getSortedLettedSet( getLettedTerms( irTree ) );
        const scopes = groupByScope( letteds );
        
        expect(
            scopes.length
        ).toEqual( 2 );

    });

})