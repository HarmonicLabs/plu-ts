import { padd, pif } from "..";
import { pBool } from "../../PTypes/PBool";
import PInt, { pInt } from "../../PTypes/PInt";

test("pif", () => {

    console.log(
        pif<PInt>( PInt ).$( pBool( true ) ).$( pInt( 42 ) ).$( pInt( 69 )).toUPLC( 0 )
    );

})