import { TirExpr } from "./TirExpr";
import { Identifier } from "../../../ast/nodes/common/Identifier";
import { SourceRange } from "../../../ast/Source/SourceRange";
import { TirCallExpr } from "./TirCallExpr";
import { ITirExpr } from "./ITirExpr";
import { TirType } from "../types/TirType";
import { mergeSortedStrArrInplace } from "../../../utils/array/mergeSortedStrArrInplace";
import type { IRTerm } from "../../../IR/IRTerm";
import { ToIRTermCtx } from "./ToIRTermCtx";

export class TirPropAccessExpr
    implements ITirExpr
{
    constructor(
        public object: TirExpr,
        readonly prop: Identifier,
        readonly type: TirType,
        readonly range: SourceRange
    ) {}

    toString(): string
    {
        // const propStr = this.prop.toString();
        // if( propStr === "[object Object]" ) {
        //     console.warn("weird prop access:", this.prop);
        // }
        return `${this.object.toString()}.${this.prop.toString()}`;
    }

    clone(): TirPropAccessExpr
    {
        return new TirPropAccessExpr(
            this.object.clone(),
            this.prop.clone(),
            this.type.clone(),
            this.range.clone()
        );
    }

    deps(): string[]
    {
        const deps = this.object.deps();
        // not sure about this
        if( this.prop instanceof TirCallExpr )
        {
            mergeSortedStrArrInplace( deps, this.prop.deps() );
        }
        return deps;
    }

    get isConstant(): boolean { return false; }
    
    toIR( ctx: ToIRTermCtx ): IRTerm
    {
        throw new Error("property access cannot be translated to IR");
    }
}