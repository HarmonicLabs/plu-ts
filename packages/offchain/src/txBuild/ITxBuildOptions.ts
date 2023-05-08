import { TxRedeemer } from "@harmoniclabs/cardano-ledger-ts"
import { Data } from "@harmoniclabs/plutus-data"
import { ExBudget } from "@harmoniclabs/plutus-machine"
import { PureUPLCTerm } from "@harmoniclabs/uplc"


export interface ITxBuildSyncOptions {
    onScriptInvalid?: ( rdmr: TxRedeemer, logs: string[], callArgs: Data[] ) => void
    onScriptResult?:  ( rdmr: TxRedeemer, result: PureUPLCTerm, exBudget: ExBudget, logs: string[], callArgs: Data[] ) => void
}

export interface ITxBuildOptions extends ITxBuildSyncOptions {
    keepWorkersAlive?: boolean
}