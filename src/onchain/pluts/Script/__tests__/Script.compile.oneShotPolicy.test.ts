import { bool, compile, termTypeToString } from "../..";
import { Machine } from "../../../CEK";
import { PTxId, PTxOutRef, V2 } from "../../API";
import { pstruct, pmatch } from "../../PTypes";
import { pByteString, pData, pDataB, pDataI, perror, pfn, pfstPair, pisEmpty, plet, punsafeConvertType } from "../../lib";
import { tx_v2, validatorSpendingUtxo } from "../../../test_utils";
import { ErrorUPLC } from "../../../UPLC/UPLCTerms/ErrorUPLC";
import { dataFromCbor } from "../../../../types/Data";
import { showUPLC } from "../../../UPLC/UPLCTerm";


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
    
                tx.mint.some( entry => {

                    console.log( termTypeToString( tx.mint.type ) );
                    console.log( termTypeToString( entry.type ) );
                    console.log( termTypeToString( entry.fst.type ) );
                    const fstFn = pfstPair( entry.type[1] as any, entry.type[2] as any );
                    console.log(
                        termTypeToString( fstFn.type )
                    );
                    console.log(
                        showUPLC(
                            fstFn.toUPLC(0)
                        )
                    );

                    return entry.fst.eq( ownCurrSym )

                    .and(
                        plet( entry.snd ).in( assets =>

                            pisEmpty.$( assets.tail )
                            .and(
                                assets.head.snd.eq( 1 )
                            )

                        )
                    )

                })

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

    test("no execution errors", () => {

        const oneshotParametrized = oneShotNFT.$(
            PTxOutRef.PTxOutRef({
                // 66f225ce3f1acd5e9b133a09b571af99ea4f0742741d008e482d3d33a7329da3#0
                id: PTxId.PTxId({
                    txId: pDataB("66f225ce3f1acd5e9b133a09b571af99ea4f0742741d008e482d3d33a7329da3")
                }) as any,
                index: pDataI(0)
            })
        );

        /*
        console.log(
            showUPLC(
                oneshotParametrized.toUPLC(0)
            )
        );
        //*/

        const result =  Machine.evalSimple(
            oneshotParametrized.$(
                MintRdmr.Mint({})
            ).$(
                // 66f225ce3f1acd5e9b133a09b571af99ea4f0742741d008e482d3d33a7329da3#0 context
                punsafeConvertType(
                    pData(
                        dataFromCbor(
                            "d8799fd8799f9fd8799fd8799fd8799f582066f225ce3f1acd5e9b133a09b571af99ea4f0742741d008e482d3d33a7329da3ff01ffd8799fd8799fd8799f581c63aca44c434f915147c4a42160667071e9807ade63a57f3d324cbdf9ffd8799fd8799fd8799f581c5a4d7254f8c71812472a875c0efb76657020d4520aa94d97e91d39b7ffffffffa340a1401a00989680581c0462de27174c88689ec9fe0e13777e1ed52285510300796e16b88acfa141591b000000e8d4a51000581c919d4c2c9455016289341b1a14dedf697687af31751170d56a31466ea141581b000000e8d4a51000d87980d87a80ffffd8799fd8799fd8799f582066f225ce3f1acd5e9b133a09b571af99ea4f0742741d008e482d3d33a7329da3ff02ffd8799fd8799fd8799f581c63aca44c434f915147c4a42160667071e9807ade63a57f3d324cbdf9ffd8799fd8799fd8799f581c5a4d7254f8c71812472a875c0efb76657020d4520aa94d97e91d39b7ffffffffa140a1401b000000012a05f200d87980d87a80ffffd8799fd8799fd8799f582066f225ce3f1acd5e9b133a09b571af99ea4f0742741d008e482d3d33a7329da3ff06ffd8799fd8799fd8799f581c63aca44c434f915147c4a42160667071e9807ade63a57f3d324cbdf9ffd8799fd8799fd8799f581c5a4d7254f8c71812472a875c0efb76657020d4520aa94d97e91d39b7ffffffffa140a1401b000000012a05f200d87980d87a80ffffff809fd8799fd8799fd8799f581c63aca44c434f915147c4a42160667071e9807ade63a57f3d324cbdf9ffd8799fd8799fd8799f581c5a4d7254f8c71812472a875c0efb76657020d4520aa94d97e91d39b7ffffffffa140a14000d87980d87a80ffd8799fd8799fd87a9f581c3e1851ac6d1fe40535fc1789d2bca08ee54a23890e4f58659975e600ffd8799fd8799fd8799f581c5a4d7254f8c71812472a875c0efb76657020d4520aa94d97e91d39b7ffffffffa440a1401a004c4b40581c0462de27174c88689ec9fe0e13777e1ed52285510300796e16b88acfa1415901581c919d4c2c9455016289341b1a14dedf697687af31751170d56a31466ea1415801581cdc5450bbbeb53a9b4188d864cbc843f4d5b983f7837ada45f66ec986a142494401d87b9f02ffd87a80ffd8799fd8799fd8799f581c63aca44c434f915147c4a42160667071e9807ade63a57f3d324cbdf9ffd8799fd8799fd8799f581c5a4d7254f8c71812472a875c0efb76657020d4520aa94d97e91d39b7ffffffffa340a1401a00989680581c0462de27174c88689ec9fe0e13777e1ed52285510300796e16b88acfa141591b000000e8d4a50fff581c919d4c2c9455016289341b1a14dedf697687af31751170d56a31466ea141581b000000e8d4a50fffd87980d87a80ffffa140a14000a240a14000581cdc5450bbbeb53a9b4188d864cbc843f4d5b983f7837ada45f66ec986a14249440180a0d8799fd8799fd87980d87a80ffd8799fd87b80d87a80ffff80a1d8799f581cdc5450bbbeb53a9b4188d864cbc843f4d5b983f7837ada45f66ec986ffd87980a0d8799f5820dab0da56ef1ff8b0e2ae7bd89c935a3f828e9d3c33df3b135db23c9cb9a7d2f0ffffd8799f581cdc5450bbbeb53a9b4188d864cbc843f4d5b983f7837ada45f66ec986ffff"
                        )
                    ),
                    V2.PScriptContext.type
                )
            )
        );

        // console.log( result );

        expect(
            result instanceof ErrorUPLC
        ).toBe( false );
        
    })

})