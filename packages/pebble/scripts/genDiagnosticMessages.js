import * as fs from "fs";
import * as path from "path";

const dirname = ((path) => {
    path = path.trim();
    if (path.startsWith("file:")) path = path.slice("file:".length);
    while( path.startsWith("/") ) path = path.slice(1);
    path = path.trim();
    path = "/" + path;
    while( path.endsWith("/") ) path = path.slice(0, -1).trim();
    return path.trim();
})(globalThis.__dirname ?? path.dirname(import.meta.url));

void function main() {

    const indent = "    ";

    const out = [
        `// GENERATED FILE. DO NOT EDIT.\n\n`
    ];

    out.push("/** Enum of available diagnostic codes. */\n");
    out.push("export enum DiagnosticCode {\n");

    let first = true;
    const messages = JSON.parse(
        fs.readFileSync(
            path.join(dirname, "..", "src", "diagnostics", "diagnosticMessages.json"),
            "utf8"
        )
    );
    Object.keys(messages).forEach(text => {
        let key = makeKey(text);
        if (first)
            first = false;
        else {
            out.push(",\n");
        }
        out.push(indent + key + " = " + messages[text]);
    });

    out.push("\n}\n\n");
    out.push("/** Translates a diagnostic code to its respective string. */\n");
    out.push("export function diagnosticCodeToString(code: DiagnosticCode): string {\n"+indent+"switch (code) {\n");

    Object.keys(messages).forEach(text => {
        out.push(indent+indent+"case " + messages[text] + ": return " + JSON.stringify(text) + ";\n");
    });

    out.push(indent+indent+"default: return \"\";\n"+indent+"}\n}\n");

    const generated = out.join("");
    fs.writeFileSync(path.join(dirname, "..", "src", "diagnostics", "diagnosticMessages.generated.ts"), generated);
}()

function makeKey(text) {
    return text
        .replace(/[^\w]+/g, "_") // any non-word character to underscore
        .replace(/_+$/, ""); // consecutive underscores to one
}