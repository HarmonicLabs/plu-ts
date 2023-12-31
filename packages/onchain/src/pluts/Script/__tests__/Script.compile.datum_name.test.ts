import { PAddress, PAssetsEntry, PDCert, PDatumHash, PMaybe, POutputDatum, PScriptContext, PScriptHash, PScriptPurpose, PStakingCredential, PTxId, PTxInInfo, PTxInfo, PTxOut, PTxOutRef, PValueEntry, asData, bool, bs, data, int, list, pData, pDataB, pDataI, pDataList, pList, pair, perror, pfn, phoist, pif, plet, pmakeUnit, pmatch, pstruct, ptoData, ptraceError, punsafeConvertType, unit } from "../..";
import { Address } from "@harmoniclabs/cardano-ledger-ts";
import { DataConstr } from "@harmoniclabs/plutus-data";
import { Machine } from "@harmoniclabs/plutus-machine";
import { UPLCConst } from "@harmoniclabs/uplc";

export const TestDatum = pstruct({
    TestDatum: {
        name: bs, 
        age: int
    }
});

export const TestRedeem = pstruct({
    TestRedeem: {
        name: bs
    }
});

const passert = phoist(
    pfn([ bool ], unit )
    ( condition => 
        pif( unit ).$( condition )
        .then( pmakeUnit() )
        .else( perror( unit ) )
    )
);

const readDatumPluts = pfn([
    TestDatum.type,
    TestRedeem.type,
    PScriptContext.type
],  bool)
(( testDatum, testRedeem, ctx ) => {
    const { tx, purpose } = ctx;
    
    const ownUtxoRef = plet(
        pmatch( purpose )
        .onSpending( ({ utxoRef }) => utxoRef )
        ._( _ => perror( PTxOutRef.type ) )
    );
    
    const ownInput = plet(
        pmatch(
            tx.inputs.find( input => input.utxoRef.eq( ownUtxoRef ) )
        )
        .onJust( ({ val }) => val.resolved )
        .onNothing( _ => perror( PTxOut.type ) )
    );
    
    const oldDatum = plet(
        pmatch( ownInput.datum )
        .onInlineDatum(({ datum }) => punsafeConvertType( datum, TestDatum.type ))
        ._( _ => ptraceError(TestDatum.type).$("d")) 
    );
    
    return (
        // It feels like the name of the datum taken from the input is wrong (there is no problem in compilation),
        // but calling the contract always fails. On the other hand, if the name is taken from the contract parameter datum,
        // there is no problem.
        oldDatum.name.eq(testRedeem.name)   //error
        // testDatum.name.eq(testRedeem.name);  //ok
    );
});

const uplc = readDatumPluts.toUPLC();

const fakeTxId = PTxId.toData(
    PTxId.PTxId({
        txId: pDataB("ff".repeat(32))
    })
)

const fakeDatum = TestDatum.TestDatum({
    name: pDataB("caffee"),
    age: pDataI(18)
});

const fakeDatumData = TestDatum.toData( fakeDatum );

const fakeInlineDat = POutputDatum.toData(
    POutputDatum.InlineDatum({
        datum: fakeDatumData
    })
);

const fakeSpendingRef = PTxOutRef.toData(
    PTxOutRef.PTxOutRef({
        id: fakeTxId,
        index: pDataI( 0 )
    })
);

const fakeTxOut = PTxOut.PTxOut({
    address: punsafeConvertType( pData( Address.fake.toData() ), asData( PAddress.type ) ) as any,
    datum: punsafeConvertType( fakeInlineDat, asData( POutputDatum.type ) ) as any,
    value: punsafeConvertType( ptoData( list( PValueEntry.type ) ).$( pList( PValueEntry.type )([]) ), asData( list( PValueEntry.type ) ) ),
    refScrpt: punsafeConvertType( PMaybe( PScriptHash.type ).Nothing({}), asData( PMaybe( PScriptHash.type ).type ) )as any
});

const emptyDataList = ptoData( list( data ) ).$( pDataList([]) );

const emptyValueData = ptoData( list( PValueEntry.type ) ).$( pList( PValueEntry.type )([]) );
const emptyDatumsData = ptoData( list( pair( PDatumHash.type, data ) ) ).$( pList( pair( PDatumHash.type, data ) )([]) );
const emptyRdmrssData = ptoData( list( pair( PScriptPurpose.type, data ) ) ).$( pList( pair( PScriptPurpose.type, data ) )([]) );
const emptyCertsData = ptoData( list( PDCert.type ) ).$( pList( PDCert.type )([]) );
const emptyOutssData = ptoData( list( PTxOut.type ) ).$( pList( PTxOut.type )([]) );
const emptyInsData = ptoData( list( PTxInInfo.type ) ).$( pList( PTxInInfo.type )([]) );
const emptyWithData = ptoData( list( pair( PStakingCredential.type, int ) ) ).$( pList( pair( PStakingCredential.type, int ) )([]) );

const fakeContext = PScriptContext.PScriptContext({
    purpose: PScriptPurpose.toData(
        PScriptPurpose.Spending({
            utxoRef: fakeSpendingRef
        })
    ),
    tx: PTxInfo.toData(
        PTxInfo.PTxInfo({
            inputs: ptoData( list( PTxInInfo.type ) ).$(
                pList( PTxInInfo.type )([
                    PTxInInfo.PTxInInfo({
                        utxoRef: fakeSpendingRef,
                        resolved: fakeTxOut as any
                    })
                ])
            ),
            datums: emptyDatumsData,
            dCertificates: emptyCertsData,
            fee: emptyValueData,
            id: fakeTxId,
            interval: emptyDataList,
            mint: emptyValueData,
            outputs: emptyOutssData,
            redeemers: emptyRdmrssData,
            refInputs: emptyInsData,
            signatories: emptyDataList,
            withdrawals: emptyWithData,
        })
    ) 
});

const fakeRdmr = TestRedeem.TestRedeem({
    name: pDataB("caffee")
});

const fakeRdmrData = punsafeConvertType(
    fakeRdmr,
    data
);

describe("same name", () => {

    test("const eval", () => {

        const res = Machine.eval(
            readDatumPluts.$( fakeDatum ).$( fakeRdmr ).$( fakeContext )
        );

        // console.log( res );

        expect( res.result instanceof UPLCConst ).toBe( true );
        expect( res.result ).toEqual( UPLCConst.bool( true ) );
    });
})