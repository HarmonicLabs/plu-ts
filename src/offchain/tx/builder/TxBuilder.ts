import JsRuntime from "../../../utils/JsRuntime";
import ObjectUtils from "../../../utils/ObjectUtils";
import BufferUtils from "../../../utils/BufferUtils";

import type { NetworkT } from "../../ledger/Network";
import { costModelsToLanguageViewCbor, defaultV1Costs, defaultV2Costs, isCostModelsV1, isCostModelsV2 } from "../../ledger/CostModels";
import { txBuildOutToTxOut } from "./txBuild/ITxBuildOutput";
import { forceBigUInt } from "../../../types/ints/Integer";
import { Script, ScriptType } from "../../script/Script";
import { ProtocolParamters, isProtocolParameters } from "../../ledger/protocol/ProtocolParameters";
import { getTxInfos } from "./toOnChain/getTxInfos";
import { blake2b_256, byte } from "../../../crypto";
import { Tx, getNSignersNeeded } from "../Tx";
import { Machine, machineVersionV1, machineVersionV2 } from "../../../onchain/CEK/Machine";
import { CanBeData, canBeData, forceData } from "../../../types/Data/CanBeData";
import { ITxBuildArgs } from "./txBuild/ITxBuildArgs";
import { ITxBuildOptions } from "./txBuild/ITxBuildOptions";
import { TxIn } from "../body/TxIn";
import { TxOut } from "../body/output/TxOut";
import { Value } from "../../ledger/Value/Value";
import { TxRedeemer, TxRedeemerTag } from "../TxWitnessSet/TxRedeemer";
import { BasePlutsError } from "../../../errors/BasePlutsError";
import { TxOutRef } from "../body/output/UTxO";
import { VKeyWitness } from "../TxWitnessSet/VKeyWitness/VKeyWitness";
import { Data } from "../../../types/Data/Data";
import { BootstrapWitness } from "../TxWitnessSet/BootstrapWitness";
import { ExBudget } from "../../../onchain/CEK/Machine/ExBudget";
import { AuxiliaryData } from "../AuxiliaryData/AuxiliaryData";
import { Hash32 } from "../../hashes/Hash32/Hash32";
import { CborString } from "../../../cbor/CborString";
import { dataToCbor } from "../../../types/Data/toCbor";
import { ScriptDataHash } from "../../hashes/Hash32/ScriptDataHash";
import { UPLCTerm } from "../../../onchain/UPLC/UPLCTerm";
import { UPLCDecoder } from "../../../onchain/UPLC/UPLCDecoder";
import { Application } from "../../../onchain/UPLC/UPLCTerms/Application";
import { UPLCConst } from "../../../onchain/UPLC/UPLCTerms/UPLCConst";
import { DataConstr } from "../../../types/Data/DataConstr";
import { ErrorUPLC } from "../../../onchain/UPLC/UPLCTerms/ErrorUPLC";
import { UTxO } from "../body/output/UTxO";

export class TxBuilder
{
    readonly network!: NetworkT
    readonly protocolParamters!: ProtocolParamters
    
    constructor( network: NetworkT, protocolParamters: Readonly<ProtocolParamters> )
    {
        JsRuntime.assert(
            network === "testnet" ||
            network === "mainnet",
            "invlaid 'network' argument while constructing a 'TxBuilder' instance"
        );
        ObjectUtils.defineReadOnlyProperty(
            this,
            "network",
            network
        );

        JsRuntime.assert(
            isProtocolParameters( protocolParamters ),
            "invlaid 'protocolParamters' argument while constructing a 'TxBuilder' instance"
        );
        ObjectUtils.defineReadOnlyProperty(
            this,
            "protocolParamters",
            ObjectUtils.freezeAll( protocolParamters )
        );

        ObjectUtils.definePropertyIfNotPresent(
            this,
            "run",
            {
                // define as getter so that it can be reused without messing around things
                get: () =>  new TxBuilderRunner( this ),
                // set does nothing ( aka. readonly )
                set: ( ...whatever: any[] ) => {},
                enumerable: true,
                configurable: false
            }
        );

        const costmdls = protocolParamters.costModels;
        const cekVersion =
            isCostModelsV2( costmdls.PlutusV2 ) ? machineVersionV2 :
            isCostModelsV1( costmdls.PlutusV1 ) ? machineVersionV1 : "none";
        const costs = cekVersion === machineVersionV2 ?
            costmdls.PlutusV2 ?? defaultV2Costs :
            costmdls.PlutusV1 ?? defaultV1Costs;

        if( cekVersion !== "none" )
        ObjectUtils.definePropertyIfNotPresent(
            this,
            "cek",
            {
                // define as getter so that it can be reused without messing around things
                get: () => new Machine(
                    cekVersion,
                    costs
                ),
                // set does nothing ( aka. readonly )
                set: ( ...whatever: any[] ) => {},
                enumerable: false,
                configurable: false
            }
        );
    }

    calcLinearFee( tx: Tx | CborString ): bigint
    {
        return (
            forceBigUInt( this.protocolParamters.minFeeCoefficient ) *
            BigInt( (tx instanceof Tx ? tx.toCbor() : tx ).asBytes.length ) +
            forceBigUInt( this.protocolParamters.minFeeFixed )
        );
    }

    build({
        inputs,
        changeAddress,
        outputs,
        readonlyRefInputs,
        requiredSigners,
        collaterals,
        collateralReturn,
        mints,
        invalidBefore,
        invalidAfter,
        certificates,
        withdrawals,
        metadata,
        protocolUpdateProposal
    }: ITxBuildArgs,
    {
        onScriptInvalid,
        onScriptResult
    }: ITxBuildOptions = {}
    ): Tx
    {
        const cek: Machine = (this as any).cek;
        const canUseCEK: boolean = cek !== undefined;

        function assertCEK()
        {
            if( !canUseCEK )
            throw new BasePlutsError(
                "unable to construct transaction including scripts " +
                "if the protocol params are missing the script evaluation costs"
            )
        }

        let totInputValue = Value.zero;
        const refIns: UTxO[] = readonlyRefInputs?.slice() ?? [];

        const outs = outputs?.map( txBuildOutToTxOut ) ?? [];
        const requiredOutputValue = outs.reduce( (acc, out) => Value.add( acc, out.amount ), Value.zero );

        const undef: undefined = void 0;

        const vkeyWitnesses: VKeyWitness[] = [];
        const nativeScriptsWitnesses: Script<ScriptType.NativeScript>[] = [];
        const bootstrapWitnesses: BootstrapWitness[] = [];
        const plutusV1ScriptsWitnesses: Script<ScriptType.PlutusV1>[] = [];
        const datums: Data[] = []
        const plutusV2ScriptsWitnesses: Script<ScriptType.PlutusV2>[] = [];
        
        const dummyExecBudget = ExBudget.maxCborSize;

        const spendRedeemers: TxRedeemer[] = [];
        const mintRedeemers: TxRedeemer[] = [];
        const certRedeemers: TxRedeemer[] = [];
        const withdrawRedeemers: TxRedeemer[] = [];

        type ScriptToExecEntry = {
            rdmrTag: TxRedeemerTag,
            index: number,
            script: {
                type: ScriptType,
                uplc: UPLCTerm
            },
            datum?: Data
        };

        const scriptsToExec: ScriptToExecEntry[] = [];

        function pushScriptToExec( idx: number, tag: TxRedeemerTag, script: Script, datum?: Data )
        {
            if( script.type !== ScriptType.NativeScript )
            {
                scriptsToExec.push({
                    index: idx,
                    rdmrTag: tag,
                    script: {
                        type: script.type,
                        uplc: UPLCDecoder.parse(
                            script.cbor,
                            "cbor"
                        ).body
                    },
                    datum
                })
            }
        }

        function pushWitScript( script : Script ): void
        {
            const t = script.type;
            
            if( t === ScriptType.NativeScript  )     nativeScriptsWitnesses  .push( script as any );
            else if( t === ScriptType.PlutusV1 )     plutusV1ScriptsWitnesses.push( script as any );
            else if( t === ScriptType.PlutusV2 )     plutusV2ScriptsWitnesses.push( script as any );
        }

        /**
         * @returns `Script` to execute
         */
        function checkScriptAndPushIfInline( script: { inline: Script } | { ref: UTxO } ): Script
        {
            if( ObjectUtils.hasOwn( script, "inline" ) )
            {
                if( ObjectUtils.hasOwn( script, "ref" ) )
                throw new BasePlutsError(
                    "multiple scripts specified"
                );

                pushWitScript( script.inline );

                return script.inline;
            }
            if( ObjectUtils.hasOwn( script, "ref" ) )
            {
                if( ObjectUtils.hasOwn( script, "inline" ) )
                throw new BasePlutsError(
                    "multiple scripts specified"
                );

                const refScript = script.ref.resolved.refScript;

                if( refScript === (void 0) )
                throw new BasePlutsError(
                    "script was specified to be a reference script " +
                    "but the provided utxo is missing any attached script"
                );

                refIns.push( script.ref );
                return refScript;
            }

            throw "unexpected execution flow 'checkScriptAndPushIfInline' in TxBuilder"
        }

        /**
         * 
         * @param datum 
         * @param inlineDatum 
         * @returns the `Data` of the datum
         */
        function pushWitDatum(
            datum: CanBeData | "inline",
            inlineDatum: CanBeData | Hash32 | undefined
        ): Data
        {
            if( datum === "inline" )
            {
                if( !canBeData( inlineDatum ) )
                throw new BasePlutsError(
                    "datum was specified to be inline; but inline datum is missing"
                );

                // no need to push to witnesses

                return forceData( inlineDatum );
            }
            else
            {
                const dat = forceData( datum );

                // add datum to witnesses
                // the node finds it trough the datum hash (on the utxo)
                datums.push( dat );

                return dat;
            }
        }

        let isScriptValid: boolean = true;

        const requiredSpendScripts = [];

        const _inputs = inputs.map( ({
            utxo,
            referenceScriptV2,
            inputScript
        }, i) => {
            
            const addr = utxo.resolved.address;

            totInputValue =  Value.add( totInputValue, utxo.resolved.amount );

            if(
                addr.paymentCreds.type === "script" &&
                referenceScriptV2 === undef &&
                inputScript === undef
            )
            throw new BasePlutsError(
                "spending script utxo \"" + utxo.utxoRef.toString() + "\" without script source"
            );

            if( referenceScriptV2 !== undef )
            {
                if( inputScript !== undef )
                throw new BasePlutsError(
                    "invalid input; multiple scripts specified"
                );

                assertCEK();

                const {
                    datum,
                    redeemer,
                    refUtxo
                } = referenceScriptV2;

                const refScript = refUtxo.resolved.refScript;

                if( refScript === undefined )
                throw new BasePlutsError(
                    "reference utxo specified (" + refUtxo.toString() + ") is missing an attached reference Script"
                )

                refIns.push( refUtxo );

                const dat = pushWitDatum( datum, utxo.resolved.datum );

                spendRedeemers.push(new TxRedeemer({
                    data: forceData( redeemer ),
                    index: i,
                    execUnits: dummyExecBudget.clone(),
                    tag: TxRedeemerTag.Spend
                }));

                pushScriptToExec( i, TxRedeemerTag.Spend, refScript, dat );
                
            }
            if( inputScript !== undefined )
            {
                if( referenceScriptV2 !== undefined )
                throw new BasePlutsError(
                    "invalid input; multiple scripts specified"
                );

                const {
                    datum,
                    redeemer,
                    script
                } = inputScript;

                pushWitScript( script );

                const dat = pushWitDatum( datum, utxo.resolved.datum ); 

                spendRedeemers.push(new TxRedeemer({
                    data: forceData( redeemer ),
                    index: i,
                    execUnits: dummyExecBudget.clone(),
                    tag: TxRedeemerTag.Spend
                }));
                
                pushScriptToExec( i, TxRedeemerTag.Spend, script, dat );

            }

            return new TxIn( utxo )
        }) as [TxIn, ...TxIn[]];
        
        // good luck spending more than 4294.967295 ADA in fees
        // also 16.777215 ADA (3 bytes) is a lot; but CBOR only uses 2 or 4 bytes integers
        // and 2 are ~0.06 ADA (too low) so go for 4;
        const dummyFee = BigInt( "0xffffffff" );

        const dummyOuts = outs.map( txO => txO.clone() )

        // add dummy change address output
        dummyOuts.push(
            new TxOut({
                address: changeAddress,
                amount: Value.sub(
                    totInputValue,
                    Value.add(
                        requiredOutputValue,
                        Value.lovelaces(
                            forceBigUInt(
                                this.protocolParamters.minFeeCoefficient 
                            )
                        )
                    )
                )
            })
        );

        // index to be modified
        const dummyMintRedeemers: [ Hash32, Script, TxRedeemer ][] = [];

        const _mint: Value | undefined = mints?.reduce( (accum, {
                script,
                value
            }, i ) => {

                const redeemer = script.redeemer;
                const policyId = script.policyId;

                const toExec = checkScriptAndPushIfInline( script );

                dummyMintRedeemers.push([
                    policyId,
                    toExec,
                    new TxRedeemer({
                        data: forceData( redeemer ),
                        index: i, // to be modified as `indexOfPolicy( policyId )`
                        execUnits: dummyExecBudget.clone(),
                        tag: TxRedeemerTag.Mint
                    })
                ]);

                return Value.add( accum, value )   
            },
            Value.zero
        );

        function indexOfPolicy( policy: Hash32 ): number
        {
            const policyStr = policy.toString();
            return _mint?.map.findIndex( entry => entry.policy.toString() === policyStr ) ?? -1;
        }

        dummyMintRedeemers.forEach( ([ policy, toExec, dummyRdmr ]) => {

            const i = indexOfPolicy( policy );

            mintRedeemers.push(new TxRedeemer({
                data: dummyRdmr.data,
                index: i,
                execUnits: dummyRdmr.execUnits,
                tag: TxRedeemerTag.Mint
            }));

            pushScriptToExec( i, TxRedeemerTag.Mint, toExec );

        })

        const _certs = certificates?.map( ({
            cert,
            script
        }, i) => {
            if( script !== undef )
            {
                certRedeemers.push(new TxRedeemer({
                    data: forceData( script.redeemer ),
                    index: i,
                    execUnits: dummyExecBudget.clone(),
                    tag: TxRedeemerTag.Cert
                }));

                const toExec = checkScriptAndPushIfInline( script );

                pushScriptToExec( i, TxRedeemerTag.Cert, toExec );

            }
            return cert;
        })

        const _wits = withdrawals
        ?.sort( (a, b) =>
            BufferUtils.lexCompare(
                a.withdrawal.rewardAccount.asBytes,
                b.withdrawal.rewardAccount.asBytes
            )
        )
        .map( ({
            withdrawal,
            script
        },i) => {

            if( script !== undef )
            {
                withdrawRedeemers.push(new TxRedeemer({
                    data: forceData( script.redeemer ),
                    index: i,
                    execUnits: dummyExecBudget.clone(),
                    tag: TxRedeemerTag.Withdraw
                }));

                const toExec = checkScriptAndPushIfInline( script );

                pushScriptToExec( i, TxRedeemerTag.Withdraw, toExec );
            }

            return withdrawal; 
        })

        const auxData = metadata !== undefined? new AuxiliaryData({ metadata }) : undefined;

        const redeemers =
            spendRedeemers
            .concat( mintRedeemers )
            .concat( withdrawRedeemers )
            .concat( certRedeemers );
        
        const datumsScriptData = datums.reduce(
            (acc, dat) => acc.concat( Array.from( dataToCbor( dat ).asBytes ) ),
            [] as number[]
        ) as byte[];

        const scriptData =
            redeemers.length === 0 && datums.length === 0 ?
            undef : 
            redeemers.length === 0 && datums.length > 0 ?
            /*
            ; in the case that a transaction includes datums but does not
            ; include any redeemers, the script data format becomes (in hex):
            ; [ 80 | datums | A0 ]
            ; corresponding to a CBOR empty list and an empty map.
            */
            [ 0x80, ...datumsScriptData, 0xa0 ] as byte[] :
            /*
            ; script data format:
            ; [ redeemers | datums | language views ]
            ; The redeemers are exactly the data present in the transaction witness set.
            ; Similarly for the datums, if present. If no datums are provided, the middle
            ; field is an empty string.
            */
            redeemers.reduce(
                (acc, rdmr) => acc.concat( Array.from( dataToCbor( rdmr.data ).asBytes ) ),
                [] as number[]
            )
            .concat(
                datumsScriptData
            )
            .concat(
                Array.from(
                    costModelsToLanguageViewCbor(
                        this.protocolParamters.costModels
                    ).asBytes
                )
            ) as byte[];

        const scriptDataHash = scriptData === undef ? undef :
        new ScriptDataHash(
            Buffer.from(
                blake2b_256(
                    scriptData
                )
            )
        );

        const dummyTx = new Tx({
            body: {
                inputs: _inputs,
                outputs: dummyOuts,
                fee: dummyFee,
                mint: _mint,
                certs: _certs,
                withdrawals: _wits,
                refInputs: refIns.length === 0 ? undef : refIns.map( refIn => refIn instanceof TxIn ? refIn : new TxIn( refIn ) ),
                protocolUpdate: protocolUpdateProposal,
                requiredSigners,
                collateralInputs: collaterals,
                collateralReturn:
                    collateralReturn === undef ? 
                    undef : 
                    txBuildOutToTxOut( collateralReturn ),
                totCollateral: undef,
                validityIntervalStart:
                    invalidBefore === undef ?
                    undef :
                    forceBigUInt( invalidBefore ),
                ttl:
                    (
                        invalidBefore === undef ||
                        invalidAfter === undef
                    ) ?
                    undef :
                    forceBigUInt( invalidAfter ) - forceBigUInt( invalidBefore ),
                auxDataHash: auxData?.hash,
                scriptDataHash,
                network: this.network
            },
            witnesses: {
                vkeyWitnesses,
                bootstrapWitnesses,
                datums,
                redeemers,
                nativeScripts: nativeScriptsWitnesses,
                plutusV1Scripts: plutusV1ScriptsWitnesses,
                plutusV2Scripts: plutusV2ScriptsWitnesses
            },
            auxiliaryData: auxData,
            isScriptValid
        });

        const minFeeMultiplier = forceBigUInt( this.protocolParamters.minFeeCoefficient );

        const nVkeyWits = BigInt( getNSignersNeeded( dummyTx.body ) );

        const minFee = this.calcLinearFee( dummyTx ) +
            // consider also vkeys witnesses to be added
            // each vkey witness has fixed size of 102 cbor bytes
            // (1 bytes cbor array tag (length 2)) + (34 cbor bytes of length 32) + (67 cbor bytes of length 64)
            // for a fixed length of 102
            BigInt( 102 ) * nVkeyWits * minFeeMultiplier +
            // we add some more bytes for the array tag
            BigInt( nVkeyWits < 24 ? 1 : (nVkeyWits < 256 ? 2 : 3) ) * minFeeMultiplier;

        let txOuts: TxOut[] = outs.map( txO => txO.clone() );
        txOuts.push(
            new TxOut({
                address: changeAddress,
                amount: Value.sub(
                    totInputValue,
                    Value.add(
                        requiredOutputValue,
                        Value.lovelaces( minFee )
                    )
                )
            })
        );

        let tx = new Tx({
            ...dummyTx,
            body: {
                ...dummyTx.body,
                outputs: txOuts,
                fee: minFee
            }
        });

        const rdmrs = tx.witnesses.redeemers ?? [];
        const nRdmrs = rdmrs.length;

        if( nRdmrs === 0 ) return tx;

        function getCtx(
            scriptType: ScriptType,
            spendingPurpose: DataConstr,
            txInfosV1: Data | undefined,
            txInfosV2: Data
        ): DataConstr
        {
            if( scriptType === ScriptType.PlutusV2 )
            {
                return new DataConstr(
                    0,
                    [
                        txInfosV2,
                        spendingPurpose
                    ]
                );
            }
            else if( scriptType === ScriptType.PlutusV1 )
            {
                if( txInfosV1 === undef )
                throw new BasePlutsError(
                    "plutus script v1 included in a v2 transaction"
                );

                return new DataConstr(
                    0,
                    [
                        txInfosV1,
                        spendingPurpose
                    ]
                );
            }
            else throw new BasePlutsError(
                "unexpected native script execution"
            );
        }

        const [ memRational, cpuRational ] = this.protocolParamters.execCosts;

        const spendScriptsToExec = scriptsToExec.filter( elem => elem.rdmrTag === TxRedeemerTag.Spend );
        const mintScriptsToExec = scriptsToExec.filter( elem => elem.rdmrTag === TxRedeemerTag.Mint );
        const certScriptsToExec = scriptsToExec.filter( elem => elem.rdmrTag === TxRedeemerTag.Cert );
        const withdrawScriptsToExec = scriptsToExec.filter( elem => elem.rdmrTag === TxRedeemerTag.Withdraw );

        const maxRound = 3;

        let _isScriptValid: boolean = true;
        let fee = minFee;
        let prevFee: bigint;

        for( let round = 0; round < maxRound; round++ )
        {
            prevFee = fee;

            const { v1: txInfosV1, v2: txInfosV2 } = getTxInfos( tx );

            let totExBudget = new ExBudget({ mem: 0, cpu: 0 });

            for( let i = 0 ; i < nRdmrs; i++)
            {
                const rdmr = rdmrs[i];
                const { tag, data: rdmrData, index } = rdmr;
                const spendingPurpose = rdmr.toSpendingPurposeData( tx.body );

                const onlyRedeemerArg = ( purposeScriptsToExec: ScriptToExecEntry[] ) =>
                {
                    const script = purposeScriptsToExec.find( ({ index: idx }) => idx === index )?.script;

                    if( script === undef )
                    throw new BasePlutsError(
                        "missing script for " + tag + " redeemer " + index
                    );

                    const { result, budgetSpent, logs } = cek.eval(
                        new Application(
                            new Application(
                                script.uplc,
                                UPLCConst.data( rdmrData )
                            ),
                            UPLCConst.data(
                                getCtx(
                                    script.type,
                                    spendingPurpose,
                                    txInfosV1,
                                    txInfosV2
                                )
                            )
                        )
                    );

                    onScriptResult && onScriptResult(
                        rdmr.clone(),
                        result.clone(),
                        budgetSpent.clone(),
                        logs.slice()
                    );

                    if( result instanceof ErrorUPLC )
                    {
                        onScriptInvalid && onScriptInvalid( rdmr.clone(), logs.slice() );
                        _isScriptValid = false;
                    }

                    rdmrs[i] = new TxRedeemer({
                        ...rdmr,
                        execUnits: budgetSpent
                    });

                    totExBudget.add( budgetSpent );
                }

                if( tag === TxRedeemerTag.Spend )
                {
                    const entry = spendScriptsToExec.find( ({ index: idx }) => idx === index );

                    if( entry === undef )
                    throw new BasePlutsError(
                        "missing script for spend redeemer " + index
                    );

                    const { script, datum } = entry;

                    if( datum === undef )
                    throw new BasePlutsError(
                        "missing datum for spend redeemer " + index
                    );

                    const { result, budgetSpent, logs } = cek.eval(
                        new Application(
                            new Application(
                                new Application(
                                    script.uplc,
                                    UPLCConst.data( datum )
                                ),
                                UPLCConst.data( rdmrData )
                            ),
                            UPLCConst.data(
                                getCtx(
                                    script.type,
                                    spendingPurpose,
                                    txInfosV1,
                                    txInfosV2
                                )
                            )
                        )
                    );

                    onScriptResult && onScriptResult(
                        rdmr.clone(),
                        result.clone(),
                        budgetSpent.clone(),
                        logs.slice()
                    );

                    if( result instanceof ErrorUPLC )
                    {
                        onScriptInvalid && onScriptInvalid( rdmr.clone(), logs.slice() );

                        _isScriptValid = false;
                    }

                    rdmrs[i] = new TxRedeemer({
                        ...rdmr,
                        execUnits: budgetSpent,
                    });

                    totExBudget.add( budgetSpent );
                }
                else if( tag === TxRedeemerTag.Mint )       onlyRedeemerArg( mintScriptsToExec )
                else if( tag === TxRedeemerTag.Cert )       onlyRedeemerArg( certScriptsToExec )
                else if( tag === TxRedeemerTag.Withdraw )   onlyRedeemerArg( withdrawScriptsToExec )
                else throw new BasePlutsError(
                    "unrecoignized redeemer tag " + tag
                )
            }

            fee = minFee +
                ((totExBudget.mem * memRational.num) / memRational.den) +
                ((totExBudget.cpu * cpuRational.num) / cpuRational.den) +
                // bigint division truncates always towards 0;
                // we don't like that so we add 1n for both divisions ( + 2n )
                BigInt(2);

            if( fee === prevFee ) break; // return last transaciton

            // reset for next loop
            
            // no need to reset if there's no next loop
            if( round === maxRound - 1 ) break;

            txOuts = outs.map( txO => txO.clone() );
            txOuts.push(
                new TxOut({
                    address: changeAddress,
                    amount: Value.sub(
                        totInputValue,
                        Value.add(
                            requiredOutputValue,
                            Value.lovelaces( fee )
                        )
                    )
                })
            );

            tx = new Tx({
                ...tx,
                body: {
                    ...tx.body,
                    outputs: txOuts,
                    fee: fee
                },
                witnesses: {
                    ...tx.witnesses,
                    redeemers: rdmrs
                },
                isScriptValid: _isScriptValid
            });

            _isScriptValid = true;
            totExBudget = new ExBudget({ mem: 0, cpu: 0 })
        }

        return tx;
    }

    readonly run!: TxBuilderRunner
}

export class TxBuilderRunner
{
    constructor( txBuilder: TxBuilder )
    {
        JsRuntime.assert(
            txBuilder instanceof TxBuilder,
            "invalid 'txBuilder' passed to construct a 'RunTxBuilder'"
        )
        ObjectUtils.defineReadOnlyHiddenProperty( this, "txBuilder", txBuilder )
    }
}

function ceilBigInt( n: number ): bigint
{
    return BigInt( Math.ceil( n ) );
}