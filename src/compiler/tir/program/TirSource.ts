import { Scope } from "../../AstCompiler/scope/Scope";
import { PebbleSym } from "../../AstCompiler/scope/symbols/PebbleSym";
import { InternalPath } from "../../path/path";
import { TirStmt } from "../statements/TirStmt";


export class TirSource
{
    readonly internalPath: InternalPath;
    /**
     * all the symbols at the top-level 
     * 
     * ( stdScope <- preambleScope <- imports ) 
    **/
    readonly scope: Scope;
    readonly importedInternalPaths: Set<InternalPath> = new Set();
    /**
     * all the *exported* symbols 
    **/
    readonly exportedSymbols: Map<string, PebbleSym> = new Map();

    readonly statements: TirStmt[] = [];

    constructor(
        internalPath: InternalPath,
        preambleScope: Scope,
    ) {
        this.internalPath = internalPath;
        this.scope = preambleScope.newChildScope({ isFunctionDeclScope: false });
        this.importedInternalPaths = new Set();
        this.exportedSymbols = new Map();
        this.statements = [];
    }
}