import { pmatch, pByteString } from "../../PTypes";
import { RestrictedStructInstance } from "../../PTypes/PStruct/pstruct";
import { punBData, pisEmpty, punIData, pand, pBSToData } from "../../stdlib";
import { PByteString, PList, PPair, PInt, Term, PBool } from "../..";
import { ByteString } from "../../../../types/HexString/ByteString";
import { PPubKeyHash } from "../../API/V1/PubKey/PPubKeyHash";
import { PScriptContext } from "../../API/V2/ScriptContext/PScriptContext";
import { PCurrencySymbol } from "../../API/V1/Value/PCurrencySymbol";
import { TermPair } from "../../stdlib/UtilityTerms/TermPair";
import { Type } from "../../Term/Type/base";
import { pintToBS } from "../../stdlib/Int/pintToBS";
import { compile } from "../compile";
import { pdelay, perror, pfn, plet } from "../../Syntax/syntax";
import { data, bool, ConstantableTermType } from "../../Term/Type";

describe("NFTVendingMachine", () => {

    test("it builds", () => {

        const nftPolicy = pfn([

            Type.Data.BS, // owner public key hash

            Type.Data.BS, // counter thread identifier policy
            Type.Data.BS, // price oracle thread identifier policy
            
            data,
            PScriptContext.type

        ],  bool)
        (( ownerPkh, counterValId, priceOracleId, _rdmr, _ctx ) =>
            _ctx.extract("txInfo","purpose").in( ctx =>
            
            pmatch( ctx.purpose )
            .onMinting( _ => _.extract("currencySym").in( ({ currencySym: ownCurrSym }) =>

            ctx.txInfo.extract("inputs","outputs","mint","refInputs").in( tx =>
                
                tx.inputs.some( _txIn =>
                    _txIn.extract("resolved").in( ({ resolved }) =>
                    resolved.extract("value","datum").in( ({ value: inputValue, datum: _nftCounter }) =>

                        // includes the **verified** input of the counter
                        // since the token that verifies the utxo is unique
                        // it makes no sense to check for the validator hash too
                        inputValue.some( policy => policy.fst.eq( punBData.$( counterValId ) ) )

                        // and delays the computation; in this case is not a detail
                        // because otherwhise it would have ran for each element of the list
                        .and(
                            
                            pmatch( _nftCounter )
                            .onInlineDatum( _ => _.extract("datum").in( ({ datum: nftCounter }) =>

                                // checks that a SINGLE TOKEN is minted
                                // with `ownCurrSym` as policy,
                                // `NFTweet#<nftCounter>` as asset name
                                // and `1` as quantity
                                pisEmpty.$( tx.mint.tail )
                                .and(
                                    plet( tx.mint.head ).in( head =>
                                        
                                        // `ownCurrSym` as policy,
                                        head.fst.eq( ownCurrSym )
                                        .and(
                                            plet( head.snd ).in( assets =>
                                                pisEmpty.$( assets.tail )
                                                .and(
                                                    plet( assets.head ).in( asset =>
                                                        
                                                        // `1` as quantity
                                                        asset.snd.eq( 1 )
                                                        .and(

                                                            // `NFTweet#<nftCounter>` as asset name
                                                            asset.fst.eq(
                                                                pByteString(
                                                                    ByteString.fromAscii(
                                                                        "NFTweet#"
                                                                    )
                                                                ).concat(
                                                                    pintToBS.$( punIData.$( nftCounter ) )
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
                        tx.refInputs.head.extract("resolved").in( ({ resolved: oracleRefInput }) =>
                            oracleRefInput.extract("datum","value").in( oracle =>

                                // includes identifier
                                // safe if the token is unique (NFT)
                                oracle.value.some( valueEntry => valueEntry.fst.eq( punBData.$( priceOracleId ) ) )
                                .and(
                                    
                                    tx.outputs.some( output =>
                                    output.extract("address","value").in( out =>
                                        out.address.extract("credential").in( outAddr =>

                                            pand.$(

                                                //tx output going to owner
                                                pmatch( outAddr.credential )
                                                .onPPubKeyCredential( _ => _.extract("pkh").in( ({ pkh }) =>
                                                    pkh.eq( punBData.$( ownerPkh ) ) 
                                                ))
                                                ._( _ => perror( bool ) )
                                            
                                            ).$(pdelay(
                                                
                                                pmatch(
                                                    out.value.find( valueEntry =>
                                                        valueEntry.fst.length.eq( 0 ) // empty bytestring (policy of ADA)
                                                    )
                                                )
                                                .onJust( _ => _.extract("val").in((({val}: { val: TermPair<PByteString,PList<PPair<PByteString, PInt>>>}): Term<PBool> =>
                                                    
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
                                                ) as (extracted: RestrictedStructInstance<{ val: ConstantableTermType; }, ["val"]>) => Term<PBool>))
                                                .onNothing( _ => perror( bool ) ) as Term<PBool>

                                            ))

                                        )
                                    ))

                                )

                            )
                        )
                    )
                )
            )
            
            ))
            ._( _ => perror( bool ) )
        ))

        function makeNFTweetPolicy(
            owner: Term<typeof PPubKeyHash>,
            counterNFT: Term<typeof PCurrencySymbol>,
            priceOracleNFT: Term<typeof PCurrencySymbol>,
        )
        {
            return nftPolicy
            .$( pBSToData.$( owner as any ) )
            .$( pBSToData.$( counterNFT as any ) )
            .$( pBSToData.$( priceOracleNFT as any ) );
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