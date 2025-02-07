import { defaultOptions } from "../../../IR/toUPLC/CompilerOptions";
import { createMemoryCompilerIoApi } from "../../io/CompilerIoApi";
import { AstCompiler } from "../AstCompiler";

const aSrc =
`import { b } from "./b";
import { c } from "./c";

const a = b + c;`;

const bSrc = 
`import { d } from "./d";

export const b = d + 1;`;

const cSrc = 
`import { d } from "./d";

export const c = d + 2;`;

const dSrc = 
`import { e } from "./e";

export const d = e + 3;`;

const eSrc =
`import { f } from "./f";
import { g } from "./g";

export const e = f + g;`;

const fSrc =
`import { g } from "./g";
import { d } from "./d";

export const f = g + 4;

export const otherThing = d + 5;`;

const gSrc =
`export const g = 5;`;

const complier = new AstCompiler(
    defaultOptions,
    createMemoryCompilerIoApi({
        sources: new Map([
            ["a.pebble", aSrc],
            ["b.pebble", bSrc],
            ["c.pebble", cSrc],
            ["d.pebble", dSrc],
            ["e.pebble", eSrc],
            ["f.pebble", fSrc],
            ["g.pebble", gSrc],
        ]),
        useConsoleAsOutput: true,
    }),
);

test("checkCircularDependencies", async () => {
    const diagnostics = await complier.checkCircularDependencies("a.pebble");

    expect( diagnostics.length )
    // at least the 3 files in the cycle
    .toBeGreaterThanOrEqual( 3 );

    expect( diagnostics.length )
    // but we also signal it in the first import
    // so in reality we expect 4
    .toEqual( 4 );
});