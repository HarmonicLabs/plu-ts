import { bool, int } from "../../../../../../type_system"
import { pisEmpty } from "../../../../builtins/list";
import { pBool } from "../../../bool/pBool";
import { piterLists } from "../../piterLists"
import { pcompareList } from "..";
import { peqInt } from "../../../../builtins/int/intBinOpToBool";
import { pList } from "../../const";
import { pInt } from "../../../int";
import { CEKConst, Machine } from "@harmoniclabs/plutus-machine";

describe("pcompareList vs piterLists", () => {

    const piterCompare = piterLists( int, int, bool )
    .$(( self, restSnd ) => pisEmpty.$( restSnd ) )
    .$(( self, restFst ) => pBool( false ) )
    .$(( self, fst, restFst, snd, restSnd ) => 
        fst.eq( snd )
        .and( self.$( restFst ).$( restSnd ) )
    );

    const pcompare = pcompareList( int, int )
    .$(( restSnd ) => pisEmpty.$( restSnd ) )
    .$(( restFst ) => pBool( false ) )
    .$( peqInt );

    const pListInt = ( ns: number[] ) => pList( int )( ns.map( pInt ) );

    function bench( as: number[], bs: number[], log: boolean = false )
    {
        const iterRes = Machine.eval(
            piterCompare
            .$(pListInt(as))
            .$(pListInt(bs))
        );

        const compRes = Machine.eval(
            pcompare
            .$(pListInt(as))
            .$(pListInt(bs))
        );
        
        const title = `${JSON.stringify(as)} - ${JSON.stringify(bs)}`;
        if( log )
        {
            console.log(`
test title: ${title}
result: ${(iterRes.result as CEKConst).value}
iter: ${JSON.stringify(iterRes.budgetSpent.toJson())}
comp: ${JSON.stringify(compRes.budgetSpent.toJson())}
            `);
        }

        test(title, () => {
            expect( iterRes.result ).toEqual( compRes.result )
            expect( iterRes.budgetSpent.mem ).toBeGreaterThanOrEqual( compRes.budgetSpent.mem )
            expect( iterRes.budgetSpent.cpu ).toBeGreaterThanOrEqual( compRes.budgetSpent.cpu )
        })

    }

    bench([],[]);
    bench([1],[]);
    bench([],[1]);
    bench([1],[1]);
    bench([1,2,3],[1,2,3]);
    bench([1,2,3,4,5,6,7],[1,2,3,4,5,6]);

})