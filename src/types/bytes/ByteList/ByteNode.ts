import PlutsMemoryStructError from "../../../errors/PlutsTypeError/PlutsMemoryStructError"
import JsRuntime from "../../../utils/JsRuntime"
import Cloneable from "../../interfaces/Cloneable"
import Byte from "../Byte"


export interface IByteNode
{
    byte: Byte
    prev: BaseByteNode | null
    next: BaseByteNode | null
}

interface CheckNext
{
    getNext(): BaseByteNode | null

    hasNext(): boolean
}

interface HasNext extends CheckNext
{
    setNextIfNull( next: BaseByteNode | null ): void

    overrideNext( next: BaseByteNode | null ): void
}

interface CheckPrev
{
    getPrev(): BaseByteNode | null
    
    hasPrev(): boolean
}

interface HasPrev extends CheckPrev
{
    setPrevIfNull( prev: BaseByteNode | null ): void

    overridePrev( prev: BaseByteNode | null ): void
}

export class BaseByteNode
    implements Cloneable<BaseByteNode>, CheckNext, CheckPrev
{
    protected _byte: Byte;
    protected _prev: BaseByteNode | null;
    protected _next: BaseByteNode | null;
    
    protected constructor( byteNode: IByteNode )
    {
        this._byte = byteNode.byte;
        this._prev = byteNode.prev
        this._next = byteNode.next;
    }

    static fromInterface( byteNode: IByteNode )
    {
        return new BaseByteNode({
            byte: byteNode.byte.clone(),
            prev: byteNode.prev === null ? null : byteNode.prev.clone(),
            next: byteNode.next === null ? null : byteNode.next.clone()
        });
    }

    static fromRootInterface( byteNode: IRootByteNode ) : RootByteNode
    {
        return RootByteNode.fromRootInterface( byteNode );
    }

    getByte(): Byte
    {
        return this._byte;
    }

    getPrev(): BaseByteNode | null
    {
        return this._prev;
    }

    hasPrev(): boolean
    {
        return this._prev !== null;
    }

    getNext(): BaseByteNode | null
    {
        return this._next;
    }

    hasNext(): boolean
    {
        return this._next !== null;
    }

    cloneAsIByteNode() : IByteNode
    {
        return {
            byte: this._byte.clone(),
            prev: this._prev === null ? null : this._prev.clone(),
            next: this._next === null ? null : this._next.clone()
        };
    }

    clone() : BaseByteNode
    {
        return new BaseByteNode( this.cloneAsIByteNode() )
    }
}

export class ByteNode extends BaseByteNode
    implements HasPrev, HasNext
{
    private constructor( byteNode: IByteNode )
    {
        super(byteNode);
    }

    setPrevIfNull( prev: BaseByteNode ): void
    {
        if( this._prev === null )
        {
            this.overridePrev( prev );
        }
    }

    overridePrev( prev: BaseByteNode ): void
    {
        if(prev === null)
        {
            this._prev = prev;
            return;
        }

        // ignore any next if present, cast to ```LastByteNode```
        const newPrevClone = prev.clone() as ByteNode;
        
        // cast allows to access the _next private property
        newPrevClone._next = this;
        this._prev = newPrevClone;

    }

    setNextIfNull( next: BaseByteNode ): void
    {
        if( this._next === null )
        {
            this.overrideNext( next );
        }
    }

    overrideNext( next: BaseByteNode ): void
    {
        if(next === null)
        {
            this._next = next;
            return;
        }

        // ignore any next if present, cast to ```LastByteNode```
        const newNextClone = next.clone() as ByteNode;
        
        // cast allows to access the _next private property
        newNextClone._prev = this;
        this._next = newNextClone;

    }
}

export interface IRootByteNode
{
    byte: Byte
    prev: null
    next: BaseByteNode | null
}

export class RootByteNode extends BaseByteNode
    implements HasNext
{
    private constructor( rootByteNode : IRootByteNode )
    {
        JsRuntime.assert( 
            rootByteNode.prev === null ,
            JsRuntime.makeNotSupposedToHappenError<PlutsMemoryStructError>(
                "trying to construct a RootByteNode with a node that has a prev reference."
            )
        );

        super( rootByteNode );
    }

    static fromRootInterface( byteNode: IRootByteNode )
    {
        return new RootByteNode({
            byte: byteNode.byte.clone(),
            prev: null,
            next: byteNode.next === null ? null : byteNode.next.clone()
        });
    }

    cloneAsIByteNode() : IRootByteNode
    {
        return {
            byte: this._byte.clone(),
            prev: null,
            next: this._next === null ? null : this._next.clone()
        };
    }

    setNextIfNull( next: BaseByteNode | null ): void
    {
        if( this._next === null )
        {
            this.overrideNext( next );
        }
    }

    overrideNext( next: BaseByteNode | null ): void
    {
        if(next === null)
        {
            this._next = next;
            return;
        }

        // ignore any next if present, cast to ```LastByteNode```
        const newNextClone = next.clone() as RootByteNode;
        
        // cast allows to access the _next private property
        newNextClone._prev = this;
        this._next = newNextClone;

    }
}

export interface ILastByteNode
{
    byte: Byte
    prev: BaseByteNode | null
    next: null
}

export class LastByteNode extends BaseByteNode
    implements HasPrev
{

    private constructor( lastByteNode: ILastByteNode )
    {
        JsRuntime.assert( 
            lastByteNode.next === null ,
            JsRuntime.makeNotSupposedToHappenError<PlutsMemoryStructError>(
                "trying to construct a RootByteNode with a node that has a prev reference."
            )
        );
        super( lastByteNode );
    }

    setPrevIfNull( prev: BaseByteNode | null ): void
    {
        if( this._prev === null )
        {
            this.overridePrev( prev );
        }
    }

    overridePrev( prev: BaseByteNode | null ): void
    {
        if(prev === null)
        {
            this._prev = prev;
            return;
        }

        // ignore any next if present, cast to ```LastByteNode```
        const newPrevClone = prev.clone() as LastByteNode;
        
        // cast allows to access the _next private property
        newPrevClone._next = this;
        this._prev = newPrevClone;

    }
}