import Cloneable from "../../interfaces/Cloneable";
import Byte from "../Byte";
import Debug from "../../../utils/Debug";
import JsRuntime from "../../../utils/JsRuntime";

import PlutsMemoryStructError from "../../../errors/PlutsTypeError/PlutsMemoryStructError";
import { BaseByteNode, RootByteNode, LastByteNode, IRootByteNode, ByteNode } from "./ByteNode";

/**
 * double linked list containing bytes
 * 
 * FIXME
 * @fixme for efficiency reasons it would be better to convert from ```ByteList``` to ```Word32List``` so that each operation operates on chunks of 4 bytes 
 */
export default class ByteList
    implements Cloneable<ByteList>
{
    private _root: RootByteNode;
    private _last: LastByteNode; // for insertion efficiency

    private _length: number;

    get length(): number { return this._length; };

    constructor( root: IRootByteNode )
    {
        this._root = ByteNode.fromRootInterface(root);

        let last: BaseByteNode = this._root;
        let length : number = 1; // root
        let curr = this._root.getNext();
        while( curr !== null )
        {
            last = curr;
            curr = curr.getNext();
            length++;
        }

        this._last = last as LastByteNode;
        this._length = length;
    }

    toUInt8Array(): Uint8Array
    {
        const numResult : number[] = [];

        let curr = this._root;
        while( curr !== null )
        {
            numResult.push( curr.getByte().asNumber )
        }

        return new Uint8Array( numResult );
    }

    clone(): ByteList
    {
        return new ByteList( this._root.cloneAsIByteNode() );
    }

    private _cloneAsBaseByteNode(): BaseByteNode
    {
        // FIXME double clone in ```fromInterface``` and ```cloneAsIByteNode```
        return BaseByteNode.fromInterface( this._root.cloneAsIByteNode() );
    }

    append( toAppend : ByteList ): void
    {
        Debug.assert<PlutsMemoryStructError>( !this._last.hasNext() , "trying to append to bad list" );

        /**
         * preserves immutability
         * 
         * required expecially for
         * ```ts
         * this._last = toAppendClone._last;
         * ```
         * at the end of the funciton
         */
        const toAppendClone = toAppend.clone();

        if( this._length === 1 )
        {
            JsRuntime.assert<PlutsMemoryStructError>(
                !( 
                    this._root.hasNext() || this._root.hasPrev() || 
                    this._last.hasNext() || this._last.hasPrev() 
                ),
                JsRuntime.makeNotSupposedToHappenError<PlutsMemoryStructError>(
                    "list of length one was found to point to other nodes."
                )
            )

            this._root.overrideNext( toAppendClone._cloneAsBaseByteNode() )
            return;
        }
        
        // remember second last in order to cast the last to ByteNode
        const currentSecondLast = this._last.getPrev() as (ByteNode | null);
        if( currentSecondLast === null )
        {
            throw JsRuntime.makeNotSupposedToHappenError<PlutsMemoryStructError>(
                "the case in which the last element didn't had any previous shuld have been handled in the list of length one case."
            )
        }

        // removes prev so that when cloning it stops immidiately;
        this._last.overridePrev( null );
        const lastOnlyClone: ByteNode = this._last.clone() as ByteNode;

        lastOnlyClone.overrideNext( toAppendClone._cloneAsBaseByteNode() );
        currentSecondLast.overrideNext( lastOnlyClone );

        this._length = this._length + toAppendClone.length;
        this._last = toAppendClone._last;
    }

    static concat( start: ByteList, append: ByteList ): ByteList
    {
        const result = start.clone();
        result.append( append );
        return result;
    }
}