import { SourceRange } from "../../../../ast/Source/SourceRange";
import { mergeSortedStrArrInplace } from "../../../../utils/array/mergeSortedStrArrInplace";
import { TirType } from "../../types/TirType";
import { ITirExpr } from "../ITirExpr";
import { TirExpr } from "../TirExpr";

export class TirLitArrExpr
    implements ITirExpr
{
    constructor(
        readonly elems: TirExpr[],
        readonly type: TirType,
        readonly range: SourceRange,
    ) {}

    deps(): string[]
    {
        return this.elems.reduce((deps, elem) => {
            const elemDeps = elem.deps();
            mergeSortedStrArrInplace( deps, elemDeps );
            return deps;
        }, []);
    }
}