import { Source } from "../../../../ast/Source/Source";

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

    includesInternalPath( path: string ): boolean
    {
        let req: ResolveStackNode | undefined = this;
        while( req )
        {
            if( req.dependent.absoluteProjPath === path ) return true;
            req = req.parent;
        }
        return false;
    }
    /**
     * 
     * @returns an array of paths from the last path to the first.
     */
    toArray(): string[]
    {
        const arr: string[] = [];
        let req: ResolveStackNode | undefined = this;
        while( req )
        {
            arr.push( req.dependent.absoluteProjPath );
            req = req.parent;
        }
        return arr;
    }
}