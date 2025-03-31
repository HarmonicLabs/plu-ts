import { Source } from "../../../../ast/Source/Source";
import { Path } from "../../../path/path";

export class ResolveStackNode {
    constructor(
        readonly parent: ResolveStackNode | undefined,
        readonly dependent: Source
    ) {}

    static entry( dependent: Source ): ResolveStackNode
    {
        return new ResolveStackNode( undefined, dependent );
    }

    getNext( dependent: Source ): ResolveStackNode
    {
        return new ResolveStackNode( this, dependent );
    }

    includesInternalPath( path: Path ): boolean
    {
        let req: ResolveStackNode | undefined = this;
        while( req )
        {
            if( req.dependent.internalPath === path ) return true;
            req = req.parent;
        }
        return false;
    }
    /**
     * 
     * @returns an array of paths from the last path to the first.
     */
    toArray(): Path[]
    {
        const arr: Path[] = [];
        let req: ResolveStackNode | undefined = this;
        while( req )
        {
            arr.push( req.dependent.internalPath );
            req = req.parent;
        }
        return arr;
    }
}