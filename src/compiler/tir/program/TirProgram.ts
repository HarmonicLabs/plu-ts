import { TirSource } from "./TirSource";


export class TirProgram
{
    /** all the files in the program */
    readonly files: Map<string, TirSource> = new Map();
    readonly entry: string;

    constructor(
        entry: string,
    ) {
        this.files = new Map();
        this.entry = entry;
    }
}