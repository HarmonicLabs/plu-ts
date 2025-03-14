import { StructDecl } from "../../ast/nodes/statements/declarations/StructDecl";
import { TypeAliasDecl } from "../../ast/nodes/statements/declarations/TypeAliasDecl";
import { TypeImplementsStmt } from "../../ast/nodes/statements/TypeImplementsStmt";
import { Source } from "../../ast/Source/Source";
import { DiagnosticMessage } from "../../diagnostics/DiagnosticMessage";
import { parseFile } from "../parseFile";

test("parse TxOut", () => {
    const fileName = "TxOutRef.pebble";
    const srcText = `
export struct TxOutRef {
    id: bytes,
    index: int,
}
`;
    
    let src!: Source;
    let diagnosticMessages!: DiagnosticMessage[];
    expect(() => [ src, diagnosticMessages ] = parseFile( fileName, srcText )).not.toThrow();

    expect( diagnosticMessages.length ).toBe( 0 );
});

test("parse std", () => {

    const fileName = "std.pebble";
    const srcText = preludeTypesSrc;

    let src!: Source;
    let diagnosticMessages!: DiagnosticMessage[];
    expect(() => [ src, diagnosticMessages ] = parseFile( fileName, srcText )).not.toThrow();

    expect( diagnosticMessages.length ).toBe( 0 );

    const stmts = src.statements;
    const structStmts = stmts.filter( stmt => stmt instanceof StructDecl ) as StructDecl[];
    expect( structStmts.length ).toBe( 21 );

    const aliasStmts = stmts.filter( stmt => stmt instanceof TypeAliasDecl ) as TypeAliasDecl[];
    expect( aliasStmts.length ).toBe( 9 );

    const impls = stmts.filter( stmt => stmt instanceof TypeImplementsStmt ) as TypeImplementsStmt[];
    expect( impls.length ).toBe( 2 );

    expect( stmts.length ).toBe( 32 );
})