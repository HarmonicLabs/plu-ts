import * as path from "node:path";
import * as fsp from "node:fs/promises";
import { existsSync } from "node:fs";
import { CliCompileOptions } from "./completeCompileOptions";
import { Compiler, CompilerIoApi } from "@harmoniclabs/pebble";

function resolvePath(filename: string, baseDir: string): string {
	if (!filename) return baseDir;
	if (path.isAbsolute(filename)) return filename;
	return path.resolve(baseDir, filename.replace(/^\/+/, ""));
}

function createFsIo(root: string): CompilerIoApi {
    const stdout = process.stdout;
    const stderr = process.stderr;

	return {
		stdout,
		stderr,
		async readFile(filename: string, baseDir: string) {
			const full = resolvePath(filename, typeof baseDir === "string" ? baseDir : root);
			try {
				const buf = await fsp.readFile(full);
				return buf.toString("utf8");
			} catch {
				return undefined;
			}
		},
		async writeFile(filename: string, contents: Uint8Array | string, baseDir: string) {
			const full = resolvePath(filename, baseDir || root);
			await fsp.mkdir(path.dirname(full), { recursive: true });
			if (typeof contents === "string") {
				await fsp.writeFile(full, contents, "utf8");
			} else {
				await fsp.writeFile(full, Buffer.from(contents));
			}
		},
		exsistSync(filename: string) {
			const full = resolvePath(filename, root);
            const exsists = existsSync(full);
            console.log("checking exists:", full, filename, exsists );
			return existsSync(full);
		},
		async listFiles(dirname: string, baseDir: string) {
			const full = resolvePath(dirname, baseDir || root);
			try {
				const entries = await fsp.readdir(full, { withFileTypes: true });
				return entries.map(e => e.name);
			} catch {
				return undefined;
			}
		},
		reportDiagnostic(d: unknown) {
			stderr.write(String(d) + "\n");
		}
	};
}

export async function compilePebbleProject(opts: CliCompileOptions): Promise<void> {
	const { root, entry, outDir, output, config } = opts;
	const io = createFsIo(root);

	const compiler = new Compiler(io, config);
	// Mirror test behavior: pass overrides via compile()
	await compiler.compile({
		root,
		entry,
		outDir
	} as any);

	if (output && output !== "./out.flat") {
		const generated = path.resolve(root, outDir, "out.flat");
		const target = path.isAbsolute(output) ? output : path.resolve(root, output);
		await fsp.mkdir(path.dirname(target), { recursive: true });
		await fsp.copyFile(generated, target);
	}
}

export default compilePebbleProject;
