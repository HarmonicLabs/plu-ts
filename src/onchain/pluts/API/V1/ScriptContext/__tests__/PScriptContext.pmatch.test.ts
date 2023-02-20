import { Machine } from "../../../../../CEK";
import { pmatch } from "../../../../PTypes/PStruct/pmatch";
import { PAddress } from "../../Address/PAddress";
import { PCredential } from "../../Address/PCredential";
import { PStakingCredential } from "../../Address/PStakingCredential";
import { PExtended } from "../../Interval/PExtended";
import { PLowerBound } from "../../Interval/PLowerBound";
import { PUpperBound } from "../../Interval/PUpperBound";
import { PDCert } from "../../PDCert";
import { PPubKeyHash } from "../../PubKey/PPubKeyHash";
import { PDatumHash } from "../../ScriptsHashes/PDatumHash";
import { PValidatorHash } from "../../ScriptsHashes/PValidatorHash";
import { PPOSIXTimeRange } from "../../Time";
import { PTxId } from "../../Tx/PTxId";
import { PTxInInfo } from "../../Tx/PTxInInfo";
import { PTxOut } from "../../Tx/PTxOut";
import { PTxOutRef } from "../../Tx/PTxOutRef";
import { PAssetsEntryT, PValue, PValueEntryT } from "../../Value/PValue";
import { PScriptContext } from "../PScriptContext";
import { PScriptPurpose } from "../PScriptPurpose";
import { PTxInfo } from "../PTxInfo/PTxInfo";
import { UPLCConst } from "../../../../../UPLC/UPLCTerms/UPLCConst";
import { pInt } from "../../../../lib/std/int/pInt";
import { pByteString } from "../../../../lib/std/bs/pByteString";
import { pList } from "../../../../lib/std/list/const";
import { PMaybe } from "../../../../lib/std/PMaybe/PMaybe";
import { pBool } from "../../../../lib/std/bool/pBool";
import { fromData, pDataI, pPair, perror, pisEmpty, toData } from "../../../../lib";
import { PCurrencySymbol } from "../../Value/PCurrencySymbol";
import { PTokenName } from "../../Value/PTokenName";
import { ErrorUPLC } from "../../../../../UPLC/UPLCTerms/ErrorUPLC";
import { Term } from "../../../../Term";
import { list, int, pair, data, bs, map, bool } from "../../../../type_system";


import fs from "node:fs"

import v8Profiler from 'v8-profiler-next';
import { PAsData } from "../../../../PTypes";
v8Profiler.setGenerateType(1);
const title = 'pvalueOf';

v8Profiler.startProfiling(title, true);

afterAll(() => {
    const profile = v8Profiler.stopProfiling(title);
    profile.export(function (error, result: any) {
        // if it doesn't have the extension .cpuprofile then
        // chrome's profiler tool won't like it.
        // examine the profile:
        //   Navigate to chrome://inspect
        //   Click Open dedicated DevTools for Node
        //   Select the profiler tab
        //   Load your file
        fs.writeFileSync(`./${title}.cpuprofile`, result);
        profile.delete();
    });
});

let unitDatumHash: Term<typeof PDatumHash>;
let emptyValue: Term<typeof PValue>;
let emptyValueAsData: Term<PAsData<typeof PValue>>;
let validatorSpendingUtxo: Term<typeof PTxOutRef>;
let validatorSpendingUtxoAsData: Term<PAsData<typeof PTxOutRef>>;
let beef32: Term<typeof PValue>;
let beef32AsData: Term<PAsData<typeof PValue>>;
let _txInfo: Term<typeof PTxInfo>;
let _purp: Term<typeof PScriptPurpose>;
let ctx: Term<typeof PScriptContext>

beforeAll(() => {
    unitDatumHash = PDatumHash.from( pByteString("923918e403bf43c34b4ef6b48eb2ee04babed17320d8d1b9ff9ad086e86f44ec") );
    emptyValue = PValue.from( pList( PValueEntryT )([]) as any );

    emptyValueAsData = toData( PValue.type )( emptyValue );

    validatorSpendingUtxo = PTxOutRef.PTxOutRef({
        id: toData( PTxId.type )(
            PTxId.PTxId({
                txId: toData( bs )( pByteString("deadbeef") )
            })
        ),
        index: pDataI( 0 )
    });

    validatorSpendingUtxoAsData = toData( PTxOutRef.type )( validatorSpendingUtxo );

    beef32 = PValue.from(
        pList( PValueEntryT )([
            pPair( PCurrencySymbol.type, list( PAssetsEntryT ) )
            (
                PCurrencySymbol.from( pByteString("deadbeef") ),
                pList( PAssetsEntryT )([
                    pPair( PTokenName.type, int )
                    (
                        PTokenName.from( pByteString("beef") ),
                        pInt( 32 )
                    )
                ])
            )
        ])
    );

    beef32AsData = toData( PValue.type )( beef32 );

    _txInfo = PTxInfo.PTxInfo({
        datums: toData( map( PDatumHash.type, data ) )
            (
                pList( pair( PDatumHash.type, data ) )([])
            ),
        dCertificates: toData( list( PDCert.type ) )
            (
                pList( PDCert.type )([])
            ),
        fee: emptyValueAsData,
        mint: emptyValueAsData,
        id: toData( PTxId.type )(
            PTxId.PTxId({
                txId: toData( bs )( pByteString("deadbeef") )
            })
        ),
        interval: toData( PPOSIXTimeRange.type )(
            PPOSIXTimeRange.PInterval({
                from: toData( PLowerBound.type )(
                    PLowerBound.PLowerBound({
                        bound: toData( PExtended.type )( PExtended.PFinite({ _0: pDataI(1) }) ),
                        inclusive: toData( bool )( pBool( false ) )
                    })
                ),
                to: toData( PUpperBound.type )(
                    PUpperBound.PUpperBound({
                        bound: toData( PExtended.type )( PExtended.PPosInf({}) ),
                        inclusive: toData( bool )( pBool( false ) )
                    })
                )
            })
        ),
        signatories: toData( list( PPubKeyHash.type ) )( pList( PPubKeyHash.type )([]) ),
        withdrawals: toData( map( PStakingCredential.type, int ) )( pList( pair( PStakingCredential.type, int ) )([]) ),
        inputs: toData( list( PTxInInfo.type ) )(
            pList( PTxInInfo.type )([
                PTxInInfo.PTxInInfo({
                    utxoRef: validatorSpendingUtxoAsData,
                    resolved: toData( PTxOut.type )(
                        PTxOut.PTxOut({
                            address: toData( PAddress.type )(
                                PAddress.PAddress({
                                    credential: PCredential.PScriptCredential({
                                        valHash: toData( PValidatorHash.type )( PValidatorHash.from( pByteString("caffee") ) )
                                    }) as any,
                                    stakingCredential: PMaybe( PStakingCredential.type ).Nothing({}) as any
                                })
                            ),
                            datumHash: PMaybe( PDatumHash.type ).Just({ val: toData( PDatumHash.type )(unitDatumHash) }) as any,
                            value: beef32AsData
                        })
                    )
                })
            ])
        ),
        outputs: toData( list( PTxOut.type ) )(
            pList( PTxOut.type )([])
        ) 
    });

    _purp = PScriptPurpose.Spending({
        utxoRef: validatorSpendingUtxo as any
    });
    
    ctx = PScriptContext.PScriptContext({
        txInfo: _txInfo as any,
        purpose: _purp as any
    });
    
})




describe("pmatch( <PScriptContext> )", () => {

    test("extract txInfo", () => {

        expect(
            Machine.evalSimple(
                pmatch( ctx )
                .onPScriptContext(
                    rawCtxFields => rawCtxFields.extract("txInfo").in( ({txInfo}) => txInfo )
                )
            )
        ).toEqual(
            Machine.evalSimple(
                _txInfo
            )
        );

    });

    test("extract txInfo and purpose", () => {

        expect(
            Machine.evalSimple(
                pmatch( ctx )
                .onPScriptContext(
                    rawCtxFields => rawCtxFields.extract("txInfo","purpose").in( ({txInfo}) => txInfo )
                )
            )
        ).toEqual(
            Machine.evalSimple(
                _txInfo
            )
        );

        expect(
            Machine.evalSimple(
                pmatch( ctx )
                .onPScriptContext(
                    rawCtxFields => rawCtxFields.extract("purpose","txInfo").in( ({txInfo}) => txInfo )
                )
            )
        ).toEqual(
            Machine.evalSimple(
                _txInfo
            )
        );

        expect(
            Machine.evalSimple(
                pmatch( ctx )
                .onPScriptContext(
                    rawCtxFields => rawCtxFields.extract("txInfo","purpose").in( ({purpose}) => purpose )
                )
            )
        ).toEqual(
            Machine.evalSimple(
                _purp
            )
        );

        expect(
            Machine.evalSimple(
                pmatch( ctx )
                .onPScriptContext(
                    rawCtxFields => rawCtxFields.extract("purpose","txInfo").in( ({purpose}) => purpose )
                )
            )
        ).toEqual(
            Machine.evalSimple(
                _purp
            )
        );

    });

    describe("extract fee", () => {

        test("inputs extracted", () => {
            expect(
                Machine.evalSimple(
                    pmatch( ctx )
                    .onPScriptContext( _ => _.extract("txInfo").in( ({ txInfo }) =>
                    txInfo.extract("inputs").in( ({ inputs }) => pisEmpty.$( inputs.tail ) )
                    ))
                )
            ).toEqual(
                Machine.evalSimple(
                    pBool( true )
                )
            )
        });

        test("outputs extracted", () => {

            let term = pmatch( ctx )
            .onPScriptContext( _ => _.extract("txInfo").in( ({ txInfo }) =>
            txInfo.extract("outputs").in( ({ outputs }) => pisEmpty.$( outputs ) )
            ));

            expect(
                Machine.evalSimple(
                    term
                )
            ).toEqual(
                Machine.evalSimple(
                    pBool( true )
                )
            )

        })

        test("interval lower bound extracted", () => {

            expect(
                Machine.evalSimple(
                    pmatch( ctx )
                    .onPScriptContext( _ => _.extract("txInfo").in( ({ txInfo }) =>
                    txInfo.extract("interval").in( ({ interval }) =>
                    interval.extract("from").in( ({ from }) =>
                    from.extract("bound").in( ({ bound }) => 

                    pmatch( bound )
                    .onPFinite( _ => _.extract("_0").in( ({ _0 }) => _0 ))
                    ._( _ => perror( int ) )
                    )))))
                )
            ).toEqual(
                Machine.evalSimple(
                    pInt( 1 )
                )
            )

        });
    
        test("extract input value", () => {
            expect(
                Machine.evalSimple(
                    pmatch( ctx )
                    .onPScriptContext( _ => _.extract("txInfo").in( ({ txInfo }) =>

                        txInfo.extract("inputs").in( ({ inputs }) =>

                        inputs.head.extract("resolved").in( ({ resolved: input }) => 

                        input.extract("value").in( ({value}) => value )
                        
                    ))))
                )
            ).toEqual(
                Machine.evalSimple(
                    fromData( PValue.type )( beef32AsData )
                )
            )
        })

        test("txId (last field)", () => {

            let result = Machine.evalSimple(
                pmatch( ctx )
                .onPScriptContext( _ => _.extract("txInfo").in( ({ txInfo }) => txInfo ))
            );

            /*
            console.log(
                showUPLC(
                    pmatch( ctx )
                    .onPScriptContext( _ => _.extract("txInfo").in( ({ txInfo }) => txInfo ))
                    .toUPLC(0)
                )
            );
            //*/

            expect(
                result instanceof ErrorUPLC
            ).toEqual(
                false
            )

        })
    })

    describe("match Purpose", () => {

        test("all continuations", () => {
            
            expect(
                Machine.evalSimple(
                    pmatch( _purp )
                    .onMinting( _ => pInt( 1 ) )
                    .onSpending( _ => pInt( 2 ) )
                    .onRewarding( _ => pInt( 3 ) )
                    .onCertifying( _ => pInt( 4 ) )
                )
            ).toEqual(
                UPLCConst.int( 2 )
            )

        })

        test("only mint ( purpose is Spending )", () => {
            
            expect(
                Machine.evalSimple(
                    pmatch( _purp )
                    .onMinting( _ => pInt( 1 ) )
                    ._( _ => pInt( 2 ) )
                )
            ).toEqual(
                UPLCConst.int( 2 )
            );

        })

        test("only spend ( purpose is Spending )", () => {
            
            expect(
                Machine.evalSimple(
                    pmatch( _purp )
                    .onSpending( _ => pInt( 1 ) )
                    ._( _ => pInt( 2 ) )
                )
            ).toEqual(
                UPLCConst.int( 1 )
            );

        })

    })

})