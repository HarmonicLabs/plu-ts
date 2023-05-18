import { UTxO } from "@harmoniclabs/cardano-ledger-ts";
import { CanResolveToUTxO } from "../CanResolveToUTxO/CanResolveToUTxO";
import { GenesisInfos } from "../GenesisInfos";


export interface IProvider {
    getGenesisInfos: () => Promise<GenesisInfos>
    resolveUtxos: ( utxos: CanResolveToUTxO[] ) => Promise<UTxO[]>
}