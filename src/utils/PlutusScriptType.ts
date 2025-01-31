export const enum ScriptType {
    NativeScript = "NativeScript",
    PlutusV1 = "PlutusScriptV1",
    PlutusV2 = "PlutusScriptV2"
}

export type PlutusScriptType = ScriptType.PlutusV1 | ScriptType.PlutusV2 | "PlutusScriptV1" | "PlutusScriptV2"

export type LitteralScriptType = ScriptType | "NativeScript" | "PlutusScriptV1" | "PlutusScriptV2"

export interface PlutusScriptJsonFormat<T extends PlutusScriptType = PlutusScriptType> {
    type: T,
    description?: string,
    cborHex: string
}