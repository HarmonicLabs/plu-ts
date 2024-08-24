import { toHex } from "@harmoniclabs/uint8array-utils";
import { compile, data, passert, pBool, bool, perror, pfn, plet, pmatch, PMaybe, UtilityTermOf, PScriptContext, unit, PData } from ".."

test("hello pluts", () => {

    const contract = pfn([
        PScriptContext.type
    ], unit)
    (({ redeemer, tx, purpose }) => {

        const maybeDatum = plet(
            pmatch( purpose )
            .onSpending(({ datum }) => datum )
            ._(_ => perror( PMaybe( data ).type ) )
        );

        return passert.$(
            maybeDatum.raw.index.eq( 1 )
        );
    });
    
    const compiled = compile( contract );

    // console.log( toHex( compiled ) );
});