import evalScript from "../../../../../CEK";
import PMaybe from "../../../../Prelude/PMaybe";
import { pBool } from "../../../../PTypes/PBool";
import { pByteString } from "../../../../PTypes/PByteString";
import { pInt } from "../../../../PTypes/PInt";
import { pList } from "../../../../PTypes/PList";
import pmatch from "../../../../PTypes/PStruct/pmatch";
import { pair, data, int } from "../../../../Term/Type";
import PAddress from "../../Address";
import PCredential from "../../Address/PCredential";
import PStakingCredential from "../../Address/PStakingCredential";
import PExtended from "../../Interval/PExtended";
import PLowerBound from "../../Interval/PLowerBound";
import PUpperBound from "../../Interval/PUpperBound";
import PDCert from "../../PDCert";
import PPubKeyHash from "../../PubKey/PPubKeyHash";
import PDatumHash from "../../Scripts/PDatumHash";
import PValidatorHash from "../../Scripts/PValidatorHash";
import PPOSIXTimeRange, { PPOSIXTime } from "../../Time";
import PTxId from "../../Tx/PTxId";
import PTxInInfo from "../../Tx/PTxInInfo";
import PTxOut from "../../Tx/PTxOut";
import PTxOutRef from "../../Tx/PTxOutRef";
import PValue from "../../Value";
import PScriptContext from "../PScriptContext";
import PScriptPurpose from "../PScriptPurpose";
import PTxInfo from "../PTxInfo";


const unitDatumHash = PDatumHash.from( pByteString("923918e403bf43c34b4ef6b48eb2ee04babed17320d8d1b9ff9ad086e86f44ec") );
const emptyValue = PValue.from( pList( PValue.type[1].type[1] )([]) as any );

const validatorSpendingUtxo = PTxOutRef.PTxOutRef({
    id: PTxId.PTxId({
        txId: pByteString("deadbeef")
    }),
    index: pInt( 0 )
});


const _txInfo = PTxInfo.PTxInfo({
    datums: pList( pair( PDatumHash.type, data ) )([]),
    dCertificates: pList( PDCert.type )([]),
    fee: emptyValue,
    mint: emptyValue,
    id: PTxId.PTxId({
        txId: pByteString("deadbeef")
    }),
    interval: PPOSIXTimeRange.PInterval({
        from: PLowerBound( PPOSIXTime.type ).PLowerBound({
            bound: PExtended( PPOSIXTime.type ).PNegInf({}),
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
            outRef: validatorSpendingUtxo,
            resolved: PTxOut.PTxOut({
                address: PAddress.PAddress({
                    credential: PCredential.PScriptCredential({
                        valHash: PValidatorHash.from( pByteString("caffee") )
                    }),
                    stakingCredential: PMaybe( PStakingCredential.type ).Nothing({})
                }),
                datumHash: PMaybe( PDatumHash.type ).Just({ val: unitDatumHash }),
                value: emptyValue
            })
        })
    ]),
    outputs: pList( PTxOut.type )([])
});

const _purp = PScriptPurpose.Spending({
    utxoRef: validatorSpendingUtxo
});

const ctx = PScriptContext.PScriptContext({
    txInfo: _txInfo,
    purpose: _purp
});

describe("pmatch( <PScriptContext> )", () => {

    test("extract txInfo", () => {

        expect(
            evalScript(
                pmatch( ctx )
                .onPScriptContext(
                    rawCtxFields => rawCtxFields.extract("txInfo").in( ({txInfo}) => txInfo )
                )
            )
        ).toEqual(
            evalScript(
                _txInfo
            )
        );

    });

    test("extract txInfo and purpose", () => {

        expect(
            evalScript(
                pmatch( ctx )
                .onPScriptContext(
                    rawCtxFields => rawCtxFields.extract("txInfo","purpose").in( ({txInfo}) => txInfo )
                )
            )
        ).toEqual(
            evalScript(
                _txInfo
            )
        );

        expect(
            evalScript(
                pmatch( ctx )
                .onPScriptContext(
                    rawCtxFields => rawCtxFields.extract("purpose","txInfo").in( ({txInfo}) => txInfo )
                )
            )
        ).toEqual(
            evalScript(
                _txInfo
            )
        );

        expect(
            evalScript(
                pmatch( ctx )
                .onPScriptContext(
                    rawCtxFields => rawCtxFields.extract("txInfo","purpose").in( ({purpose}) => purpose )
                )
            )
        ).toEqual(
            evalScript(
                _purp
            )
        );

        expect(
            evalScript(
                pmatch( ctx )
                .onPScriptContext(
                    rawCtxFields => rawCtxFields.extract("purpose","txInfo").in( ({purpose}) => purpose )
                )
            )
        ).toEqual(
            evalScript(
                _purp
            )
        );

    });

})