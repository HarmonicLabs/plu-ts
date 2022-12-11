import type { NetworkT } from "../../Network";
import ProtocolParamters, { isProtocolParameters } from "../../ledger/protocol/ProtocolParameters";
import Tx from "../Tx";
import BlockchainProvider from "./BlockchainProvider";
import ITxBuildArgs from "./txBuild/ITxBuildArgs";
import JsRuntime from "../../../utils/JsRuntime";
import ObjectUtils from "../../../utils/ObjectUtils";

export class TxBuilder
{
    readonly network!: NetworkT
    readonly protocolParamters!: ProtocolParamters
    
    constructor( network: NetworkT, provider: BlockchainProvider, protocolParamters: Readonly<ProtocolParamters> )
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

        ObjectUtils.defineReadOnlyProperty( this, "run", new RunTxBuilder( this ) );
    }

    build({
        inputs,
        changeAddress,
        outputs,
        readonlyRefInputs,
        requiredSigners,
        collaterals,
        returnCollaterals,
        mints,
        invalidBefore,
        invalidAfter,
        certificates,
        withdrawals,
        metadata,
        protocolUpdateProposal
    }: ITxBuildArgs): Tx
    {
        
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