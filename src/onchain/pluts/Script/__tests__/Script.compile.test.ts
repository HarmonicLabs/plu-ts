import ByteString from "../../../../types/HexString/ByteString"
import { showUPLC } from "../../../UPLC/UPLCTerm"
import compile, { PlutusScriptVersion, scriptToJsonFormat } from "../compile"
import { peqBs, pif, punBData } from "../../Prelude/Builtins"
import PByteString, { pByteString } from "../../PTypes/PByteString"
import { pmakeUnit } from "../../PTypes/PUnit"
import { perror, pfn, plam, plet } from "../../Syntax"
import Term from "../../Term"
import Type, { bool, bs, data, unit } from "../../Term/Type"
import PScriptContext from "../../API/V1/ScriptContext"
import pmatch from "../../PTypes/PStruct/pmatch"
import PBool, { pBool } from "../../PTypes/PBool"
import PTxInInfo from "../../API/V1/Tx/PTxInInfo"
import pownHash from "../../API/V1/ScriptContext/PTxInfo/pownHash"
import { pevery, pfilter } from "../../Prelude/List"


describe("scriptToJsonFormat", () => {

    test("Cardano <3 plu-ts", () => {

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

    })

})