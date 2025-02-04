import { compile, passert, pBool, perror, pfn, plet, pmatch, PMaybe, PPubKeyHash, PScriptContext, punBData } from ".."
import { unit, data } from "../../type_system";

test("hello pluts", () => {

    const contract = pfn([
        PScriptContext.type
    ], unit)
    (({ redeemer, tx, purpose }) => {

        const message = plet( punBData.$( redeemer ) );

        const maybeDatum = plet(
            pmatch( purpose )
            .onSpending(({ datum }) => datum )
            ._(_ => perror( PMaybe( data ).type ) )
        );

        const signedByOwner = plet(
            pmatch( maybeDatum )
            .onNothing( _ => pBool( true ) ) // no owner, so we approve it
            .onJust(({ val }) =>
                tx.signatories.includes( punBData.$( val ) )
            )
        );

        const isBeingPolite = message.eq("Hello plu-ts");

        return passert.$(
            signedByOwner.and( isBeingPolite )
        );
    });

    const compiled = compile( contract );

    // console.log( toHex( compiled ) );
});