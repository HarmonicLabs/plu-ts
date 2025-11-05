import * as path from "node:path";
import * as fsp from "node:fs/promises";
import { Compiler } from "@harmoniclabs/pebble";
import { createFsIo } from "../utils/crateFsIo";
import { CliExportOptions } from "./completeExportOptions";

export async function exportPebbleFunction(opts: CliExportOptions): Promise<void> {
	const { root, entry, functionName, outDir, output, config } = opts;
	const io = createFsIo(root);

	const compiler = new Compiler(io, config);
	// Mirror test behavior: pass overrides via compile()
	await compiler.export({
		functionName,
		root,
		entry,
		outDir
	});

	if (output && output !== "./out.flat") {
		const generated = path.resolve(root, outDir, "out.flat");
		const target = path.isAbsolute(output) ? output : path.resolve(root, output);
		await fsp.mkdir(path.dirname(target), { recursive: true });
		await fsp.copyFile(generated, target);
	}
}