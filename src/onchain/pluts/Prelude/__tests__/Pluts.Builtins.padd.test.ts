import { padd } from "..";
import { pInt } from "../../PTypes/PInt";

test("padd", () => {

    console.log(
        padd.$( pInt( 1 ) ).$( pInt( 2 ) ).toUPLC( 0 )
    );

})