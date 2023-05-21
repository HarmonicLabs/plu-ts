import { CanBeCborString } from "@harmoniclabs/cbor"
import type { PlutusScriptType } from "../../../utils/PlutusScriptType";

export interface BlueprintPreamble {
    title: string
    description?: string
    version?: number[]
    plutusVersion?: PlutusScriptType
    license?: string
}

export type SchemaDataType
    = "integer"
    | "bytes"
    | "list"
    | "map"
    | "constructor"
    | "#unit"
    | "#boolean"
    | "#integer"
    | "#bytes"
    | "#string"
    | "#pair"
    | "#list";

export interface BaseDataSchema {
    dataType?: SchemaDataType,
    title?: string,
    description?: string,
    $comment?: string,
    allOf?: DataSchema[],
    anyOf?: DataSchema[],
    oneOf?: DataSchema[],
    not?: DataSchema
}

export interface DataSchemaBytes extends BaseDataSchema {
    dataType: "bytes",
    enum?: string[],
    maxLength?: number, 
    minLength?: number, 
}

export interface DataSchemaInts extends BaseDataSchema {
    dataType: "integer",
    multipleOf?: number,
    maximum?: number, 
    minimum?: number,
    exclusiveMaximum?: number, 
    exclusiveMinimum?: number, 
}

export interface DataSchemaList extends BaseDataSchema {
    dataType: "list" | "#list",
    items?: DataSchema | DataSchema[],
    maxItems?: number, 
    minItems?: number,
    uniqueItems?: boolean
}

export interface DataSchemaMap extends BaseDataSchema {
    dataType: "map",
    keys?: DataSchema,
    values?: DataSchema,
    maxItems?: number, 
    minItems?: number
}

export interface DataSchemaConstr extends BaseDataSchema {
    dataType: "constructor",
    index: number,
    fields: DataSchema[]
}


export type DataSchema
    = BaseDataSchema
    | DataSchemaBytes
    | DataSchemaInts
    | DataSchemaList
    | DataSchemaMap
    | DataSchemaConstr

/**
 * datums, redeemers and parameters
 */
export interface ScriptArg {
    title?: string
    description?: string
    purposes?: string[]
    schema: DataSchema
}

export type MinimalBlueprintValidator = {
    title: string
    description?: string
    redeemer: ScriptArg
    datum?: ScriptArg
    parameters?: ScriptArg[]
    hash?: string
}

export type CompiledBlueprintValidator = MinimalBlueprintValidator & {
    compiledCode: string
    hash: string
}

export type BlueprintValidator
    = MinimalBlueprintValidator
    | CompiledBlueprintValidator
