import { Command } from "commander";

export function defineVersionManager( program: Command ): void
{
    const version_manager = program.command("version-manager");

    version_manager.command("list")
        .description("List available pebble versions")
        .action(async () => {
            console.log("Not implemented yet");
            process.exit(0);
        });

    version_manager.command("install <version>")
        .description("Install a specific version of pebble")
        .action(async ( version: string ) => {
            console.log("Not implemented yet");
            process.exit(0);
        });

    version_manager.command("use <version>")
        .description("Install and use a specific version of pebble")
        .action(async ( version: string ) => {
            console.log("Not implemented yet");
            process.exit(0);
        });

    version_manager.command("remove-all")
        .description("Remove all installed pebble versions")
        .action(async () => {
            console.log("Not implemented yet");
            process.exit(0);
        });

    version_manager.command("select")
        .description("Select a pebble version between the already installed ones")
        .action(async () => {
            console.log("Not implemented yet");
            process.exit(0);
        });
}