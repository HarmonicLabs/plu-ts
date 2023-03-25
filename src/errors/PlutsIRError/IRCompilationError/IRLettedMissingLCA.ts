import { toHex } from "@harmoniclabs/uint8array-utils";
import { IRCompilationError } from ".";
import { IRLetted } from "../../../onchain/IR/IRNodes/IRLetted";

export class IRLettedMissingLCA extends IRCompilationError
{
    constructor( letted: IRLetted, msg?: string )
    {
        super(
            `'IRLetted' with hash ${toHex( letted.hash )} has no lowest common anchestor between nodes; ` +
            (typeof msg === "string" ? msg : "")
        );
    }
}