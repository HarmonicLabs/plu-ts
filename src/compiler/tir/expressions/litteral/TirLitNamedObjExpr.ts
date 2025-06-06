import { Identifier } from "../../../../ast/nodes/common/Identifier";
import { ITirExpr } from "../ITirExpr";
import { SourceRange } from "../../../../ast/Source/SourceRange";
import { TirExpr } from "../TirExpr";
import { ITirLitObjExpr } from "./TirLitObjExpr";
import { TirType } from "../../types/TirType";
import { mergeSortedStrArrInplace } from "../../../../utils/array/mergeSortedStrArrInplace";

export class TirLitNamedObjExpr
    implements ITirExpr, ITirLitObjExpr
{
    constructor(
        readonly name: Identifier,
        readonly fieldNames: Identifier[],
        readonly values: TirExpr[],
        readonly type: TirType,
        readonly range: SourceRange
    ) {}

    deps(): string[]
    {
        return this.values.reduce((deps, value) => {
            const valueDeps = value.deps();
            mergeSortedStrArrInplace( deps, valueDeps );
            return deps;
        }, []);
    }
}