import { BlueprintPreamble, BlueprintValidator, DataSchema } from "./types";


export function getBlueprint(
    $id: string,
    _preamble: BlueprintPreamble,
    _validators: BlueprintValidator[],
    _definitions: DataSchema[] = []
)
{
    if(!Array.isArray(_validators) || _validators.every( v => typeof v === "object" ))
    {
        throw new Error("unexpected validator descriptor")
    }

    if( !Array.isArray(_definitions) ) _definitions = [];

    return {
        $schema: "https://cips.cardano.org/cips/cip57/schemas/plutus-blueprint.json",
        $id: $id.toString(),
        $vocabulary: {
          "https://json-schema.org/draft/2020-12/vocab/core": true,
          "https://json-schema.org/draft/2020-12/vocab/applicator": true,
          "https://json-schema.org/draft/2020-12/vocab/validation": true,
          "https://cips.cardano.org/cips/cip57": true
        },
      
        preamble: {
            title: _preamble.title.toString(),
            description: _preamble.description === undefined ? undefined : _preamble.description.toString(),
            version:
                Array.isArray(_preamble.version) &&
                _preamble.version.every( n => Number.isSafeInteger(n) && n >= 0 ) ? 
                    _preamble.version.join(".") :
                    undefined,
            plutusVersion: _preamble.plutusVersion === undefined ? undefined :
                _preamble.plutusVersion === "PlutusScriptV1" ? "v1" :
                _preamble.plutusVersion === "PlutusScriptV2" ? "v2" :
                undefined,
            license: typeof _preamble.license === "string" ? _preamble.license : undefined
        },

        validators: _validators,

        definitions: _definitions.length > 0 ? _definitions : undefined
    };
}