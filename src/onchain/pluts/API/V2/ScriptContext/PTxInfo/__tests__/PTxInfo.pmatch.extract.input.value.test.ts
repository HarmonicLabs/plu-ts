import { Machine } from "../../../../../../CEK";
import { pBool } from "../../../../../lib/std/bool/pBool";
import { pByteString } from "../../../../../lib/std/bs/pByteString";
import { pInt } from "../../../../../lib/std/int/pInt";
import { pList } from "../../../../../lib/std/list/const";
import { addUtilityForType } from "../../../../../lib/addUtilityForType";
import { pdynPair } from "../../../../../lib/std/pair/pdynPair";
import { PMaybe } from "../../../../../lib/std/PMaybe/PMaybe";
import { pair, data, int, list, dynPair } from "../../../../../Term";
import { PAddress } from "../../../../V1/Address/PAddress";
import { PCredential } from "../../../../V1/Address/PCredential";
import { PStakingCredential } from "../../../../V1/Address/PStakingCredential";
import { PExtended } from "../../../../V1/Interval/PExtended";
import { PLowerBound } from "../../../../V1/Interval/PLowerBound";
import { PUpperBound } from "../../../../V1/Interval/PUpperBound";
import { PDCert } from "../../../../V1/PDCert";
import { PPubKeyHash } from "../../../../V1/PubKey/PPubKeyHash";
import { PScriptPurpose } from "../../../../V1/ScriptContext/PScriptPurpose";
import { PDatumHash } from "../../../../V1/ScriptsHashes/PDatumHash";
import { PValidatorHash } from "../../../../V1/ScriptsHashes/PValidatorHash";
import { PPOSIXTime, PPOSIXTimeRange } from "../../../../V1/Time";
import { PTxId } from "../../../../V1/Tx/PTxId";
import { PTxOutRef } from "../../../../V1/Tx/PTxOutRef";
import { PCurrencySymbol } from "../../../../V1/Value/PCurrencySymbol";
import { PTokenName } from "../../../../V1/Value/PTokenName";
import { PAssetsEntryT, PValue, PValueEntryT } from "../../../../V1/Value/PValue";
import { PTxInfo } from "../../../../V2/ScriptContext/PTxInfo/PTxInfo"
import { POutputDatum } from "../../../Tx/POutputDatum";
import { PTxInInfo } from "../../../Tx/PTxInInfo";
import { PTxOut } from "../../../Tx/PTxOut";

const unitDatumHash = PDatumHash.from( pByteString("923918e403bf43c34b4ef6b48eb2ee04babed17320d8d1b9ff9ad086e86f44ec") );
const emptyValue = PValue.from( pList( PValueEntryT )([]) as any );

const validatorSpendingUtxo = PTxOutRef.PTxOutRef({
    id: PTxId.PTxId({
        txId: pByteString("deadbeef")
    }),
    index: pInt( 0 )
});

const beef32 = PValue.from(
    pList( PValueEntryT )([
        pdynPair( PCurrencySymbol.type, list( PAssetsEntryT ) )
        (
            PCurrencySymbol.from( pByteString("deadbeef") ),
            pList( PAssetsEntryT )([
                pdynPair( PTokenName.type, int )
                (
                    PTokenName.from( pByteString("beef") ),
                    pInt( 32 )
                )
            ])
        )
    ])
);

const tx = addUtilityForType( PTxInfo.type )(

    PTxInfo.PTxInfo({
        datums: pList( pair( PDatumHash.type, data ) )([]),
        dCertificates: pList( PDCert.type )([]),
        fee: emptyValue,
        mint: emptyValue,
        id: PTxId.PTxId({
            txId: pByteString("deadbeef")
        }),
        interval: PPOSIXTimeRange.PInterval({
            from: PLowerBound( PPOSIXTime.type ).PLowerBound({
                bound: PExtended( PPOSIXTime.type ).PFinite({ _0: PPOSIXTime.from( pInt(1) ) }),
                inclusive: pBool( false )
            }),
            to: PUpperBound( PPOSIXTime.type ).PUpperBound({
                bound: PExtended( PPOSIXTime.type ).PPosInf({}),
                inclusive: pBool( false )
            })
        }),
        signatories: pList( PPubKeyHash.type )([]),
        withdrawals: pList( pair( PStakingCredential.type, int ) )([]),
        inputs: pList( PTxInInfo.type )([
            PTxInInfo.PTxInInfo({
                utxoRef: validatorSpendingUtxo,
                resolved: PTxOut.PTxOut({
                    address: PAddress.PAddress({
                        credential: PCredential.PScriptCredential({
                            valHash: PValidatorHash.from( pByteString("caffee") )
                        }),
                        stakingCredential: PMaybe( PStakingCredential.type ).Nothing({})
                    }),
                    value: beef32,
                    datum: POutputDatum.NoDatum({}),
                    refScrpt: PMaybe( PValidatorHash.type ).Nothing({})
                })
            })
        ]),
        outputs: pList( PTxOut.type )([]),
        redeemers: pList( dynPair( PScriptPurpose.type, data ) )([]),
        refInputs: pList( PTxInInfo.type )([]) ,
    })
);

describe("input value extraction", () => {

    test("yuppie?", () => {
        
            expect(
                Machine.evalSimple(
                    tx.extract("inputs").in( ({ inputs }) => 
                    inputs.head.extract("resolved").in( ({ resolved: input }) => 
                    input.extract("value").in( ({ value }) => value
                    )))
                )
            ).toEqual(
                Machine.evalSimple(
                    beef32
                )
            );

    })
    
})