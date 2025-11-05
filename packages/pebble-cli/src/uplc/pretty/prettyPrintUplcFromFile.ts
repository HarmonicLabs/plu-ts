import * as path from "node:path";
import * as fsp from "node:fs/promises";
import { parseUPLC, prettyUPLC } from "@harmoniclabs/uplc";

export interface CliPrettyUplcFlags {
    input: string;
    output?: string;
}

export async function prettyPrintUplcFromFile( opts: CliPrettyUplcFlags ): Promise<void> {
	const { input, output } = opts;

	const inputPath = path.resolve( input.trim() );
	const uplcBytes = await fsp.readFile( inputPath );

	const uplcProgram = parseUPLC( uplcBytes, "flat" );
	const result = "(program " + uplcProgram.version.toString() + "\n"
		+ prettyUPLC( uplcProgram.body, 2 ) + "\n)";
	
	if( !output ) {
		console.log( result );
		return;
	}

	const outputPath = path.resolve( output.trim() );
	await fsp.writeFile( outputPath, result );
}