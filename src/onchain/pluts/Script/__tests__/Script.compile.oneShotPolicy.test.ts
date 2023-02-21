import { bool, compile } from "../..";
import { Machine } from "../../../CEK";
import { PTxOutRef, V2 } from "../../API";
import { pstruct, pmatch } from "../../PTypes";
import { perror, pfn, pisEmpty, plet } from "../../lib";
import { tx_v2, validatorSpendingUtxo } from "../../../test_utils";
import { ErrorUPLC } from "../../../UPLC/UPLCTerms/ErrorUPLC";


export const MintRdmr = pstruct({
    Mint: {},
    Burn: {}
});

export const oneShotNFT = pfn([
    V2.PTxOutRef.type,

    MintRdmr.type,
    V2.PScriptContext.type

],  bool)
(( utxo, rdmr, ctx ) =>
    
    ctx.extract("txInfo","purpose").in( ({ txInfo, purpose }) =>
    txInfo.extract("inputs","mint").in( tx =>

        plet(
            pmatch( purpose )
            .onMinting( _ => _.extract("currencySym").in( ({ currencySym }) => currencySym ))
            ._( _ => perror( V2.PCurrencySymbol.type ) as any )
        ).in( ownCurrSym => 

        pmatch( rdmr )
        .onMint( _ =>

            tx.inputs.some( input =>
                input.extract("utxoRef").in( ({ utxoRef }) => utxoRef.eq( utxo ) )
            )
            .and(
    
                tx.mint.some( entry =>

                    entry.fst.eq( ownCurrSym )

                    .and(
                        plet( entry.snd ).in( assets =>

                            pisEmpty.$( assets.tail )
                            .and(
                                assets.head.snd.eq( 1 )
                            )

                        )
                    )

                )

            )

        )
        .onBurn( _ =>
            tx.mint.some( entry =>

                entry.fst.eq( ownCurrSym )

                .and(
                    plet( entry.snd ).in( assets =>

                        pisEmpty.$( assets.tail )
                        .and(
                            assets.head.snd.lt( 0 )
                        )

                    )
                )

            ) 
        )
    
    )))
)

describe("oneShotNFT", () => {

    test("it compiles", () => {

        expect(
            () => compile( oneShotNFT )
        ).not.toThrow();
        
    });

    test.skip("no execution errors", () => {

        expect(
            Machine.evalSimple(
                oneShotNFT.$(
                    validatorSpendingUtxo
                ).$(
                    MintRdmr.Mint({})
                ).$(
                    tx_v2
                )
            ) instanceof ErrorUPLC
        ).toBe( false );
        
    })

})