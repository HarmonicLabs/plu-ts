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

    }

    async build( args: ITxBuildArgs ): Promise<Tx>
    {

    }
}

export default TxBuilder;