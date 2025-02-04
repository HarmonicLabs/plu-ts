import { PAddress, PAssetsEntry, PCurrencySymbol, PScriptContext, PScriptPurpose, PTxInfo, PTxOutRef, PValue, V2, pBool, pData, pand, pdelay, perror, pfn, phoist, pif, plam, plet, pmakeUnit, pmatch, pstruct, ptraceError, punBData, punsafeConvertType } from "../..";
import { TxOutRef } from "@harmoniclabs/cardano-ledger-ts";
import { dataFromCbor } from "@harmoniclabs/plutus-data";
import { Machine, CEKConst } from "@harmoniclabs/plutus-machine";
import { _getMinUnboundDbn } from "../../../IR/toUPLC/subRoutines/handleLetted/groupByScope";
import { bool, bs, unit, str, data, list, lam } from "../../../type_system";

const value_contains_master = phoist(
    pfn([
        PValue.type,
        PCurrencySymbol.type
    ],  bool)
    ( ( value, own_policy ) => {

        return pBool( true );
    })
);

const Redeemer = pstruct({
    // must be 0
    CtxLike: {
        tx: PTxInfo.type,
        purpose: PScriptPurpose.type
    },
    InputNonce: {
        nonce: bs
    }
});


const passert = phoist(
    plam( bool, unit )
    ( condition =>
        pif( unit ).$( condition )
        .then( pmakeUnit() )
        .else( perror( unit ) )
    )
);

const passertOrTrace = phoist(
    pfn([ bool, str] , unit )
    ( (condition, msg) =>
        pif( unit ).$( condition )
        .then( pmakeUnit() )
        .else( ptraceError( unit ).$( msg ) )
    )
);

const tempura
= pfn([
    PTxOutRef.type,
    data,
    Redeemer.type,
    V2.PScriptContext.type
],  unit)
(( utxoParam, state, rdmr, { tx, purpose } ) => {

    const spendingUtxoRef = plet(
        pmatch( purpose )
        .onSpending(({ utxoRef }) => utxoRef )
        ._( _ => perror( V2.PTxOutRef.type ) ),
        "spendingUtxoRef"
    );

    const { inputs: ins, outputs: outs, mint } = tx;

    const ownAddr = plet(
        pmatch(
            ins.find( i => i.utxoRef.eq( spendingUtxoRef ) )
        )
        .onJust(({ val }) => val.resolved.address )
        .onNothing( _ => perror( PAddress.type ) )
    );

    const own_validator_hash = plet(
        punBData.$( ownAddr.credential.raw.fields.head ),
        "own_validator_hash"
    )
    
    const ownOuts = plet(
        outs.filter( out => out.address.eq( ownAddr ) ),
        "ownOuts"
    );

    const ownMints = plet(
        pmatch(
            mint.find(({ fst: policy }) => plet( own_validator_hash ).in( _=> pBool( true )) )
        )
        .onJust(({ val }) => val.snd )
        .onNothing( _ => perror( list( PAssetsEntry.type ) ) ),
        "ownMints"
    );

    const fake1 = plet( ownMints ).in( _ => pBool( true ) );
    const fake2 = plet( ownOuts ).in( _ => pBool( true ) );
    const fake3 = plet( own_validator_hash ).in( _ => pBool( true ) );

    return passert.$(
        // pBool( true )
        // .and(
        //     singleMintEntry
        // ) // OK (but not both)
        // .and( outHasOnlyMaster ) // OK
        pand
        .$( fake1 )
        .$( pdelay(fake2) )
        .and( fake3 )
    );

});

describe("run tempura", () => {

    test.only("mine 0", () => {

        const contract = tempura.$(
            PTxOutRef.fromData(
                pData(
                    new TxOutRef({
                        "id": "1cd30f11c3d774fa1cb43620810a405e6048c8ecea2e85ff43f5c3ad08096e46",
                        "index": 1
                    }).toData()
                )
            )
        );

        const datumData = dataFromCbor("d8799f00582071eb1a4896739027745df976a065ded7ffd4e6371a2a9256999f59371b50b36a0519ffff001b0000018a5b512a340080ff");
        const rdmrData  = dataFromCbor("d87a9f50842b09bb0f88bf1232901043701534ceff");
        const ctxData   = dataFromCbor(
            "D87982D8798C82D87982D87982D87981582012CC3906A43731477E63522A24CBB5EAF74046BF7B44F600D8F062ECAC331B7100D87984D87982D87A81581CC9981006C4ABF1EAB96A0C87B0EE3D40B8007CD4C9B3D0DEA357C278D87A80A240A1401A001898F4581CC9981006C4ABF1EAB96A0C87B0EE3D40B8007CD4C9B3D0DEA357C278A1466974616D616501D87B81D8798800582071EB1A4896739027745DF976A065DED7FFD4E6371A2A9256999F59371B50B36A05193FFF001B0000018A5B512A340080D87A80D87982D87982D879815820FBBCE31D47E45AF499BAFF9446C99CCBC2E80DB613467DBC5FFEA2F3BB10A8A201D87984D87982D87981581C13867B04DB054CAA9655378FE37FEDEE7029924FBE1243887DC35FD8D87A80A140A1401B000000024EFC84FFD87980D87A8082D87982D87982D879815820FBBCE31D47E45AF499BAFF9446C99CCBC2E80DB613467DBC5FFEA2F3BB10A8A200D87984D87982D87A81581CC9981006C4ABF1EAB96A0C87B0EE3D40B8007CD4C9B3D0DEA357C278D87A80A140A1401A0128CCE6D87B8100D87981581CC9981006C4ABF1EAB96A0C87B0EE3D40B8007CD4C9B3D0DEA357C278D87982D87982D879815820FBBCE31D47E45AF499BAFF9446C99CCBC2E80DB613467DBC5FFEA2F3BB10A8A200D87984D87982D87A81581CC9981006C4ABF1EAB96A0C87B0EE3D40B8007CD4C9B3D0DEA357C278D87A80A140A1401A0128CCE6D87B8100D87981581CC9981006C4ABF1EAB96A0C87B0EE3D40B8007CD4C9B3D0DEA357C27882D87984D87982D87A81581CC9981006C4ABF1EAB96A0C87B0EE3D40B8007CD4C9B3D0DEA357C278D87A80A240A1401A001898F4581CC9981006C4ABF1EAB96A0C87B0EE3D40B8007CD4C9B3D0DEA357C278A1466974616D616501D87B81D8798801582000000F3B69E1436D48366F34C2E217CF598DC2F886D7DC5BB56688B8365A748B05193FFF1A000A75BC1B0000018A5B5B9FF00080D87A80D87984D87982D87981581C13867B04DB054CAA9655378FE37FEDEE7029924FBE1243887DC35FD8D87A80A240A1401B000000024EF9AC02581CC9981006C4ABF1EAB96A0C87B0EE3D40B8007CD4C9B3D0DEA357C278A14754454D505552411B000000012A05F200D87980D87A80A140A1401A0002D8FDA240A14000581CC9981006C4ABF1EAB96A0C87B0EE3D40B8007CD4C9B3D0DEA357C278A14754454D505552411B000000012A05F20080A0D87982D87982D87A811B0000018A5B5A4060D87980D87982D87A811B0000018A5B5CFF80D8798080A2D87A81D87982D87981582012CC3906A43731477E63522A24CBB5EAF74046BF7B44F600D8F062ECAC331B7100D87A8150842B09BB0F88BF1232901043701534CED87981581CC9981006C4ABF1EAB96A0C87B0EE3D40B8007CD4C9B3D0DEA357C278D87980A05820198CA261BC2C0F39E64132C19CD2B2E38DFFC4F5594EC195D8750013F73F1B7BD87A81D87982D87981582012CC3906A43731477E63522A24CBB5EAF74046BF7B44F600D8F062ECAC331B7100"
        );

        const term = punsafeConvertType(
            contract
            .$( pData( datumData ) )
            .$( Redeemer.fromData( pData( rdmrData ) ) ),
            lam( data, unit )
        )
        .$( pData( ctxData ) );

        // console.log( prettyIRJsonStr( term.toIR() ) )

        // const ir = term.toIR();
        // console.time("uplc compilation");
        const uplc = term.toUPLC();
        // console.timeEnd("uplc compilation");

        // console.log( prettyUPLC( uplc ) );

        const res = Machine.eval( uplc );

        /*
        console.log( res );
        console.log(
            (res as any)?.result?.addInfos?.list?.value ??
            (res as any)?.result?.addInfos?.data ??
            (res as any)?.result?.addInfos ??
            (res as any)?.result
        );
        //*/

        expect( res.result instanceof CEKConst ).toBe( true );
        expect( res.result ).toEqual( CEKConst.unit );
    });

    test("mine 1", () => {

        const contract = tempura.$(
            PTxOutRef.fromData(
                pData(
                    new TxOutRef({
                        "id": "1cd30f11c3d774fa1cb43620810a405e6048c8ecea2e85ff43f5c3ad08096e46",
                        "index": 1
                    }).toData()
                )
            )
        );

        const datumData = dataFromCbor("d8799f005820e17a6dd5323bc273e39b05066125dcdbe2c85e3cd4404a948a1efd24315045be0519ffff001b0000018a8a1d8eac0080ff");
        const rdmrData  = dataFromCbor("d87a9f50c8027c73a3ed42399dbd8575a3e7adb1ff");
        const ctxData   = dataFromCbor(
            "d8799fd8799f9fd8799fd8799fd8799f5820c0b5b60f786860ef16f32b64c93f59b38fea905155d87a576836578240b051ddff00ffd8799fd8799fd87a9f581c30ed435daad3fd6ce0f7cded1b56fc77d16d44745d2d03c6a8a56c2bffd87a80ffbf40bf401a001898f4ff581c30ed435daad3fd6ce0f7cded1b56fc77d16d44745d2d03c6a8a56c2bbf466974616d616501ffffd87b9fd8799f005820e17a6dd5323bc273e39b05066125dcdbe2c85e3cd4404a948a1efd24315045be0519ffff001b0000018a8a1d8eac0080ffffd87a80ffffd8799fd8799fd8799f5820df0326b5442d18a8517724aefb5e55cacb9f7c0469805d6a2df287825ddc1a02ff01ffd8799fd8799fd8799f581c13867b04db054caa9655378fe37fedee7029924fbe1243887dc35fd8ffd87a80ffbf40bf401b000000024bb13d2fffffd87980d87a80ffffff9fd8799fd8799fd8799f5820df0326b5442d18a8517724aefb5e55cacb9f7c0469805d6a2df287825ddc1a02ff00ffd8799fd8799fd87a9f581c30ed435daad3fd6ce0f7cded1b56fc77d16d44745d2d03c6a8a56c2bffd87a80ffbf40bf401a00f6afeaffffd87b9f00ffd8799f581c30ed435daad3fd6ce0f7cded1b56fc77d16d44745d2d03c6a8a56c2bffffffd8799fd8799fd8799f5820df0326b5442d18a8517724aefb5e55cacb9f7c0469805d6a2df287825ddc1a02ff00ffd8799fd8799fd87a9f581c30ed435daad3fd6ce0f7cded1b56fc77d16d44745d2d03c6a8a56c2bffd87a80ffbf40bf401a00f6afeaffffd87b9f00ffd8799f581c30ed435daad3fd6ce0f7cded1b56fc77d16d44745d2d03c6a8a56c2bffffffff9fd8799fd8799fd87a9f581c30ed435daad3fd6ce0f7cded1b56fc77d16d44745d2d03c6a8a56c2bffd87a80ffbf40bf401a001898f4ff581c30ed435daad3fd6ce0f7cded1b56fc77d16d44745d2d03c6a8a56c2bbf466974616d616501ffffd87b9fd8799f01582000000af6b629d77224b6ead5f73c9b08be9c04c075a5e0fc7aa4c1762582500e0519ffff3901f31b0000018a8a1d8cb80080ffffd87a80ffd8799fd8799fd8799f581c13867b04db054caa9655378fe37fedee7029924fbe1243887dc35fd8ffd87a80ffbf40bf401b000000024bae648aff581c30ed435daad3fd6ce0f7cded1b56fc77d16d44745d2d03c6a8a56c2bbf4754454d505552411b000000012a05f200ffffd87980d87a80ffffbf40bf401a0002d8a5ffffbf40bf4000ff581c30ed435daad3fd6ce0f7cded1b56fc77d16d44745d2d03c6a8a56c2bbf4754454d505552411b000000012a05f200ffff80a0d8799fd8799fd87a9f1b0000018a8a1c2d28ffd87980ffd8799fd87a9f1b0000018a8a1eec48ffd87980ffff80bfd87a9fd8799fd8799f5820c0b5b60f786860ef16f32b64c93f59b38fea905155d87a576836578240b051ddff00ffffd87a9f50c8027c73a3ed42399dbd8575a3e7adb1ffd8799f581c30ed435daad3fd6ce0f7cded1b56fc77d16d44745d2d03c6a8a56c2bffd87980ffa058208c7eb92dc16afd7641b7fc50858c4c39efb57c4557512fd1a3a1b3635d84e7f8ffd87a9fd8799fd8799f5820c0b5b60f786860ef16f32b64c93f59b38fea905155d87a576836578240b051ddff00ffffff"
        );

        const res = Machine.eval(
            punsafeConvertType(
                contract
                .$( pData( datumData ) )
                .$( Redeemer.fromData( pData( rdmrData ) ) ),
                lam( data, unit )
            )
            .$( pData( ctxData ) )
        );

        console.log( res );
        console.log(
            (res as any)?.result?.addInfos?.list?.value ??
            (res as any)?.result?.addInfos?.data ??
            (res as any)?.result?.addInfos ??
            (res as any)?.result
        );

        expect( res.result instanceof CEKConst ).toBe( true );
        expect( res.result ).toEqual( CEKConst.unit );
    });

});