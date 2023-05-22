import { PPubKeyHash } from "../../API/V1/PubKey/PPubKeyHash";
import { PScriptContext } from "../../API/V2/ScriptContext/PScriptContext";
import { PCurrencySymbol } from "../../API/V1/Value/PCurrencySymbol";
import { compile } from "../compile";
import { bool, bs, data } from "../../type_system/types";
import { pmatch } from "../../PTypes/PStruct/pmatch";
import { pfn } from "../../lib/pfn";
import { pisEmpty } from "../../lib/builtins/list";
import { pByteString } from "../../lib/std/bs/pByteString";
import { pdigitToBS } from "../../lib/std/int/pintToBS";
import { punIData } from "../../lib/builtins/data";
import { perror } from "../../lib/perror";
import { pdelay } from "../../lib/pdelay";
import { pand } from "../../lib/builtins/bool";
import { Term } from "../../Term";
import { PBool } from "../../PTypes/PBool";
import { plet } from "../../lib/plet";
import { _old_plet } from "../../lib/plet/old";
import { ByteString } from "@harmoniclabs/bytestring";

describe("NFTVendingMachine", () => {

    test("it builds", () => {

        const nftPolicy = pfn([

            bs, // owner public key hash

            bs, // counter thread identifier policy
            bs, // price oracle thread identifier policy
            
            data,
            PScriptContext.type

        ],  bool)
        (( ownerPkh, counterValId, priceOracleId, _rdmr, _ctx ) =>
            _ctx.extract("tx","purpose").in( ctx =>
            
            pmatch( ctx.purpose )
            .onMinting( _ => _.extract("currencySym").in( ({ currencySym: ownCurrSym }) =>

            ctx.tx.extract("inputs","outputs","mint","refInputs").in( tx =>
                
                tx.inputs.some( _txIn =>
                    _txIn.extract("resolved").in( ({ resolved }) =>
                    resolved.extract("value","datum").in( ({ value: inputValue, datum: _nftCounter }) =>

                        // includes the **verified** input of the counter
                        // since the token that verifies the utxo is unique
                        // it makes no sense to check for the validator hash too
                        inputValue.some( policy => policy.fst.eq( counterValId ) )

                        // and delays the computation; in this case is not a detail
                        // because otherwhise it would have ran for each element of the list
                        .and(
                            
                            pmatch( _nftCounter )
                            .onInlineDatum( _ => _.extract("datum").in( ({ datum: nftCounter }) =>

                                // checks that a SINGLE TOKEN is minted
                                // with `ownCurrSym` as policy,
                                // `Collection#<nftCounter>` as asset name
                                // and `1` as quantity
                                pisEmpty.$( tx.mint.tail )
                                .and(
                                    plet( tx.mint.head ).in( head =>
                                        
                                        // `ownCurrSym` as policy,
                                        head.fst.eq( ownCurrSym )
                                        .and(
                                            _old_plet( head.snd ).in( assets =>
                                                pisEmpty.$( assets.tail )
                                                .and(
                                                    plet( assets.head ).in( asset =>
                                                        
                                                        // `1` as quantity
                                                        asset.snd.eq( 1 )
                                                        .and(

                                                            // `Collection#<nftCounter>` as asset name
                                                            asset.fst.eq(
                                                                pByteString(
                                                                    ByteString.fromAscii(
                                                                        "Collection#"
                                                                    )
                                                                ).concat(
                                                                    pdigitToBS.$( punIData.$( nftCounter ) )
                                                                )
                                                            )
                                                        )
                                                    )
                                                )
                                            )
                                        )
                                    )
                                )
                            ))
                            ._( _ => perror( bool ) )

                        )
                    ))
                )
                // finally checks for the price to be paid
                .and(
                    pisEmpty.$( tx.refInputs.tail )
                    .and(
                        (() => {

                            return tx.refInputs.head.extract("resolved").in( ({ resolved: oracleRefInput }) =>
                                oracleRefInput.extract("datum","value").in( oracle =>
    
                                    // includes identifier
                                    // safe if the token is unique (NFT)
                                    oracle.value.some( valueEntry => valueEntry.fst.eq( priceOracleId ) )
                                    .and(
                                        
                                        tx.outputs.some( output =>
                                        output.extract("address","value").in( out =>
                                            out.address.extract("credential").in( outAddr =>
    
                                                pand.$(
    
                                                    //tx output going to owner
                                                    pmatch( outAddr.credential )
                                                    .onPPubKeyCredential( _ => _.extract("pkh").in( ({ pkh }) =>
                                                        pkh.eq( ownerPkh ) 
                                                    ))
                                                    ._( _ => perror( bool ) )
                                                
                                                ).$(pdelay(
                                                    
                                                    pmatch(
                                                        out.value.find( valueEntry =>
                                                            valueEntry.fst.length.eq( 0 ) // empty bytestring (policy of ADA)
                                                        )
                                                    )
                                                    .onJust( _ => _.extract("val").in((({val}): Term<PBool> =>
                                                        
                                                        // list( pair( bs, int ) )
                                                        val.snd
                                                        // pair( bs, int )
                                                        .at( 0 )
                                                        // int ( lovelaces )
                                                        .snd.gtEq(
                                                            punIData.$( 
                                                                pmatch( oracle.datum )
                                                                .onInlineDatum( _ => _.extract("datum").in(({ datum }) => datum ))
                                                                ._( _ => perror( data ) )
                                                            )
                                                        )
                                                    )))
                                                    .onNothing( _ => perror( bool ) ) as Term<PBool>
    
                                                ) as any )
    
                                            )
                                        ))
    
                                    )
    
                                )
                            )
                        })()
                    )
                )
            )
            
            ))
            ._( _ => perror( bool ) )
        ) as any)

        function makeNFTweetPolicy(
            owner: Term<typeof PPubKeyHash>,
            counterNFT: Term<typeof PCurrencySymbol>,
            priceOracleNFT: Term<typeof PCurrencySymbol>,
        )
        {
            return nftPolicy
            .$( owner as any )
            .$( counterNFT as any )
            .$( priceOracleNFT as any );
        }

        compile(
            makeNFTweetPolicy(
                PPubKeyHash.from( pByteString("") ),
                PCurrencySymbol.from( pByteString("") ),
                PCurrencySymbol.from( pByteString("") )
            )
        )

    })
})