import { GenesisInfos } from "../GenesisInfos";

/**
 * @experimental
 * @deprecated not complete in this version
 */
export interface IProvider {
    fetchGenesisInfos: () => Promise<GenesisInfos>
}