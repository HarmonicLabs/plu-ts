import { toHex } from "@harmoniclabs/uint8array-utils";
import { PlutusScriptType } from "../../../utils/PlutusScriptType";
import { PType } from "../../PType";
import { Term } from "../../Term";
import { LitteralPurpose } from "../LitteralPurpose";
import { getFnTypes } from "../Parametrized/getFnTypes";
import { compile } from "../compile";
import { toDataSchema, toDataSchemaAsData } from "./toDataSchema";
import { BlueprintValidator, CompiledBlueprintValidator } from "./types";
import { blake2b_224 } from "@harmoniclabs/crypto";
import { Cbor, CborBytes } from "@harmoniclabs/cbor";

export function toBlueprintValidator(
    title: string,
    purpose: LitteralPurpose,
    validator: Term<PType>,
    plutusVersion: PlutusScriptType = "PlutusScriptV2"
): BlueprintValidator
{
    const t = validator.type;
    
    const tys = getFnTypes( t );

    const len = tys.length;

    const outT = tys[ len - 1 ][0];

    const isSpend = purpose === "spend";

    if( (isSpend && len < 4) || len < 3 ) throw new Error("invalid term to be a validator");

    const paramsTys = isSpend ? tys.slice( 0, len - 4 ) : tys.slice( 0, len - 3 );

    const argsTys = isSpend ? tys.slice( len - 4, len - 1 ) : tys.slice( len - 3, len - 1 );

    const purposes  = [ purpose ];

    const compiled = compile( validator );

    const result: CompiledBlueprintValidator = {
        title,
        redeemer: {
            purposes,
            schema: toDataSchemaAsData( isSpend ? argsTys[1] : argsTys[0] )
        },
        compiledCode: toHex( compiled ),
        hash: toHex(
            blake2b_224(
                new Uint8Array([
                    plutusVersion === "PlutusScriptV2" ? 0x02 : 0x01,
                    ...Cbor.encode(
                        new CborBytes( compiled )
                    ).toBuffer()
                ])
            )
        )
    };

    if( isSpend )
    {
        result.datum = {
            purposes,
            schema: toDataSchemaAsData( argsTys[0] )
        }
    }

    if( paramsTys.length > 0 )
    {
        result.parameters = paramsTys
        .map( t => 
            ({
                purposes,
                schema: toDataSchema( t )
            })
        )
    }
    // else no params
    
    return result;
}