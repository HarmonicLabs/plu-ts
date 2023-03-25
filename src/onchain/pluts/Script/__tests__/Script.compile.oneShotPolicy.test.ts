import { bool, compile } from "../..";
import { Machine } from "../../../CEK";
import { PTxId, PTxOutRef, V2 } from "../../API";
import { pstruct, pmatch } from "../../PTypes";
import { pData, pDataB, pDataI, perror, pfn, pisEmpty, plet, punsafeConvertType } from "../../lib";
import { ErrorUPLC } from "../../../UPLC/UPLCTerms/ErrorUPLC";
import { dataFromCbor } from "../../../../types/Data";
import { UPLCTerm, showUPLC } from "../../../UPLC/UPLCTerm";
import { UPLCDecoder } from "../../../UPLC/UPLCDecoder";
import { UPLCEncoder } from "../../../UPLC/UPLCEncoder";
import { UPLCProgram } from "../../../UPLC/UPLCProgram";
import { Cbor } from "../../../../cbor/Cbor";
import { CborBytes } from "../../../../cbor/CborObj/CborBytes";
import { Script, ScriptType } from "../../../../offchain/script/Script";
import { fromHex } from "@harmoniclabs/uint8array-utils";
import { _old_plet } from "../../lib/plet/old";


export const MintRdmr = pstruct({
    Mint: {},
    Burn: {}
});

export const oneShotNFT = pfn([
    V2.PTxOutRef.type,

    MintRdmr.type,
    V2.PScriptContext.type

],  bool)
(( utxo, rdmr, ctx ) =>
    
    ctx.extract("tx","purpose").in( ({ tx, purpose }) =>
    tx.extract("inputs","mint").in( tx =>

        plet(
            pmatch( purpose )
            .onMinting( _ => _.extract("currencySym").in( ({ currencySym }) => currencySym ))
            ._( _ => perror( V2.PCurrencySymbol.type ) as any )
        ).in( ownCurrSym => 

        pmatch( rdmr )
        .onMint( _ =>

            tx.inputs.some( input =>
                input.extract("utxoRef").in( ({ utxoRef }) => utxoRef.eq( utxo ) )
            )
            .and(
    
                tx.mint.some( entry => {

                    return entry.fst.eq( ownCurrSym )

                    .and(
                        _old_plet( entry.snd ).in( assets =>

                            pisEmpty.$( assets.tail )
                            .and(
                                assets.head.snd.eq( 1 )
                            )

                        )
                    )

                })

            )

        )
        .onBurn( _ =>
            tx.mint.some( entry =>

                entry.fst.eq( ownCurrSym )

                .and(
                    _old_plet( entry.snd ).in( assets =>

                        pisEmpty.$( assets.tail )
                        .and(
                            assets.head.snd.lt( 0 )
                        )

                    )
                )

            ) 
        )
    
    )))
)

const mustSpendUtxo =  PTxOutRef.PTxOutRef({
    // 5dafdbe833a241350d679348d03599db3d5179385f96521f89ff8fa51fd57ebf#0
    id: PTxId.PTxId({
        txId: pDataB("5dafdbe833a241350d679348d03599db3d5179385f96521f89ff8fa51fd57ebf")
    }) as any,
    index: pDataI(0)
});

const oneshotParametrized = oneShotNFT.$(
    mustSpendUtxo
 );

const ctx = // 5dafdbe833a241350d679348d03599db3d5179385f96521f89ff8fa51fd57ebf#0 context
punsafeConvertType(
    pData(
        dataFromCbor(
            "d8799fd8799f9fd8799fd8799fd8799f58205dafdbe833a241350d679348d03599db3d5179385f96521f89ff8fa51fd57ebfff01ffd8799fd8799fd8799f581c63aca44c434f915147c4a42160667071e9807ade63a57f3d324cbdf9ffd8799fd8799fd8799f581c5a4d7254f8c71812472a875c0efb76657020d4520aa94d97e91d39b7ffffffffa340a1401a00989680581c0462de27174c88689ec9fe0e13777e1ed52285510300796e16b88acfa141591b000000e8d4a51000581c919d4c2c9455016289341b1a14dedf697687af31751170d56a31466ea141581b000000e8d4a51000d87980d87a80ffffd8799fd8799fd8799f58205dafdbe833a241350d679348d03599db3d5179385f96521f89ff8fa51fd57ebfff02ffd8799fd8799fd8799f581c63aca44c434f915147c4a42160667071e9807ade63a57f3d324cbdf9ffd8799fd8799fd8799f581c5a4d7254f8c71812472a875c0efb76657020d4520aa94d97e91d39b7ffffffffa140a1401b000000012a05f200d87980d87a80ffffd8799fd8799fd8799f58205dafdbe833a241350d679348d03599db3d5179385f96521f89ff8fa51fd57ebfff06ffd8799fd8799fd8799f581c63aca44c434f915147c4a42160667071e9807ade63a57f3d324cbdf9ffd8799fd8799fd8799f581c5a4d7254f8c71812472a875c0efb76657020d4520aa94d97e91d39b7ffffffffa140a1401b000000012a05f200d87980d87a80ffffff809fd8799fd8799fd8799f581c63aca44c434f915147c4a42160667071e9807ade63a57f3d324cbdf9ffd8799fd8799fd8799f581c5a4d7254f8c71812472a875c0efb76657020d4520aa94d97e91d39b7ffffffffa140a14000d87980d87a80ffd8799fd8799fd87a9f581c3e1851ac6d1fe40535fc1789d2bca08ee54a23890e4f58659975e600ffd8799fd8799fd8799f581c5a4d7254f8c71812472a875c0efb76657020d4520aa94d97e91d39b7ffffffffa440a1401a004c4b40581c0462de27174c88689ec9fe0e13777e1ed52285510300796e16b88acfa1415901581c919d4c2c9455016289341b1a14dedf697687af31751170d56a31466ea1415801581cdc5450bbbeb53a9b4188d864cbc843f4d5b983f7837ada45f66ec986a142494401d87b9f02ffd87a80ffd8799fd8799fd8799f581c63aca44c434f915147c4a42160667071e9807ade63a57f3d324cbdf9ffd8799fd8799fd8799f581c5a4d7254f8c71812472a875c0efb76657020d4520aa94d97e91d39b7ffffffffa340a1401a00989680581c0462de27174c88689ec9fe0e13777e1ed52285510300796e16b88acfa141591b000000e8d4a50fff581c919d4c2c9455016289341b1a14dedf697687af31751170d56a31466ea141581b000000e8d4a50fffd87980d87a80ffffa140a14000a240a14000581cdc5450bbbeb53a9b4188d864cbc843f4d5b983f7837ada45f66ec986a14249440180a0d8799fd8799fd87980d87a80ffd8799fd87b80d87a80ffff80a1d8799f581cdc5450bbbeb53a9b4188d864cbc843f4d5b983f7837ada45f66ec986ffd87980a0d8799f5820dab0da56ef1ff8b0e2ae7bd89c935a3f828e9d3c33df3b135db23c9cb9a7d2f0ffffd8799f581cdc5450bbbeb53a9b4188d864cbc843f4d5b983f7837ada45f66ec986ffff"
        )
    ),
    V2.PScriptContext.type
);

describe("oneShotNFT", () => {

    test.only("it compiles", () => {

//         expect(
//             () => 
                compile( oneShotNFT )
//         ).not.toThrow();
        
    });

    test("no execution errors", () => {

        /*
        // console.log(
            showUPLC(
                oneshotParametrized.toUPLC(0)
            )
        );
        //*/

        const result =  Machine.evalSimple(
            oneshotParametrized.$(
                MintRdmr.Mint({})
            ).$(
                ctx
            )
        );

        // // console.log( result );

        expect(
            result instanceof ErrorUPLC
        ).toBe( false );
        
    });

    let deserialized: UPLCTerm;

    test("deserializes correctly", () => {

        const oneshotParametrizedUPLC = oneshotParametrized.toUPLC(0);

        expect(
            () => deserialized = UPLCDecoder.parse(
                fromHex(
                    "5901e45901e101000032323232323232323232323222330050012323233008002232323233300b00923300e2330143371e646eb8d55ce8008008018991980a9aba335744002266e20c8dd69aab9e001357420029000191bab35573c0020020064660266601c46601c00246466ebc004038d5d080080209980711980a19b8f32375c6aae7400400400c4c8cc054d5d19aba23756002266e1cc8dd69aab9e001357420029001191bab35573c002002006646666602600a0020020024640026eb8d5d0800931bab301200237586ae84004c040008d5d0800a6129d87982d8798158205dafdbe833a241350d679348d03599db3d5179385f96521f89ff8fa51fd57ebf000022232332533357346002900008018a999ab9a300148008401058dc39aab9d00135573c0026ea800c88c004d55cf1baa002233002214a244466010600800426006002600244446466600e6008002600600200466008006004464600446600400400246004466004004002444a666aae7c00400c4cc008d5d08009aba200122533357340042944004894ccd5cd0010008a502222232332533357346002900008018a999ab9a300148008401054ccd5cd1800a4008200a2a666ae68c0052006100616370e6aae74004d55cf0009baa0052357426ae88d5d11aba23574400246ae84d5d10009"
                ),
                "cbor"
            ).body
        ).not.toThrow();

        const myCompiled = Cbor.encode(
            new CborBytes(
                Cbor.encode(
                    new CborBytes(
                        UPLCEncoder.compile(
                            new UPLCProgram(
                                [1,0,0],
                                oneshotParametrizedUPLC
                            )
                        ).toBuffer().buffer
                    )
                ).asBytes
            )
        );

        const myCompiledDeserialized = UPLCDecoder.parse(
            myCompiled.asBytes,
            "cbor"
        ).body;

        const _0 = showUPLC( myCompiledDeserialized );
        // console.log( _0 );
        expect(
            _0
        ).toEqual(
            showUPLC( oneshotParametrizedUPLC )
        )

        const oneShotAsScript = new Script(
            ScriptType.PlutusV2,
            compile( oneshotParametrized )
        )
        oneShotAsScript.hash;
        const _1 = showUPLC(
            UPLCDecoder.parse(
                fromHex(
                    (oneShotAsScript.toJson() as any).cborHex
                ),
                "cbor"
            ).body
        );
        // console.log( _1 );
        expect(
            _1
        ).toEqual(
            showUPLC( oneshotParametrizedUPLC )
        )

        const myCompiledStr = myCompiled.toString();
        
        const _2 = showUPLC(
            UPLCDecoder.parse(
                fromHex( myCompiledStr ),
                "cbor"
            ).body
        );
        // console.log( _2 );
        expect(
            _2
        ).toEqual(
            showUPLC( oneshotParametrizedUPLC )
        )

        /*/
        expect(
            showUPLC( deserialized )
        ).toEqual(
            showUPLC( oneshotParametrizedUPLC )
        )
        //*/
    });

})