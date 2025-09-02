#!/usr/bin/env node --max-old-space-size=8192

import { Command } from "commander";
import { PEBBLE_VERSION, PEBBLE_LIB_VERSION } from "./version.generated";
import { initPebbleProject } from "./init/initPebbleProject";
import { compilePebbleProject } from "./compile/compilePebbleProject";
import { completeCompileOptions } from "./compile/completeCompileOptions";

const program = new Command();

const versionOutput = (
`pebble-cli version:      ${PEBBLE_VERSION}
pebble language version: ${PEBBLE_LIB_VERSION}`
)

program
    .name("pebble")
    .description("A simple, yet rock solid, functional language with an imperative bias, targeting UPLC")
    .option("-v, --version", "show version number")
    .action(( opts ) => {
        if( opts.version )
        {
            console.log( versionOutput );
            process.exit(0);
        }
        program.help();
    });

program.command("help")
    .description("Display help for pebble commands")
    .action(() => {
        program.help();
    });

program.command("version")
    .description("Output the version number")
    .action(() => {
        console.log( versionOutput );
        process.exit(0);
    });

program.command("compile")
    .description("Compile a .pebble file to UPLC")
    .option("-c, --config <string>", "The config file path", "./pebble.config.json")
    .option("--entry <string>", "The entry file path .pebble file (used only if missing in the configuration)", "./index.pebble")
    .option("-o, --output <string>", "The output file path (used only if missing in the configuration)", "./out.flat")
    .action(async ( opts ) => {
        await compilePebbleProject( completeCompileOptions( opts ) );
    });

program.command("init")
    .description("Creates a new directory with a fresh pebble project.")
    .action( initPebbleProject );

/*
// TODO
program.command("repl");
//*/

program.parse();