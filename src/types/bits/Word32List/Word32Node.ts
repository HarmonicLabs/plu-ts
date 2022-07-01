import PlutsMemoryStructError from "../../../errors/PlutsTypeError/PlutsMemoryStructError"
import JsRuntime from "../../../utils/JsRuntime"
import Cloneable from "../../interfaces/Cloneable"
import Word32 from "../../ints/Word32"



export interface IWord32Node
{
    chunk: Word32
    prev: BaseWord32Node | null
    next: BaseWord32Node | null
}

interface CheckNext
{
    getNext(): BaseWord32Node | null

    hasNext(): boolean
}

interface HasNext extends CheckNext
{
    setNextIfNull( next: BaseWord32Node | null ): void

    overrideNext( next: BaseWord32Node | null ): void
}

interface CheckPrev
{
    getPrev(): BaseWord32Node | null
    
    hasPrev(): boolean
}

interface HasPrev extends CheckPrev
{
    setPrevIfNull( prev: BaseWord32Node | null ): void

    overridePrev( prev: BaseWord32Node | null ): void
}

export class BaseWord32Node
    implements Cloneable<BaseWord32Node>, CheckNext, CheckPrev
{
    protected _chunk: Word32;
    protected _prev: BaseWord32Node | null;
    protected _next: BaseWord32Node | null;
    
    protected constructor( chunkNode: IWord32Node )
    {
        this._chunk = chunkNode.chunk;
        this._prev = chunkNode.prev
        this._next = chunkNode.next;
    }

    static fromInterface( chunkNode: IWord32Node )
    {
        return new BaseWord32Node({
            chunk: chunkNode.chunk.clone(),
            prev: chunkNode.prev === null ? null : chunkNode.prev.clone(),
            next: chunkNode.next === null ? null : chunkNode.next.clone()
        });
    }

    static fromRootInterface( chunkNode: IRootWord32Node ) : RootWord32Node
    {
        return RootWord32Node.fromRootInterface( chunkNode );
    }

    getWord32(): Word32
    {
        return this._chunk;
    }

    getPrev(): BaseWord32Node | null
    {
        return this._prev;
    }

    hasPrev(): boolean
    {
        return this._prev !== null;
    }

    getNext(): BaseWord32Node | null
    {
        return this._next;
    }

    hasNext(): boolean
    {
        return this._next !== null;
    }

    cloneAsIWord32Node() : IWord32Node
    {
        return {
            chunk: this._chunk.clone(),
            prev: this._prev === null ? null : this._prev.clone(),
            next: this._next === null ? null : this._next.clone()
        };
    }

    clone() : BaseWord32Node
    {
        return new BaseWord32Node( this.cloneAsIWord32Node() )
    }
}

export class Word32Node extends BaseWord32Node
    implements HasPrev, HasNext
{
    private constructor( chunkNode: IWord32Node )
    {
        super(chunkNode);
    }

    setPrevIfNull( prev: BaseWord32Node ): void
    {
        if( this._prev === null )
        {
            this.overridePrev( prev );
        }
    }

    overridePrev( prev: BaseWord32Node ): void
    {
        if(prev === null)
        {
            this._prev = prev;
            return;
        }

        // ignore any next if present, cast to ```LastWord32Node```
        const newPrevClone = prev.clone() as Word32Node;
        
        // cast allows to access the _next private property
        newPrevClone._next = this;
        this._prev = newPrevClone;

    }

    setNextIfNull( next: BaseWord32Node ): void
    {
        if( this._next === null )
        {
            this.overrideNext( next );
        }
    }

    overrideNext( next: BaseWord32Node ): void
    {
        if(next === null)
        {
            this._next = next;
            return;
        }

        // ignore any next if present, cast to ```LastWord32Node```
        const newNextClone = next.clone() as Word32Node;
        
        // cast allows to access the _next private property
        newNextClone._prev = this;
        this._next = newNextClone;

    }
}

export interface IRootWord32Node
{
    chunk: Word32
    prev: null
    next: BaseWord32Node | null
}

export class RootWord32Node extends BaseWord32Node
    implements HasNext
{
    private constructor( rootWord32Node : IRootWord32Node )
    {
        JsRuntime.assert( 
            rootWord32Node.prev === null ,
            JsRuntime.makeNotSupposedToHappenError<PlutsMemoryStructError>(
                "trying to construct a RootWord32Node with a node that has a prev reference."
            )
        );

        super( rootWord32Node );
    }

    static fromRootInterface( chunkNode: IRootWord32Node )
    {
        return new RootWord32Node({
            chunk: chunkNode.chunk.clone(),
            prev: null,
            next: chunkNode.next === null ? null : chunkNode.next.clone()
        });
    }

    cloneAsIWord32Node() : IRootWord32Node
    {
        return {
            chunk: this._chunk.clone(),
            prev: null,
            next: this._next === null ? null : this._next.clone()
        };
    }

    setNextIfNull( next: BaseWord32Node | null ): void
    {
        if( this._next === null )
        {
            this.overrideNext( next );
        }
    }

    overrideNext( next: BaseWord32Node | null ): void
    {
        if(next === null)
        {
            this._next = next;
            return;
        }

        // ignore any next if present, cast to ```LastWord32Node```
        const newNextClone = next.clone() as RootWord32Node;
        
        // cast allows to access the _next private property
        newNextClone._prev = this;
        this._next = newNextClone;

    }
}

export interface ILastWord32Node
{
    chunk: Word32
    prev: BaseWord32Node | null
    next: null
}

export class LastWord32Node extends BaseWord32Node
    implements HasPrev
{

    private constructor( lastWord32Node: ILastWord32Node )
    {
        JsRuntime.assert( 
            lastWord32Node.next === null ,
            JsRuntime.makeNotSupposedToHappenError<PlutsMemoryStructError>(
                "trying to construct a RootWord32Node with a node that has a prev reference."
            )
        );
        super( lastWord32Node );
    }

    setPrevIfNull( prev: BaseWord32Node | null ): void
    {
        if( this._prev === null )
        {
            this.overridePrev( prev );
        }
    }

    overridePrev( prev: BaseWord32Node | null ): void
    {
        if(prev === null)
        {
            this._prev = prev;
            return;
        }

        // ignore any next if present, cast to ```LastWord32Node```
        const newPrevClone = prev.clone() as LastWord32Node;
        
        // cast allows to access the _next private property
        newPrevClone._next = this;
        this._prev = newPrevClone;

    }
}