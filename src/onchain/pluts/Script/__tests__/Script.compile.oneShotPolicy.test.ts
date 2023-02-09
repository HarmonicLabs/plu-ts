import { compile } from "../..";
import { PTxOutRef, V2 } from "../../API";
import { pstruct, pmatch } from "../../PTypes";
import { bool, fn } from "../../Term";
import { punsafeConvertType, peqData, perror, pfn, pisEmpty, plet } from "../../lib";

const peqTxOutRef = punsafeConvertType(
    peqData,
    fn([
        PTxOutRef.type,
        PTxOutRef.type
    ],  bool)
);

const MintRdmr = pstruct({
    Mint: {},
    Burn: {}
});

describe("oneShotNFT", () => {

    const oneShotNFT = pfn([
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
                    input.extract("utxoRef").in( ({ utxoRef }) =>
                    
                        peqTxOutRef
                        .$( utxoRef )
                        .$( utxo )
        
                    )
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

    test("it compiles", () => {

        expect(
            () => compile( oneShotNFT )
        ).not.toThrow();
        
    });

})