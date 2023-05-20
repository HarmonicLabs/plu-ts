import { Address, AddressStr, Hash32, ProtocolParamters, UTxO } from "@harmoniclabs/cardano-ledger-ts";
import { CanResolveToUTxO } from "../CanResolveToUTxO/CanResolveToUTxO";
import { GenesisInfos } from "../GenesisInfos";
import { CanBeData } from "../../utils/CanBeData";

export interface IGetGenesisInfos {
    getGenesisInfos: () => Promise<GenesisInfos>
}

export interface IGetProtocolParameters {
    getProtocolParameters: () => Promise<ProtocolParamters>
}

export interface IResolveUTxOs {
    resolveUtxos: ( utxos: CanResolveToUTxO[] ) => Promise<UTxO[]>,
}

export interface IResolveDatumHashes {
    resolveDatumHashes: ( hashes: Hash32[] ) => Promise<{ hash: string, datum: CanBeData }[]>
}

export interface ISubmitTx {
    /**
     * 
     * @param {string} txCBOR hex encoded CBOR value\
     * @returns {string} hash of the submitted transaction
     */
    submitTx: ( txCBOR: string ) => Promise<string> 
}

export interface ISignTx {
    /**
     * 
     * @param {string} txCBOR hex encoded CBOR value
     * @returns {string} hex encoded CBOR for a `TxWitnessSet` value according to the cardano-ledger CDDL (eg. valid input for `TxWitnessSet.fromCbor`)
     */
    signTx: ( txCBOR: string ) => Promise<string> 
}

export interface IGetChangeAddress {
    getChangeAddress: () => Promise<AddressStr>
}

export interface ITxRunnerProvider extends
    IGetGenesisInfos,
    IResolveUTxOs,
    IResolveDatumHashes,
    Partial<IGetChangeAddress>
{}

export interface IProvider extends
    IGetGenesisInfos,
    IGetProtocolParameters,
    IResolveUTxOs, 
    IResolveDatumHashes, 
    ISubmitTx,
    ISignTx,
    Partial<IGetChangeAddress>
{}