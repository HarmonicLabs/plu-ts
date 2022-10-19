import ByteString from "../../../../types/HexString/ByteString"
import { showUPLC } from "../../../UPLC/UPLCTerm"
import compile, { PlutusScriptVersion, scriptToJsonFormat } from "../compile"
import { peqBs, pif, punBData } from "../../Prelude/Builtins"
import PByteString, { pByteString } from "../../PTypes/PByteString"
import { pmakeUnit } from "../../PTypes/PUnit"
import { perror, pfn, plam, plet } from "../../Syntax"
import Term from "../../Term"
import Type, { bool, bs, data, int, list, pair, unit } from "../../Term/Type"
import PScriptContext from "../../API/V1/ScriptContext"
import pmatch from "../../PTypes/PStruct/pmatch"
import PBool, { pBool } from "../../PTypes/PBool"
import PTxInInfo from "../../API/V1/Tx/PTxInInfo"
import pownHash from "../../API/V1/ScriptContext/PTxInfo/pownHash"
import { pevery, pfilter } from "../../Prelude/List"
import { makeValidator } from "../makeValidator"
import evalScript from "../../../CEK"
import UPLCConst from "../../../UPLC/UPLCTerms/UPLCConst"
import DataConstr from "../../../../types/Data/DataConstr"
import PTxInfo from "../../API/V1/ScriptContext/PTxInfo"
import PScriptPurpose from "../../API/V1/ScriptContext/PScriptPurpose"
import PTxOutRef from "../../API/V1/Tx/PTxOutRef"
import PTxId from "../../API/V1/Tx/PTxId"
import { pInt } from "../../PTypes/PInt"
import { pList } from "../../PTypes/PList"
import PDatumHash from "../../API/V1/Scripts/PDatumHash"
import PDCert from "../../API/V1/PDCert"
import PValue from "../../API/V1/Value"
import PPOSIXTimeRange, { PPOSIXTime } from "../../API/V1/Time"
import PLowerBound from "../../API/V1/Interval/PLowerBound"
import PExtended from "../../API/V1/Interval/PExtended"
import PUpperBound from "../../API/V1/Interval/PUpperBound"
import PPubKeyHash from "../../API/V1/PubKey/PPubKeyHash"
import PStakingCredential from "../../API/V1/Address/PStakingCredential"
import PTxOut from "../../API/V1/Tx/PTxOut"
import PMaybe from "../../Prelude/PMaybe"
import PAddress from "../../API/V1/Address"
import PCredential from "../../API/V1/Address/PCredential"
import PValidatorHash from "../../API/V1/Scripts/PValidatorHash"
import Application from "../../../UPLC/UPLCTerms/Application"


describe("scriptToJsonFormat", () => {

    test.skip("Cardano <3 plu-ts", () => {

        const correctBS = ByteString.fromAscii( "Cardano <3 plu-ts" );

        const contract = pfn([
            data,
            Type.Data.BS,
            data
        ],  unit
        )(
            ( _datum, redeemerBS, _ctx ) => {

                return pif( unit ).$(
                    pByteString(
                        correctBS
                    ).eq( punBData.$( redeemerBS ) )
                )
                .then( pmakeUnit() )
                .else( perror( unit ) )
            }
        );

        console.log(
            showUPLC(
                contract.toUPLC(0)
            )
        );

        console.log(
            JSON.stringify(
                scriptToJsonFormat(
                    compile( contract ),
                    PlutusScriptVersion.V1
                )
            )
        );

    });


    test("Cardano <3 plu-ts; unit Datum", () => {

        const label = "SC generation and compilation";
        console.time( label );

        const correctBS = ByteString.fromAscii( "Cardano <3 plu-ts" );
        
        const contract = pfn([
            data,
            bs,
            PScriptContext.type
        ],  bool
        )(
            ( _datum, redeemerBS, ctx_ ) => {

                return pByteString( correctBS ).eq( redeemerBS )
                    .and(

                        pmatch( ctx_ )
                        .onPScriptContext( rawCtx => rawCtx.extract("txInfo","purpose").in( ctx => {
                            
                            return plet( pownHash.$( ctx.txInfo ).$( ctx.purpose ) ).in( ownHash => 

                                pmatch( ctx.txInfo )
                                .onPTxInfo( rawTxInfo => rawTxInfo.extract("inputs").in( ({ inputs }) =>

                                    pevery( PTxInInfo.type )
                                    .$( plam( PTxInInfo.type, bool )(
                                        txInput =>
                                            pmatch( txInput )
                                            .onPTxInInfo( rawTxIn => rawTxIn.extract("resolved").in( ({resolved}) =>

                                                pmatch( resolved )
                                                .onPTxOut( rawResolved => rawResolved.extract("datumHash").in( ({datumHash}) =>
                                                    pmatch( datumHash )
                                                    .onJust( _ => pBool( true ) )
                                                    .onNothing( _ => pBool( false ) )
                                                ))
                                                
                                            )) as Term<PBool>
                                    ))
                                    .$( pfilter( PTxInInfo.type )
                                        .$( plam( PTxInInfo.type, bool )(
                                            txInput => 
                                                pmatch( txInput )
                                                .onPTxInInfo( rawTxIn => rawTxIn.extract("resolved").in( ({resolved}) =>

                                                    pmatch( resolved )
                                                    .onPTxOut( rawResolved => rawResolved.extract("address").in( ({ address }) => 
                                                        pmatch( address )
                                                        .onPAddress( rawAddr => rawAddr.extract("credential").in( ({ credential }) =>
                                                            pmatch( credential )
                                                            .onPScriptCredential( rawScriptCredFields => rawScriptCredFields.extract("valHash").in( ({ valHash }) => {
                                                                
                                                                return peqBs.$( ownHash as Term<PByteString> ).$( valHash as Term<PByteString> )
                                                            }))
                                                            .onPPubKeyCredential( _ => pBool( false ) )
                                                        ))
                                                    ))
                                                )) as Term<PBool>
                                        ))
                                        .$( inputs )
                                    )

                                ))
                            )

                        })) as Term<PBool>
                    )
            }
        );

        // const compiled = compile( makeValidator( contract ) );

        console.timeEnd( label );

        // console.log( showUPLC( makeValidator( contract ).toUPLC(0) ) )
// 
        // console.log(
        //     JSON.stringify(
        //         scriptToJsonFormat(
        //             compiled,
        //             PlutusScriptVersion.V1
        //         )
        //     )
        // );

        const unitDatumHash = PDatumHash.from( pByteString("923918e403bf43c34b4ef6b48eb2ee04babed17320d8d1b9ff9ad086e86f44ec") );
        const emptyValue = PValue.from( pList( PValue.type[1].type[1] )([]) as any );

        const validatorSpendingUtxo = PTxOutRef.PTxOutRef({
            id: PTxId.PTxId({
                txId: pByteString("deadbeef")
            }),
            index: pInt( 0 )
        });

        const appliedContract = contract
        .$( new Term(
            data,
            _dbn => UPLCConst.data(new DataConstr( 0, []))
        ))
        .$( pByteString( correctBS ) )
        .$( PScriptContext.PScriptContext({
            txInfo: PTxInfo.PTxInfo({
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
            }),
            purpose: PScriptPurpose.Spending({
                utxoRef: validatorSpendingUtxo
            })
        }) );

        const appliedContractUPLC = appliedContract.toUPLC(0);

        //*
        console.log(
            evalScript(
                appliedContractUPLC
            )
        )
        //*/

    })

})