import { perror, pfn, pmatch } from "../..";
import { PScriptContext, PTxOutRef } from "../../../API"

test("ctx.purpose", () => {

    const term = pfn([ PScriptContext.type ], PTxOutRef.type )
    (({ purpose }) =>
        pmatch( purpose )
        .onSpending(({ utxoRef }) => utxoRef )
        ._(_ => perror( PTxOutRef.type ))
    );

    const uplc = term.toUPLC();
})