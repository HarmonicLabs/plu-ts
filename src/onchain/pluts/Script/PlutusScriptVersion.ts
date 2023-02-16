
export const enum PlutusScriptVersion {
    V1 = "PlutusScriptV1",
    V2 = "PlutusScriptV2"
};

export interface ScriptJsonFormat<V extends PlutusScriptVersion = PlutusScriptVersion> {
    type: V,
    description: string,
    cborHex: string
}