
export const enum Network {
    mainnet = "mainnet",
    testnet = "testnet"
}

export default Network;

export type NetworkT = Network | "mainnet" | "testnet";