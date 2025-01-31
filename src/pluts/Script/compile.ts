import { Cbor, CborBytes } from "@harmoniclabs/cbor";
import { UPLCEncoder, UPLCProgram, UPLCVersion } from "@harmoniclabs/uplc";
import type { PType } from "../PType";
import type { Term } from "../Term";
import { defaultVersion, getValidVersion } from "./getValidVersion";
import { PlutusScriptJsonFormat, PlutusScriptType } from "../../utils/PlutusScriptType";


export function compile( term: Term<PType>, version: Readonly<[number, number, number]> = defaultVersion ): Uint8Array
{
    const v = getValidVersion( version );

    return UPLCEncoder.compile(
        new UPLCProgram(
            new UPLCVersion( v[0], v[1], v[2] ),
            term.toUPLC( 0 )
        )
    ).toBuffer().buffer;
}

export function scriptToJsonFormat(
    compiledScript: Uint8Array, 
    plutusScriptVersion: PlutusScriptType = "PlutusScriptV2", 
    description: string = ""
): PlutusScriptJsonFormat
{
    return {
        type: plutusScriptVersion,
        description: description,
        cborHex: Cbor.encode(
            new CborBytes(
                Cbor.encode(
                    new CborBytes(
                        compiledScript
                    )
                ).toBuffer()
            )
        ).toString()
    }
}