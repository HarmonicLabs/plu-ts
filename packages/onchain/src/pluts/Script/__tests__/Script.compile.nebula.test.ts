import { fromUtf8 } from "@harmoniclabs/uint8array-utils";
import { Script, ScriptType } from "@harmoniclabs/cardano-ledger-ts";
import { pByteString } from "../../lib/std/bs/pByteString";
import { pfn } from "../../lib/pfn";
import { PAssetsEntryT, PValue, PValueEntryT } from "../../API/V1/Value/PValue";
import { bool, bs, data, fn, int, lam, list, map, unit } from "../../type_system/types";
import { plet } from "../../lib/plet";
import { phoist } from "../../lib/phoist";
import { PCurrencySymbol } from "../../API/V1/Value/PCurrencySymbol";
import { Term } from "../../Term";
import { compile } from "../compile";
import { makeValidator } from "../makeScript";
import { pif, pnot } from "../../lib/builtins/bool";
import { pInt } from "../../lib/std/int/pInt";
import { pdelay } from "../../lib/pdelay";
import { papp } from "../../lib/papp";
import { precursiveList } from "../../lib/std/list/precursiveList";
import { PMaybe } from "../../lib/std/PMaybe/PMaybe";
import { pstruct } from "../../PTypes/PStruct/pstruct";
import { PScriptContext } from "../../API/V2/ScriptContext/PScriptContext";
import { PTokenName } from "../../API/V1/Value/PTokenName";
import { PPubKeyHash } from "../../API/V1/PubKey/PPubKeyHash";
import { PAddress } from "../../API/V1/Address/PAddress";
import { pmatch } from "../../PTypes/PStruct/pmatch";
import { perror } from "../../lib/perror";
import { PTxOutRef } from "../../API/V1/Tx/PTxOutRef";
import { palias } from "../../PTypes/PAlias/palias";
import { POutputDatum } from "../../API/V2/Tx/POutputDatum";
import { pConstrToData, peqData, punBData, punListData } from "../../lib/builtins/data";
import { pList } from "../../lib/std/list/const";
import { pBool } from "../../lib/std/bool/pBool";
import { PTxInInfo } from "../../API/V2/Tx/PTxInInfo";
import { pforce } from "../../lib/pforce";
import { addUtilityForType } from "../../lib/addUtilityForType";
import { punsafeConvertType } from "../../lib/punsafeConvertType";
import { PTxOut } from "../../API/V2/Tx/PTxOut";
import { precursive } from "../../lib/precursive";
import { TermInt } from "../../lib/std/UtilityTerms/TermInt";
import { pchooseList, pisEmpty } from "../../lib/builtins/list";
import { ptraceError } from "../../lib/builtins/ptrace";
import { peqBs } from "../../lib/builtins/bs";
import { pmakeUnit } from "../../lib/std/unit/pmakeUnit";

const pvalueOf = phoist(
    pfn([
        PCurrencySymbol.type,
        PTokenName.type
    ],  lam( PValue.type, int ))
    (( currSym, tokenName ) =>
        
        // search currency symbol
        // 0 if not found
        precursiveList( int, PValueEntryT )
        .$( _self => pdelay( pInt(0) ) )
        .$( 
            pfn([
                fn([ list(PValueEntryT) ], int ),
                PValueEntryT,
                list( PValueEntryT )
            ],  int)

            ((self, head, tail ) =>
                pif( int ).$( head.fst.eq( currSym ) )
                .then(

                    // search token name
                    // 0 if not found
                    precursiveList( int, PAssetsEntryT )
                    .$( _self => pdelay( pInt(0) ) )
                    .$(
                        pfn([
                            fn([ list(PAssetsEntryT) ], int ),
                            PAssetsEntryT,
                            list( PAssetsEntryT )
                        ],  int)

                        ((self, head, tail) =>
                            pif( int ).$( head.fst.eq( tokenName ) )
                            .then( head.snd )
                            .else( papp( self, tail ) as any )
                        )
                    )
                    .$( head.snd )

                )
                .else( papp( self, tail ) as any )
            )
        ) as any
        // .$( value )
    )
);

const scriptOwner = pByteString( fromUtf8( "ScriptOwner" ) );

const txSignedByNebulaValidator = pfn([
    PValue.type,
    PValue.type,
],  bool)
(( mint, spendingValue ) =>

    spendingValue.some( entry =>
        entry.snd.some( assets => {

            const tokenName = plet( assets.fst );

            return tokenName.eq( scriptOwner )
            .and(
                pvalueOf
                .$( entry.fst )
                .$( tokenName as any )
                .$( mint )
                .lt( 0 )
            )
        })
    )

)


const TraitOption = pstruct({
    MustHave: { trait: bs },
    MustNotHave: { trait: bs }
})

const BidOption = pstruct({
    SpecificValue: {
        value: PValue.type
    },
    SpecificPolicyId: {
        policyId: PCurrencySymbol.type,
        types: list( bs ),
        traits: list( TraitOption.type )
    }
})

const PaymentDatum = pstruct({
    PaymentDatum: { utxoRef: PTxOutRef.type }
})

const RoyalityRecipient = pstruct({
    RoyalityRecipient: {
        addr: PAddress.type,
        feePercentage: int,
        minFee: PMaybe( int ).type,
        maxFee: PMaybe( int ).type
    }
})

const RoyalityInfo = pstruct({
    RoyalityInfo: {
        recipients: list( RoyalityRecipient.type ),
        version: int
    }
})


const PMaybeInt = PMaybe( int );

const adjustMaxFee = pfn([
    int,
    PMaybeInt.type
],  int)
(( fee, maybeMax ) => 
    pmatch( maybeMax )
    .onNothing( _ => fee )
    .onJust( ({ val: maxFee }) => 
        
        pif( int ).$( maxFee.ltEq( fee ) )
        .then( maxFee )
        .else( fee )

    )
);

const adjustMinFee = pfn([
    int,
    PMaybeInt.type
],  int)
(( fee, maybeMin ) => 
    pmatch( maybeMin )
    .onNothing( _ => fee )
    .onJust( ({ val: minFee }) => 
        
        pif( int ).$( fee.ltEq( minFee ) )
        .then( minFee )
        .else( fee )
        
    )
);

const Metadata = palias( map( bs, data ) );

const DatumMetadata = pstruct({
    DatumMetadata: {
        metadata: Metadata.type,
        version: int
    }
})

const TradeAction = pstruct({
    Sell: {},
    Buy: {},
    Cancel: {}
})

const TradeDatum = pstruct({
    Listing: {
        owner: PAddress.type,
        priceLovelaces: int,
        privateListing: PMaybe( PAddress.type ).type
    },
    Bid: {
        owner: PAddress.type,
        option: BidOption.type
    }
})

interface ContractParams {
    protocolKey?: Term<typeof PPubKeyHash>,
    royalityTokenPolicy: Term<typeof PCurrencySymbol> 
    royalityTokenName: Term<typeof PTokenName> 
}

const plovelacesOf = phoist(
    pvalueOf
    .$( PCurrencySymbol.from("") )
    .$( PTokenName.from("") ) 
)

const checkRoyalty = pfn([
    list( PTxOut.type ),
    data,
    int
],  fn( [ list( RoyalityRecipient.type ), int ], int ) )
(( txOuts, paymentDatum, lovelacesIn /* owners, lovelacesLeft */ ) =>

    plet(
        lovelacesIn.mult( 10 )
    ).in( lovelacesIn10 => 

    precursive(
        pfn([
            
            fn([
                list( RoyalityRecipient.type ),
                int
            ], int ),

            list( RoyalityRecipient.type ),
            int

        ], int)
        (( self, owners, lovelacesLeft ) => {

            const toPay = owners.head;

            const feeToPay = plet( lovelacesIn10.div( toPay.feePercentage ) );

            const adjustedFee = plet(
                adjustMaxFee
                .$(
                    adjustMinFee
                    .$( feeToPay )
                    .$( toPay.minFee )
                )
                .$( toPay.maxFee )
            )

            // inlined
            const hasPaid = ( (fee: TermInt) => {

                const isAddrToPay = plet( toPay.addr.eqTerm );

                const isCorrectDatum = plet( peqData.$( paymentDatum ) );

                const emptyBs = pByteString("");

                return txOuts.some( out =>
                                    
                    isAddrToPay.$( out.address as any )
                    .and( isCorrectDatum.$( out.datum as any ) )
                    .and(
                        fee.ltEq(
                            pvalueOf.$( emptyBs as any ).$( emptyBs as any ).$( out.value )
                        )
                    )
            
                )
            })

            return pchooseList( RoyalityRecipient.type, int ).$( owners )
            .caseNil( lovelacesLeft )
            .caseCons(
                pif( int ).$( hasPaid( adjustedFee ) )
                .then(
                    self
                    .$( owners.tail )
                    .$( lovelacesLeft.sub( adjustedFee ) )
                )
                .else( -1 )
            )
        })
    ))
)

const contract = ( params: ContractParams ) => pfn([
    TradeDatum.type,
    TradeAction.type,
    PScriptContext.type
],  bool)
(( tradeDatum, action, ctx ) => {

        const { tx, purpose } = ctx;

        const ownUtxoRef = plet(
            pmatch( purpose )
            .onSpending( ({ utxoRef }) => utxoRef )
            ._( _ => perror( PTxOutRef.type ) )
        );

        const ownInputValue = plet(
            pmatch(
                tx.inputs.find( input => input.utxoRef.eq( ownUtxoRef ) )
            )
            .onJust( ({ val }) => val.resolved.value )
            .onNothing( _ => perror( PValue.type ) as any )
        );

        const ownInputLovelaces = plet(
            plovelacesOf.$( ownInputValue as any )
        );

        const paymentOutDatum = plet(
            POutputDatum.InlineDatum({
                datum: pConstrToData
                    .$( 0 )
                    .$(
                        pList( data )
                        ([ ownUtxoRef as any ])
                    )
            })
        );

        const paidProtocol = ( params.protocolKey instanceof Term ) ?
        (() => {
            const protocolPkh = plet( params.protocolKey );

            return tx.outputs.some( out =>
                pmatch( out.address.credential )
                .onPPubKeyCredential(({ pkh }) => pkh.eq( protocolPkh ))
                ._( _ => pBool( false )) 
            );
        })() : undefined;

        const royalityTokenPolicy = plet( params.royalityTokenPolicy );
        const royalityTokenName =   plet( params.royalityTokenName   );
        
        const delayedRoyalityOracleIn = plet(
            pdelay(
                pmatch(
                    tx.refInputs.find( ({ resolved: refIn }) => 
                        pvalueOf
                        .$( royalityTokenPolicy as any )
                        .$( royalityTokenName   as any )
                        .$( refIn.value )
                        .eq( 1 )
                    )
                )
                .onJust(({ val }) => val)
                .onNothing( _ => perror( PTxInInfo.type ))
            )
        )
        
        const delayedLovelacesInAfterFee = plet(
            pdelay(
                pmatch( pforce( delayedRoyalityOracleIn ).resolved.datum )
                .onInlineDatum( ({ datum: datumData }) => {

                    const { recipients } = addUtilityForType(RoyalityInfo.type)
                    (punsafeConvertType( datumData, RoyalityInfo.type ));

                    return checkRoyalty
                        .$( tx.outputs )
                        .$( paymentOutDatum as any )
                        .$( ownInputLovelaces )
                        .$( recipients )
                        .$( ownInputLovelaces )
                })
                ._( _ => perror( int ) )
            )
        );

        return pmatch( action )
        .onSell( _ => pmatch( tradeDatum )
            .onListing( _ => perror( bool ) )
            .onBid( bid => {

                const nonNegativePaidFee = pInt( 0 ).ltEq( pforce( delayedLovelacesInAfterFee ) );

                const paidBuyer = pmatch( bid.option )
                    .onSpecificValue(({ value: requestedValue }) =>
                        tx.outputs.some( out =>
                            
                            bid.owner.eq( out.address )
                            .and( out.datum.eq( paymentOutDatum ) )
                            .and(
                                requestedValue.every( requestedEntry => {

                                    const requestedAssets = plet( requestedEntry.snd )

                                    // exclude ADA
                                    return requestedEntry.fst.eq("").or(

                                        requestedAssets.every( requestedAsset => 

                                            // out.value includes requested asset quantity
                                            pvalueOf
                                            .$( requestedEntry.fst )
                                            .$( requestedAsset.fst )
                                            .$( out.value )
                                            .eq( requestedAsset.snd )
                                            
                                        )

                                    );
                                })
                            )
                        )
                    )
                    .onSpecificPolicyId( ({ policyId, types, traits }) => 
                        tx.outputs.some( out =>

                            bid.owner.eq( out.address )
                            .and( out.datum.eq( paymentOutDatum ) )
                            .and(
                                out.value.some( entry => {

                                    const asseName = plet( entry.snd.head.fst  );

                                    return entry.fst.eq( policyId )
                                    .and(
                                        tx.refInputs.some(({ resolved: metadataInput }) => {

                                            const metadata = plet(

                                                pmatch( metadataInput.datum )
                                                .onInlineDatum( ({ datum }) => punsafeConvertType( datum, DatumMetadata.type ).metadata )
                                                .onNoDatum( _ => perror( Metadata.type ) as any )
                                                .onDatumHash( _ => ptraceError( Metadata.type ).$("dh") ) // datum hash not supported
            
                                            );

                                            const assetName = plet( entry.snd.head.fst );

                                            const hasType =
                                                pisEmpty.$( types ) 
                                                .or(
                                                    plet(
                                                        pmatch(
                                                            metadata.find( entry => entry.fst.eq( fromUtf8("type") )  )
                                                        )
                                                        .onJust( just => punBData.$( just.val.snd ) )
                                                        .onNothing( _ => perror( bs ) )
                                                    ).in( metadataType => 
                                                        types.some( peqBs.$( metadataType ) )
                                                    )
                                                )

                                            const hasTraits =
                                            pisEmpty.$( traits )
                                            .or(

                                                plet(
                                                    pmatch( metadata.find( entry => entry.fst.eq( fromUtf8("traits") )  ) )
                                                    .onJust( just => punListData.$( just.val.snd ) .map( punBData ) )
                                                    .onNothing( _ => perror( list( bs ) ) )
                                                    .someTerm
                                                ).in( someTrait =>
                                                    traits.every( _trait =>
                                                        pmatch(  punsafeConvertType( _trait, TraitOption.type ) )
                                                        .onMustHave(({ trait }) => someTrait.$( trait.eqTerm ) )
                                                        .onMustNotHave(({ trait }) =>
                                                            pnot.$( someTrait.$( trait.eqTerm )) )
                                                    )
                                                )
                                            );

                                            return pvalueOf
                                            .$( policyId )
                                            .$(
                                                PTokenName.from(
                                                    pByteString( new Uint8Array([0,6,67,176]) )
                                                    .concat(
                                                        assetName
                                                        .slice( 4 , assetName.length )
                                                    )
                                                )
                                            )
                                            .$( metadataInput.value )
                                            .eq( 1 )
                                            .and( hasType )
                                            .and( hasTraits )
                                        })
                                    )
                                })
                            )
                        )
                    );

                const finalStatement = nonNegativePaidFee.and( paidBuyer );

                if( paidProtocol instanceof Term )
                {
                    return finalStatement.and( paidProtocol )
                }

                return finalStatement;
            })
        )
        .onBuy( _ =>
            pmatch( tradeDatum )
            .onBid( _ => perror( bool ) )
            .onListing( listing => {
    
                const privateListingOk =
                    pmatch( listing.privateListing )
                    .onJust( ({ val: owner }) =>
    
                        pmatch( owner.credential )
                        .onPPubKeyCredential( ({ pkh }) => tx.signatories.some( pkh.eqTerm as any ) )
                        .onPScriptCredential( _ => txSignedByNebulaValidator.$( tx.mint ).$( ownInputValue as any ) )
    
                    )
                    .onNothing( _ => pBool( true ) );

                const remainingLovelaces = plet(
                    pforce( delayedLovelacesInAfterFee )
                );

                const allOutsToOwner = plet(
                    tx.outputs.filter( out =>
                        out.address.eq( listing.owner )
                        .and( out.datum.eq( paymentOutDatum ) )
                    )
                );

                // inlined
                const lovelacesToOwner = pif( int ).$( pisEmpty.$( allOutsToOwner.tail ) )
                .then(
                    plovelacesOf
                    .$( allOutsToOwner.head.value )
                )
                .else( perror( int ) );

                // inlined
                const paidOwnerWDatum = lovelacesToOwner.gtEq( remainingLovelaces )
                
                const finalStatement = paidOwnerWDatum
                .and(  privateListingOk );

                if( paidProtocol instanceof Term )
                {
                    return finalStatement.and( paidProtocol )
                }

                return finalStatement;
            })
        )
        .onCancel( _ => {

            const owner = plet(
                pmatch( tradeDatum )
                .onBid(({ owner }) => owner )
                .onListing(({ owner }) => owner )
            );

            return pmatch( owner.credential )
            .onPPubKeyCredential(({ pkh }) =>
                tx.signatories.some( pkh.eqTerm as any )
            )
            .onPScriptCredential( _ => txSignedByNebulaValidator.$( tx.mint ).$( ownInputValue as any ) ) 
        });
});

const untypedValidator = ( params: ContractParams ) => makeValidator( contract( params ) );

const compiledContract = ( params: ContractParams ) => compile( untypedValidator( params ) );

const mkScript = ( params: ContractParams ) => new Script(
    ScriptType.PlutusV2,
    compiledContract( params )
);

test("compiles", () => {

    // const script = mkScript({
    //     royalityTokenName: PTokenName.from("ff".repeat(28)),
    //     royalityTokenPolicy: PCurrencySymbol.from("ff".repeat(28)),
    // });

    const RoyaltyToken = pstruct({
        RoyaltyToken: {
            policyId: PCurrencySymbol.type,
            assetName: PTokenName.type
        }
    });

    const lowLevel_contract = pfn([
        data, // PMaybe( PPubKeyHash.type ).type,
        RoyaltyToken.type,

        TradeDatum.type,
        TradeAction.type,
        PScriptContext.type
    ],  unit)
    ((  maybeProtocolKey,
        royalityToken,
        tradeDatum, action, ctx ) => {

            const { tx, purpose } = ctx;

            const ownUtxoRef = plet(
                pmatch( purpose )
                .onSpending( ({ utxoRef }) => utxoRef )
                ._( _ => perror( PTxOutRef.type ) )
            );

            const ownInputValue = plet(
                pmatch(
                    tx.inputs.find( input => input.utxoRef.eq( ownUtxoRef ) )
                )
                .onJust( ({ val }) => val.resolved.value )
                .onNothing( _ => perror( PValue.type ) as any )
            );

            const ownInputLovelaces = plet(
                plovelacesOf.$( ownInputValue as any )
            );

            const paymentOutDatum = plet(
                POutputDatum.InlineDatum({
                    datum: pConstrToData
                        .$( 0 )
                        .$(
                            pList( data )
                            ([ ownUtxoRef as any ])
                        )
                })
            );

            const paidProtocol = plet(
                pmatch(
                    punsafeConvertType(
                        maybeProtocolKey,
                        PMaybe( PPubKeyHash.type ).type
                    )
                )
                .onJust(({ val: protocolPkh }) =>
                    tx.outputs.some( out =>
                        pmatch( out.address.credential )
                        .onPPubKeyCredential(({ pkh }) => pkh.eq( protocolPkh ))
                        ._( _ => pBool( false )) 
                    )
                )
                .onNothing( _ => pBool( true ) )
            );

            const royalityTokenPolicy = plet( royalityToken.policyId );
            const royalityTokenName =   plet( royalityToken.assetName );
            
            const delayedRoyalityOracleIn = plet(
                pdelay(
                    pmatch(
                        tx.refInputs.find( ({ resolved: refIn }) => 
                            pvalueOf
                            .$( royalityTokenPolicy as any )
                            .$( royalityTokenName   as any )
                            .$( refIn.value )
                            .eq( 1 )
                        )
                    )
                    .onJust(({ val }) => val)
                    .onNothing( _ => perror( PTxInInfo.type ))
                )
            )
            
            const delayedLovelacesInAfterFee = plet(
                pdelay(
                    pmatch( pforce( delayedRoyalityOracleIn ).resolved.datum )
                    .onInlineDatum( ({ datum: datumData }) => {

                        const { recipients } = addUtilityForType(RoyalityInfo.type)
                        (punsafeConvertType( datumData, RoyalityInfo.type ));

                        return checkRoyalty
                            .$( tx.outputs )
                            .$( paymentOutDatum as any )
                            .$( ownInputLovelaces )
                            .$( recipients )
                            .$( ownInputLovelaces )
                    })
                    ._( _ => perror( int ) )
                )
            );

            return pif( unit ).$(
            pmatch( action )
            .onSell( _ => pmatch( tradeDatum )
                .onListing( _ => perror( bool ) )
                .onBid( bid => {

                    const nonNegativePaidFee = pInt( 0 ).ltEq( pforce( delayedLovelacesInAfterFee ) );

                    const paidBuyer = pmatch( bid.option )
                        .onSpecificValue(({ value: requestedValue }) =>
                            tx.outputs.some( out =>
                                
                                bid.owner.eq( out.address )
                                .and( out.datum.eq( paymentOutDatum ) )
                                .and(
                                    requestedValue.every( requestedEntry => {

                                        const requestedAssets = plet( requestedEntry.snd )

                                        // exclude ADA
                                        return requestedEntry.fst.eq("").or(

                                            requestedAssets.every( requestedAsset => 

                                                // out.value includes requested asset quantity
                                                pvalueOf
                                                .$( requestedEntry.fst )
                                                .$( requestedAsset.fst )
                                                .$( out.value )
                                                .eq( requestedAsset.snd )
                                                
                                            )

                                        );
                                    })
                                )
                            )
                        )
                        .onSpecificPolicyId( ({ policyId, types, traits }) => 
                            tx.outputs.some( out =>

                                bid.owner.eq( out.address )
                                .and( out.datum.eq( paymentOutDatum ) )
                                .and(
                                    out.value.some( entry => {

                                        const asseName = plet( entry.snd.head.fst  );

                                        return entry.fst.eq( policyId )
                                        .and(
                                            tx.refInputs.some(({ resolved: metadataInput }) => {

                                                const metadata = plet(

                                                    pmatch( metadataInput.datum )
                                                    .onInlineDatum( ({ datum }) => punsafeConvertType( datum, DatumMetadata.type ).metadata )
                                                    .onNoDatum( _ => perror( Metadata.type ) as any )
                                                    .onDatumHash( _ => ptraceError( Metadata.type ).$("dh") ) // datum hash not supported
                
                                                );

                                                const assetName = plet( entry.snd.head.fst );

                                                const hasType =
                                                    pisEmpty.$( types ) 
                                                    .or(
                                                        plet(
                                                            pmatch(
                                                                metadata.find( entry => entry.fst.eq( fromUtf8("type") )  )
                                                            )
                                                            .onJust( just => punBData.$( just.val.snd ) )
                                                            .onNothing( _ => perror( bs ) )
                                                        ).in( metadataType => 
                                                            types.some( peqBs.$( metadataType ) )
                                                        )
                                                    )

                                                const hasTraits =
                                                pisEmpty.$( traits )
                                                .or(

                                                    plet(
                                                        pmatch( metadata.find( entry => entry.fst.eq( fromUtf8("traits") )  ) )
                                                        .onJust( just => punListData.$( just.val.snd ) .map( punBData ) )
                                                        .onNothing( _ => perror( list( bs ) ) )
                                                        .someTerm
                                                    ).in( someTrait =>
                                                        traits.every( _trait =>
                                                            pmatch(  punsafeConvertType( _trait, TraitOption.type ) )
                                                            .onMustHave(({ trait }) => someTrait.$( trait.eqTerm ) )
                                                            .onMustNotHave(({ trait }) =>
                                                                pnot.$( someTrait.$( trait.eqTerm )) )
                                                        )
                                                    )
                                                );

                                                return pvalueOf
                                                .$( policyId )
                                                .$(
                                                    PTokenName.from(
                                                        pByteString( new Uint8Array([0,6,67,176]) )
                                                        .concat(
                                                            assetName
                                                            .slice( 4 , assetName.length )
                                                        )
                                                    )
                                                )
                                                .$( metadataInput.value )
                                                .eq( 1 )
                                                .and( hasType )
                                                .and( hasTraits )
                                            })
                                        )
                                    })
                                )
                            )
                        );

                    return nonNegativePaidFee.and( paidBuyer ).and( paidProtocol );
                })
            )
            .onBuy( _ =>
                pmatch( tradeDatum )
                .onBid( _ => perror( bool ) )
                .onListing( listing => {
        
                    const privateListingOk =
                        pmatch( listing.privateListing )
                        .onJust( ({ val: owner }) =>
        
                            pmatch( owner.credential )
                            .onPPubKeyCredential( ({ pkh }) => tx.signatories.some( pkh.eqTerm as any ) )
                            .onPScriptCredential( _ => txSignedByNebulaValidator.$( tx.mint ).$( ownInputValue as any ) )
        
                        )
                        .onNothing( _ => pBool( true ) );

                    const remainingLovelaces = plet(
                        pforce( delayedLovelacesInAfterFee )
                    );

                    const allOutsToOwner = plet(
                        tx.outputs.filter( out =>
                            out.address.eq( listing.owner )
                            .and( out.datum.eq( paymentOutDatum ) )
                        )
                    );

                    // inlined
                    const lovelacesToOwner = pif( int ).$( pisEmpty.$( allOutsToOwner.tail ) )
                    .then(
                        plovelacesOf
                        .$( allOutsToOwner.head.value )
                    )
                    .else( perror( int ) );

                    // inlined
                    const paidOwnerWDatum = lovelacesToOwner.gtEq( remainingLovelaces )
                    
                    return paidOwnerWDatum
                    .and(  privateListingOk )
                    .and(  paidProtocol );
                })
            )
            .onCancel( _ => {

                const owner = plet(
                    pmatch( tradeDatum )
                    .onBid(({ owner }) => owner )
                    .onListing(({ owner }) => owner )
                );

                return pmatch( owner.credential )
                .onPPubKeyCredential(({ pkh }) =>
                    tx.signatories.some( pkh.eqTerm as any )
                )
                .onPScriptCredential( _ => txSignedByNebulaValidator.$( tx.mint ).$( ownInputValue as any ) ) 
            })

            // wrapper if
            )
            .then( pmakeUnit() )
            .else( perror( unit ) );
    });

    const compiledContract = compile( lowLevel_contract );

    const script = new Script(
        "PlutusScriptV2",
        compiledContract
    );

    expect( script instanceof Script ).toBe( true );

});