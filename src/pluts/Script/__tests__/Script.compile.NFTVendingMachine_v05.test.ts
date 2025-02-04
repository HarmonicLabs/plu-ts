import { PPubKeyHash } from "../../API/V1/PubKey/PPubKeyHash";
import { PScriptContext } from "../../API/V2/ScriptContext/PScriptContext";
import { PCurrencySymbol } from "../../API/V1/Value/PCurrencySymbol";
import { compile } from "../compile";
import { bool, bs, data } from "../../../type_system/types";
import { pfn } from "../../lib/pfn";
import { pisEmpty } from "../../lib/builtins/list";
import { pByteString } from "../../lib/std/bs/pByteString";
import { punIData } from "../../lib/builtins/data";
import { perror } from "../../lib/perror";
import { pdelay } from "../../lib/pdelay";
import { pand } from "../../lib/builtins/bool";
import { Term } from "../../Term";
import { PBool } from "../../PTypes/PBool";
import { plet } from "../../lib/plet";
import { ByteString } from "@harmoniclabs/bytestring";
import { pshowInt } from "../../lib/show/int";
import { pmatch } from "../../lib/pmatch";

describe("NFTVendingMachine", () => {

    test.skip("it builds", () => {

        const nftPolicy = pfn([

            bs, // owner public key hash

            bs, // counter thread identifier policy
            bs, // price oracle thread identifier policy
            
            data,
            V2.PScriptContext.type

        ],  bool)
        (( ownerPkh, counterValId, priceOracleId, _rdmr, { tx, purpose } ) =>  {

            const ownCurrSym = plet(
                pmatch( purpose )
                .onMinting( ({ currencySym }) => currencySym )
                ._( _ => perror( bs ) )
            )
            
            return tx.inputs.some( ({ resolved: { value: inputValue, datum: _nftCounter } }) =>

                // includes the **verified** input of the counter
                // since the token that verifies the utxo is unique
                // it makes no sense to check for the validator hash too
                inputValue.some( entry => entry.policy.eq( counterValId ) )

                // and delays the computation; in this case is not a detail
                // because otherwhise it would have ran for each element of the list
                .and(
                    
                    pmatch( _nftCounter )
                    .onInlineDatum(({ datum: nftCounter }) => {

                        const minted = plet( tx.mint.head );

                        const assets = plet( minted.snd );
                        
                        const condition = pisEmpty.$( assets.tail )
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
                                            pshowInt.$( punIData.$( nftCounter ) )
                                        )
                                    )
                                )
                            )
                        );
    
                        // `ownCurrSym` as policy,
                        // checks that a SINGLE TOKEN is minted
                        // with `ownCurrSym` as policy,
                        // `Collection#<nftCounter>` as asset name
                        // and `1` as quantity
                        return pisEmpty.$( tx.mint.tail )
                        .and( minted.fst.eq( ownCurrSym ) )
                        .and( condition )
                    })
                    ._( _ => perror( bool ) )

                )
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
        })

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