import { IRVar } from "../../../IR/IRNodes/IRVar";
import { IRSelfCall } from "../../../IR/IRNodes/IRSelfCall";

const _1n = BigInt(1);

export class ToIRTermCtx
{
    private readonly variables: string[] = [];

    // MUST BE A GETTER TO REFLECT CHANGES IN PARENT
    // DO NOT MODIFY
    private get _parentDbn(): bigint {
        return this.parent?.dbn ?? BigInt(0);
    }
    get dbn(): bigint {
        return this._parentDbn + BigInt(this.variables.length);
    }

    private _firstVariableIsRecursive: boolean = false;

    constructor(
        readonly parent: ToIRTermCtx | undefined,
        /**
         * quick access from a variable name to its context
         * used to resolve the variables in 0(1) time
         */
        private readonly variableToCtx: Map<string, ToIRTermCtx>
    ) {
        // DO NOT SET _parentDbn HERE
        // it must be a getter to reflect changes in parent
        // (parent dbn can change)
        this._firstVariableIsRecursive = false;
    }

    allVariables(): string[] {
        return (
            (this.parent?.allVariables() ?? [])
            .concat( this.variables )
        );
    }

    static root(): ToIRTermCtx {
        return new ToIRTermCtx( undefined, new Map<string, ToIRTermCtx>() );
    }

    newChild(): ToIRTermCtx {
        return new ToIRTermCtx( this, this.variableToCtx );
    }

    private localVarDbn( name: string ): bigint | undefined {
        const idx = this.variables.indexOf( name );
        if( idx < 0 ) return undefined;
        return this._parentDbn + BigInt(idx);
    }

    getVarDeclDbn( name: string ): bigint | undefined {
        const ctx = this.variableToCtx.get( name );
        if( !ctx ) return undefined;
        return ctx.localVarDbn( name );
    }

    getVarAccessDbn( name: string ): bigint | undefined {
        const declDbn = this.getVarDeclDbn( name );
        if( typeof declDbn !== "bigint" ) return undefined;
        console.log("getVarAccessDbn", {
            allVars: this.allVariables(),
            varsHere: this.variables.length,
            parentDbn: this._parentDbn,
            realParentDbn: this.parent?.dbn,
            name,
            thisDbn: this.dbn,
            declDbn,
            result: this.dbn - ( declDbn + _1n ),
        });
        return this.dbn - ( declDbn + _1n );
    }

    getVarAccessIR( name: string ): IRVar | IRSelfCall | undefined {
        const accessDbn = this.getVarAccessDbn( name );
        if( typeof accessDbn !== "bigint" ) return undefined;

        if(
            name === this.variables[0]
            && this._firstVariableIsRecursive
        ) return new IRSelfCall( accessDbn );
        
        return new IRVar( accessDbn );
    }

    defineVar( name: string ): void {
        if( this.variableToCtx.has( name ) ) {
            const ctx = this.variableToCtx.get( name )!;
            if( ctx.localVarDbn( name ) !== undefined ) {
                throw new Error(`variable '${name}' already defined in the current scope`);
            }
        }
        this.variables.push( name );
        this.variableToCtx.set( name, this );
    }
    defineRecursiveVar( name: string ): void {
        if(
            this.variables.length > 0
            || this._firstVariableIsRecursive
        ) throw new Error("recursive variable must be the first defined variable in the context");
        this.defineVar( name );
        this._firstVariableIsRecursive = true;
    }

    pushUnusedVar(): void {
        this.variables.push( "" ); // just to increment dbn
    }
}