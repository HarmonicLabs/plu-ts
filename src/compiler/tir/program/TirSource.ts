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
     * ( stdScope <- preambleScope <- imports <- topLevel ) 
    **/
    readonly scope: Scope;
    /**
     * ( stdScope <- preambleScope <- imports ) 
    **/
    get importsScope(): Scope {
        return this.scope.parent!;
    }

    readonly importedInternalPaths: Set<InternalPath> = new Set();
    /**
     * all the *exported* values (to be used with `scope`)
    **/
    readonly exportedValueNames: Set<string> = new Set();
    /**
     * all the *exported* types (to be used with `scope`)
    **/
    readonly exportedTypeNames: Set<string> = new Set();

    readonly statements: TirStmt[] = [];

    public compiled: boolean = false;

    constructor(
        internalPath: InternalPath,
        preambleScope: Scope,
    ) {
        this.internalPath = internalPath;
        
        const importsScope = preambleScope.newChildScope({ isFunctionDeclScope: false });
        this.scope = importsScope.newChildScope({ isFunctionDeclScope: false });

        this.importedInternalPaths = new Set();
        this.exportedValueNames = new Set();
        this.exportedTypeNames = new Set();
        this.statements = [];
        this.compiled = false;
    }

    exportValue( name: string ): boolean
    {
        if( this.exportedValueNames.has(name) ) return false;
        void this.exportedValueNames.add(name);
        return true;
    }
}