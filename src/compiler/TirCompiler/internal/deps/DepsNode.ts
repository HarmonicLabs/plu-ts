
export class DepsNode {
    constructor(
        readonly parent: DepsNode | undefined,
        readonly dependent: string
    ) {}

    static entry( dependent: string ): DepsNode
    {
        return new DepsNode( undefined, dependent );
    }

    getNext( dependent: string ): DepsNode
    {
        return new DepsNode( this, dependent );
    }

    includes( elem: string ): boolean
    {
        let req: DepsNode | undefined = this;
        while( req )
        {
            if( req.dependent === elem ) return true;
            req = req.parent;
        }
        return false;
    }
    /**
     * 
     * @returns an array of hoisted names from the last to the first.
     */
    toArray(): string[]
    {
        const arr: string[] = [];
        let req: DepsNode | undefined = this;
        while( req )
        {
            arr.push( req.dependent );
            req = req.parent;
        }
        return arr;
    }
}