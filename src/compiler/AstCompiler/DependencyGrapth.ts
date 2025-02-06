
export interface DepGraphNode {
    // name: string;
    dependencies: Set<string>;
    dependents: Set<string>;
}

export class DependencyGraph
{
    constructor() {}

    readonly map = new Map<string, DepGraphNode>();

    set( name: string, node: DepGraphNode ): void
    {
        if( !this.map.has( name ) ) this.map.set( name, node );
    }
    addDependencies( name: string, dependencies: string[] ): void
    {
        let node = this.map.get( name );
        if( !node )
        {
            node = { dependencies: new Set(), dependents: new Set() };
            this.map.set( name, node );
        }
        const deps = node.dependencies;
        for( let dep of dependencies )
        {
            deps.add( dep );
            let depNode = this.map.get( dep );
            if( !depNode )
            {
                depNode = { dependencies: new Set(), dependents: new Set() };
                this.map.set( dep, depNode );
            }
            depNode.dependents.add( name );
        }
    }    

    get( name: string ): DepGraphNode | undefined
    {
        return this.map.get( name );
    }

    has( name: string ): boolean
    {
        return this.map.has( name );
    }
}