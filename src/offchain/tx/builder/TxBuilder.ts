import type { NetworkT } from "../../Network";
import ProtocolParamters, { isProtocolParameters } from "../../ledger/protocol/ProtocolParameters";
import Tx from "../Tx";
import ITxBuildArgs from "./txBuild/ITxBuildArgs";
import JsRuntime from "../../../utils/JsRuntime";
import ObjectUtils from "../../../utils/ObjectUtils";
import TxIn from "../body/TxIn";
import { txBuildOutToTxOut } from "./txBuild/ITxBuildOutput";
import TxOut from "../body/output/TxOut";
import Value from "../../ledger/Value/Value";
import { forceBigUInt } from "../../../types/ints/Integer";
import Script, { ScriptType } from "../../script/Script";
import TxRedeemer, { TxRedeemerTag } from "../TxWitnessSet/TxRedeemer";
import BasePlutsError from "../../../errors/BasePlutsError";
import TxOutRef from "../body/output/TxOutRef";
import VKeyWitness from "../TxWitnessSet/VKeyWitness/VKeyWitness";
import Data, { isData } from "../../../types/Data";
import BootstrapWitness from "../TxWitnessSet/BootstrapWitness";
import CanBeData, { forceData } from "../../CanBeData/CanBeData";
import Machine, { machineVersionV1, machineVersionV2 } from "../../../onchain/CEK/Machine";
import { isCostModelsV1, isCostModelsV2 } from "../../ledger/CostModels";
import ExBudget from "../../../onchain/CEK/Machine/ExBudget";
import AuxiliaryData from "../AuxiliaryData/AuxiliaryData";
import Hash32 from "../../hashes/Hash32/Hash32";
import TxWithdrawals from "../../ledger/TxWithdrawals";
import BufferUtils from "../../../utils/BufferUtils";
import CborString from "../../../cbor/CborString";

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
            "invlaid 'network' argument while constructing a 'TxBuilder' instance"
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
                get: () =>  new RunTxBuilder( this ),
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
        const costs = cekVersion === machineVersionV2 ? costmdls.PlutusV2 : costmdls.PlutusV1;

        if( cekVersion !== "none" )
        ObjectUtils.definePropertyIfNotPresent(
            this,
            "cek",
            {
                // define as getter so that it can be reused without messing around things
                get: () =>  new Machine(
                    cekVersion,
                    costs!
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
            forceBigUInt( this.protocolParamters.minfeeA ) *
            BigInt( (tx instanceof Tx ? tx.toCbor() : tx ).asBytes.length ) +
            forceBigUInt( this.protocolParamters.minfeeB )
        );
    }

    execScripts( tx: Tx, onlyIndexes?: number[] ): { redeemers: TxRedeemer[], isScriptValid: boolean }
    {
        const cek: Machine = (this as any).cek;

        if( !(cek instanceof Machine) )
        throw new BasePlutsError(
            "protocol paramteres passed to the 'TxBuilder' instance are missing scripts cost models"
        );

        let isScriptValid = true;

        const txRdmrs = tx.witnesses.redeemers;
        if( txRdmrs === undefined ) return { isScriptValid, redeemers: [] };

        const redeemers: TxRedeemer[] = new Array( txRdmrs.length );
        
        const txDatums = tx.witnesses.datums;

        for( let i = 0; i < txRdmrs.length; i++ )
        {
            cek.eval()
        }

        return { redeemers, isScriptValid };
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
    }: ITxBuildArgs): Tx
    {
        const cek: Machine = (this as any).cek;
        const canUseCEK: boolean = cek !== undefined;

        const inputValues: Value[] = new Array( inputs.length );// inputs.map( i => i.utxo.resolved.amount );
        const refIns: TxOutRef[] | undefined = readonlyRefInputs?.slice();

        const outs = outputs?.map( txBuildOutToTxOut ) ?? [];
        const outputValues = outs.map( out => out.amount );

        const undef: undefined = void 0;

        const vkeyWitnesses: VKeyWitness[] = [];
        const nativeScriptsWitnesses: Script<ScriptType.NativeScript>[] = [];
        const bootstrapWitnesses: BootstrapWitness[] = [];
        const plutusV1ScriptsWitnesses: Script<ScriptType.PlutusV1>[] = [];
        const datums: Data[] = []
        const dummyExecBudget = new ExBudget({ mem: 0, cpu: 0 });
        const plutusV2ScriptsWitnesses: Script<ScriptType.PlutusV2>[] = [];
        
        const spendRedeemers: TxRedeemer[] = [];
        const mintRedeemers: TxRedeemer[] = [];
        const certRedeemers: TxRedeemer[] = [];
        const withdrawRedeemers: TxRedeemer[] = [];

        function pushWitScript( script : Script ): void
        {
            const t = script.type;
            
            if( t === ScriptType.NativeScript  )     nativeScriptsWitnesses  .push( script as any );
            else if( t === ScriptType.PlutusV1 )     plutusV1ScriptsWitnesses.push( script as any );
            else if( t === ScriptType.PlutusV2 )     plutusV2ScriptsWitnesses.push( script as any );
        }

        function checkScriptAndPushIfInline( script: { inline: Script } | { ref: TxOutRef } ): void
        {
            if( ObjectUtils.hasOwn( script, "inline" ) )
            {
                if( ObjectUtils.hasOwn( script, "ref" ) )
                throw new BasePlutsError(
                    "multiple scripts specified"
                );

                pushWitScript( script.inline );
            }
            if( ObjectUtils.hasOwn( script, "ref" ) )
            {
                if( ObjectUtils.hasOwn( script, "inline" ) )
                throw new BasePlutsError(
                    "multiple scripts specified"
                );

                if( script.ref.resolved.refScript === (void 0) )
                throw new BasePlutsError(
                    "script was specified to be a reference script " +
                    "but the provided utxo is missing any attached script"
                );
            }
        }

        function pushWitDatum(
            datum: CanBeData | "inline",
            inlineDatum: CanBeData | Hash32 | undefined
        ): void
        {
            if( datum === "inline" )
            {
                if( !isData( inlineDatum ) )
                throw new BasePlutsError(
                    "datum was specified to be inline; but inline datum is missing"
                );

                // no need to push to witnesses
            }
            else
            {
                // add datum to witnesses
                // the node finds it trough the datum hash (on the utxo)
                datums.push( forceData( datum ) )
            }
        }

        let isScriptValid: boolean = true;

        const _inputs = inputs.map( ({
            utxo,
            referenceScriptV2,
            inputScript
        }, i) => {
            
            inputValues[ i ] = utxo.resolved.amount;

            if( referenceScriptV2 !== undefined )
            {
                if( inputScript !== undefined )
                throw new BasePlutsError(
                    "invalid input; multiple scripts specified"
                );

                if( !canUseCEK )
                throw new BasePlutsError(
                    "unable to construct transaction including scripts " +
                    "if the protocol params are missing the script evaluation costs"
                );

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

                refIns?.push( refUtxo );

                pushWitDatum( datum, utxo.resolved.datum );

                spendRedeemers.push(new TxRedeemer({
                    data: forceData( redeemer ),
                    index: i,
                    execUnits: dummyExecBudget.clone(),
                    tag: TxRedeemerTag.Spend
                }));
                
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

                pushWitDatum( datum, utxo.resolved.datum ); 

                spendRedeemers.push(new TxRedeemer({
                    data: forceData( redeemer ),
                    index: i,
                    execUnits: dummyExecBudget.clone(),
                    tag: TxRedeemerTag.Spend
                }));
                
            }

            return new TxIn( utxo )
        }) as [TxIn, ...TxIn[]];
        
        // good luck spending more than 4294.967295 ADA in fees
        // also 16.777215 ADA (3 bytes) is a lot; but CBOR only uses 2 or 4 bytes integers
        // and2 are ~0.06 ADA (too low) so go for 4;
        const dummyFee = BigInt( "0x" + "ff".repeat(4) );

        // TODO: to clone properly (elements too)
        const dummyOuts = outs.slice();

        // add dummy change address output
        dummyOuts.push(
            new TxOut({
                address: changeAddress,
                amount: Value.sub(
                    inputValues.reduce( (acc, val) => Value.add( acc, val ) ),
                    dummyOuts.reduce(
                        (acc, out) => Value.add( acc, out.amount ),
                        // remove minimum fee from input to preserve any remaining ada value
                        Value.lovelaces(
                            forceBigUInt( this.protocolParamters.minfeeA )
                        )
                    )
                )
            })
        );

        // index to be modified
        const dummyMintRedeemers: [ Hash32, TxRedeemer ][] = [];

        const _mint: Value | undefined = mints?.reduce( (accum, {
                script,
                value
            }, i ) => {

                const redeemer = script.redeemer;
                const policyId = script.policyId;

                dummyMintRedeemers.push([
                    policyId,
                    new TxRedeemer({
                        data: forceData( redeemer ),
                        index: i, // to be modified as `_mint?.map.findIndex( entry => entry.policy === script.policy )`
                        execUnits: dummyExecBudget.clone(),
                        tag: TxRedeemerTag.Mint
                    })
                ]);

                checkScriptAndPushIfInline( script );

                return Value.add( accum, value )   
            },
            Value.zero
        );

        function indexOfPolicy( policy: Hash32 ): number
        {
            return _mint?.map.findIndex( entry => entry.policy.toString() === policy.toString() ) ?? -1;
        }

        dummyMintRedeemers.forEach( ([ policy, dummyRdmr ]) => {

            mintRedeemers.push(new TxRedeemer({
                data: dummyRdmr.data,
                index: indexOfPolicy( policy ),
                execUnits: dummyRdmr.execUnits,
                tag: TxRedeemerTag.Mint
            }));

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

                checkScriptAndPushIfInline( script );
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

                checkScriptAndPushIfInline( script );
            }

            return withdrawal; 
        })

        const dummyTx = new Tx({
            body: {
                inputs: _inputs,
                outputs: dummyOuts,
                fee: dummyFee,
                mint: _mint,
                certs: _certs,
                withdrawals: _wits,
                refInputs: refIns?.map( refIn => refIn instanceof TxIn ? refIn : new TxIn( refIn ) ),
                protocolUpdate: protocolUpdateProposal,
                requiredSigners,
                collateralInputs: collaterals,
                collateralReturn:
                    collateralReturn === undef ? 
                    undef : 
                    txBuildOutToTxOut( collateralReturn ),
                totCollateral: "",
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
                auxDataHash: "",
                scriptDataHash: "",
                network: this.network
            },
            witnesses,
            auxiliaryData: metadata !== undefined? new AuxiliaryData({ metadata }) : undefined,
            isScriptValid
        });

        return new Tx({

        })
    }

    readonly run!: RunTxBuilder
}

export default TxBuilder;

export class RunTxBuilder
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