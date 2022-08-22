import { padd } from "..";
import { pint } from "../../PTypes/PInt";

test("padd", () => {

    console.log(
        padd.$( pint( 1 ) ).$( pint( 2 ) ).toUPLC( 0 )
    );

})