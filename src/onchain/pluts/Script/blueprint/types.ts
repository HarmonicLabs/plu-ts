import { CanBeCborString } from "../../../../cbor/CborString"
import { PlutusScriptType } from "../../../../offchain"

export interface BlueprintPreamble {
    title: string
    description?: string
    version?: number[]
    plutusVersion?: PlutusScriptType
    license: string
}

export interface DataSchema {

}

/**
 * datums, redeemers and parameters
 */
export interface ScriptArg {
    title?: string
    description?: string
    purposes?: string[]
    schema: DataSchema
}

type MinimalBlueprintValidator = {
    title: string
    description?: string
    redeemer: any
    datum?: any
    parameters?: any[]
}

export type BlueprintValidator
    = MinimalBlueprintValidator
    | MinimalBlueprintValidator & {
        compiledCode: Uint8Array
    }
    | MinimalBlueprintValidator & {
        compiledCodeCbor: CanBeCborString
    }
