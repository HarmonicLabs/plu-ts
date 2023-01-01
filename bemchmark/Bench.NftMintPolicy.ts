import { PAlias, PInt, PList, PPair, PrimType, Term, bool, bs, data, int, pInt, peqInt, perror, pfn, pfstPair, plam, plet, psliceBs, psndPair, pstruct, punBData } from "../src"
import PTxOutRef from "../src/onchain/pluts/API/V1/Tx/PTxOutRef"
import PCurrencySymbol from "../src/onchain/pluts/API/V1/Value/PCurrencySymbol";
import PTokenName from "../src/onchain/pluts/API/V1/Value/PTokenName";
import PScriptContext from "../src/onchain/pluts/API/V2/ScriptContext/PScriptContext";
import pmatch from "../src/onchain/pluts/PTypes/PStruct/pmatch";
import { UtilityTermOf } from "../src/onchain/pluts/stdlib/UtilityTerms/addUtilityForType";
import plookupCurrencySymOrFail from "./utils/plookupCurrencySymOrFail";

const Redeemer = pstruct({
    Mint: {
        utxoRef: PTxOutRef.type
    },
    Burn: {}
});

function mkNftPolicyTerm( dn: Term<PInt> )
{
    return pfn([
        data, // PCurrencySymbol.type,
        Redeemer.type,
        PScriptContext.type
    ],  bool)
    (( nftCsAsData, rdmr, _ctx ) =>
    
    _ctx.extract("txInfo","purpose").in( ctx => 
    ctx.txInfo.extract("inputs","mint").in( tx =>    

        pmatch( ctx.purpose )
        .onMinting( _ => _.extract("currencySym").in(({ currencySym }) =>

        plet(
            plookupCurrencySymOrFail.$( tx.mint ).$( currencySym  )
        ).in( (assets: UtilityTermOf<PList<PPair<PAlias<[PrimType.BS], symbol>, PInt>>>) => 

            pmatch( rdmr )
            .onMint( _ => _.extract("utxoRef").in( ({ utxoRef }) =>
            
            utxoRef.extract("id","index").in( spendingUtxo =>
            spendingUtxo.id.extract("txId").in( ({ txId: spendingTxId }) => {

            // inlined
            const dropN = psliceBs.$( dn ).$( pInt(32).sub( dn ) );

            // inlined
            const tokenNameTail = dropN.$( spendingTxId );

            // inlined
            const assetTokenNames = assets.map( pfstPair( PTokenName.type, int ) );
            // inlined
            const assetValues = assets.map( psndPair( PTokenName.type, int ) );

            // inlined
            const nftAssets = plookupCurrencySymOrFail.$( tx.mint ).$( PCurrencySymbol.from( punBData.$( nftCsAsData ) ) )

            // is spending utxo
            return tx.inputs.some( input =>
                input.extract("utxoRef").in( ({ utxoRef }) =>
                utxoRef.extract("id","index").in( inputRef =>

                inputRef.index.eq( spendingUtxo.index )
                .and(
                    inputRef.id.extract("txId").in( ({ txId: inputTxId }) =>

                    inputTxId.eq( spendingTxId )
                ))
            
            )))
            .and(
                assetTokenNames.every( tn => dropN.$( tn ).eq( tokenNameTail ) )
            )
            .and(
                assetValues.every( peqInt.$( 1 ) )
            )
            .and(
                punBData.$( nftCsAsData ).eq("")
                .or(
                    punBData.$( nftCsAsData ).eq(
                        currencySym
                    )
                )
            )

            }))))
            .onBurn( _ =>
                assets.every( entry => entry.snd.eq( -1 ) )
            )
        
        )))._( _ => perror( bool ) )
    )))
}