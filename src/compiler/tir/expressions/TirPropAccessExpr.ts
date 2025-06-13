import { isObject } from "@harmoniclabs/obj-utils";
import { TirExpr } from "./TirExpr";
import { Token } from "../../../tokenizer/Token";
import { Identifier } from "../../../ast/nodes/common/Identifier";
import { SourceRange } from "../../../ast/Source/SourceRange";
import { TirCallExpr } from "./TirCallExpr";
import { ITirExpr } from "./ITirExpr";
import { TirType } from "../types/TirType";
import { mergeSortedStrArrInplace } from "../../../utils/array/mergeSortedStrArrInplace";

export class TirPropAccessExpr
    implements ITirExpr
{
    constructor(
        public object: TirExpr,
        readonly prop: Identifier,
        readonly type: TirType,
        readonly range: SourceRange
    ) {}

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
}