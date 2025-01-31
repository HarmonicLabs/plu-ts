import {
    pByteString,
    pList,
    toData,
    bs,
    pDataI,
    pPair,
    list,
    int,
    pInt,
    V1,
    V2,
    map,
    data,
    pair,
    bool,
    pBool,
    addUtilityForType,
    PMaybe,
} from "../pluts";

export const unitDatumHash = V2.PDatumHash.from( pByteString("923918e403bf43c34b4ef6b48eb2ee04babed17320d8d1b9ff9ad086e86f44ec") );
export const emptyValue = V2.PValue.from( pList( V2.PValueEntry.type )([]) as any );

export const emptyValueAsData = toData( V2.PValue.type )( emptyValue );

export const validatorSpendingUtxo = V2.PTxOutRef.PTxOutRef({
    id: toData( V2.PTxId.type )(
        V2.PTxId.PTxId({
            txId: toData( bs )( pByteString("deadbeef") )
        })
    ),
    index: pDataI( 0 )
});

export const validatorSpendingUtxoAsData = toData( V2.PTxOutRef.type )( validatorSpendingUtxo );

export const beef32 = V2.PValue.from(
    pList( V2.PValueEntry.type )([
        V2.PValueEntry.from([
            V2.PCurrencySymbol.from( pByteString("deadbeef") ),
            pList( V2.PAssetsEntry.type )([
                V2.PAssetsEntry.from([
                    V2.PTokenName.from( pByteString("beef") ),
                    pInt( 32 )
                ])
            ])
        ])
    ])
);

export const beef32AsData = toData( V2.PValue.type )( beef32 );

export const datums = toData( map( V2.PDatumHash.type, data ) )
(
    pList( pair( V2.PDatumHash.type, data ) )([])
);

export const dCertificates = toData( list( V2.PDCert.type ) )
(
    pList( V2.PDCert.type )([])
);

export const txId = toData( V2.PTxId.type )(
    V2.PTxId.PTxId({
        txId: toData( bs )( pByteString("deadbeef") )
    })
);

export const interval = toData( V2.PPOSIXTimeRange.type )(
    V2.PPOSIXTimeRange.PInterval({
        from: toData( V2.PBound.type )(
            V2.PBound.PBound({
                bound: toData( V2.PExtended.type )( V2.PExtended.PFinite({ n: pDataI(1) }) ),
                inclusive: toData( bool )( pBool( false ) )
            })
        ),
        to: toData( V2.PBound.type )(
            V2.PBound.PBound({
                bound: toData( V2.PExtended.type )( V2.PExtended.PPosInf({}) ),
                inclusive: toData( bool )( pBool( false ) )
            })
        )
    })
);

export const signatories = toData( list( V2.PPubKeyHash.type ) )( pList( V2.PPubKeyHash.type )([
    V2.PPubKeyHash.from("deadbeef")
]) );

export const withdrawals = 
    toData( map( V2.PStakingCredential.type,int ) )( 
        pList( pair( V2.PStakingCredential.type, int ) )([])
    );

export const address = toData( V2.PAddress.type )(
    V2.PAddress.PAddress({
        credential: V2.PCredential.PScriptCredential({
            valHash: toData( V2.PValidatorHash.type )( V2.PValidatorHash.from( pByteString("caffee") ) )
        }) as any,
        stakingCredential: PMaybe( V2.PStakingCredential.type ).Nothing({}) as any
    })
);

export const inputs = toData( list( V1.PTxInInfo.type ) )(
    pList( V1.PTxInInfo.type )([
        V1.PTxInInfo.PTxInInfo({
            utxoRef: validatorSpendingUtxoAsData,
            resolved: toData( V1.PTxOut.type )(
                V1.PTxOut.PTxOut({
                    address,
                    datumHash: PMaybe( V2.PDatumHash.type ).Just({ val: toData( V2.PDatumHash.type )(unitDatumHash) }) as any,
                    value: beef32AsData as any
                })
            )
        })
    ])
)

export const outputs = toData( list( V1.PTxOut.type ) )(
    pList( V1.PTxOut.type )([])
);

export const txInfo_v1 = V1.PTxInfo.PTxInfo({
    datums,
    dCertificates,
    fee:  emptyValueAsData as any,
    mint: emptyValueAsData as any,
    id: txId,
    interval,
    signatories,
    withdrawals,
    inputs,
    outputs
});

export const _purp = V2.PScriptPurpose.Spending({
    utxoRef: validatorSpendingUtxoAsData
});

export const ctx = V1.PScriptContext.PScriptContext({
    tx: toData( V1.PTxInfo.type )( txInfo_v1 ),
    purpose: toData( V2.PScriptPurpose.type )( _purp )
});

export const v2_out = toData( V2.PTxOut.type )
(
    V2.PTxOut.PTxOut({
        address,
        value: beef32AsData as any,
        datum: V2.POutputDatum.NoDatum({}) as any,
        refScrpt: PMaybe( V2.PValidatorHash.type ).Nothing({}) as any
    })
)

export const v2_inputs = toData( list( V2.PTxInInfo.type ) )
(
    pList( V2.PTxInInfo.type )([
        V2.PTxInInfo.PTxInInfo({
            utxoRef: validatorSpendingUtxoAsData,
            resolved: v2_out
        })
    ])
)

export const empty_v2_outs = toData( list(V2.PTxOut.type) )(
    pList( V2.PTxOut.type )([])
);

export const empty_redeemers = toData( map( V2.PScriptPurpose.type, data ) )(
    pList( pair( V2.PScriptPurpose.type, data ) )([])
);

export const empty_refInputs = toData( list( V2.PTxInInfo.type ) )(
    pList( V2.PTxInInfo.type )([])
)

export const tx_v2 = addUtilityForType( V2.PTxInfo.type )(

    V2.PTxInfo.PTxInfo({
        datums,
        dCertificates,
        fee:  emptyValueAsData as any,
        mint: emptyValueAsData as any,
        id: txId,
        interval,
        signatories,
        withdrawals,
        inputs: v2_inputs,
        outputs: empty_v2_outs,
        redeemers: empty_redeemers,
        refInputs: empty_refInputs
    })
);