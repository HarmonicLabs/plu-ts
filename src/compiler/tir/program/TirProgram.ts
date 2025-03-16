import { InternalPath } from "../../path/path";
import { TirSource } from "./TirSource";


export class TirProgram
{
    /** all the files in the program */
    readonly files: Map<InternalPath, TirSource> = new Map();
    readonly entry: InternalPath;

    constructor(
        entry: InternalPath,
    ) {
        this.files = new Map();
        this.entry = entry;
    }
}