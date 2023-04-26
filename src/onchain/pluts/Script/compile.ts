import { Cbor } from "../../../cbor/Cbor";
import { CborBytes } from "../../../cbor/CborObj/CborBytes";
import { PlutusScriptJsonFormat, PlutusScriptType } from "../../../offchain";
import { UPLCEncoder } from "../../UPLC/UPLCEncoder";
import { UPLCProgram } from "../../UPLC/UPLCProgram";
import { UPLCVersion } from "../../UPLC/UPLCProgram/UPLCVersion";
import { PType } from "../PType";
import { Term } from "../Term";
import { defaultVersion, getValidVersion } from "./getValidVersion";


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