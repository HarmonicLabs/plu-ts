import Cloneable from "../../interfaces/Cloneable";
import Debug from "../../../utils/Debug";
import JsRuntime from "../../../utils/JsRuntime";

import PlutsMemoryStructError from "../../../errors/PlutsTypeError/PlutsMemoryStructError";
import { RootWord32Node, LastWord32Node, IRootWord32Node, Word32Node, BaseWord32Node } from "./Word32Node";
import Word32 from "../../ints/Word32";

/**
 * double linked list containing chunks of 4 bytes each
 * 
 */
export default class Word32List
    implements Cloneable<Word32List>
{
    private _root: RootWord32Node;
    private _last: LastWord32Node; // for insertion efficiency

    private _length: number;

    get length(): number { return this._length; };

    constructor( root: IRootWord32Node )
    {
        this._root = Word32Node.fromRootInterface(root);

        let last: BaseWord32Node = this._root;
        let length : number = 1; // root
        let curr = this._root.getNext();
        while( curr !== null )
        {
            last = curr;
            curr = curr.getNext();
            length++;
        }

        this._last = last as LastWord32Node;
        this._length = length;
    }

    toUInt8Array(): Uint8Array
    {
        const numResult : number[] = [];

        let curr: BaseWord32Node | null = this._root;
        let currWord: Uint8Array;
        while( curr !== null )
        {
            currWord = curr.getWord32().asUInt8Array() ;

            // length is 4 by definition
            for( let i = 0; i < currWord.length; i++ )
            {
                numResult.push( currWord[i] );
            }
            
            curr = curr.getNext();
        }

        return new Uint8Array( numResult );
    }

    clone(): Word32List
    {
        return new Word32List( this._root.cloneAsIWord32Node() );
    }

    private _cloneAsBaseWord32Node(): BaseWord32Node
    {
        // FIXME double clone in ```fromInterface``` and ```cloneAsIWord32Node```
        return BaseWord32Node.fromInterface( this._root.cloneAsIWord32Node() );
    }

    append( toAppend : Word32List ): void
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

            this._root.overrideNext( toAppendClone._cloneAsBaseWord32Node() )
            return;
        }
        
        // remember second last in order to cast the last to Word32Node
        const currentSecondLast = this._last.getPrev() as (Word32Node | null);
        if( currentSecondLast === null )
        {
            throw JsRuntime.makeNotSupposedToHappenError<PlutsMemoryStructError>(
                "the case in which the last element didn't had any previous shuld have been handled in the list of length one case."
            )
        }

        // removes prev so that when cloning it stops immidiately;
        this._last.overridePrev( null );
        const lastOnlyClone: Word32Node = this._last.clone() as Word32Node;

        lastOnlyClone.overrideNext( toAppendClone._cloneAsBaseWord32Node() );
        currentSecondLast.overrideNext( lastOnlyClone );

        this._length = this._length + toAppendClone.length;
        this._last = toAppendClone._last;
    }

    static concat( start: Word32List, append: Word32List ): Word32List
    {
        const result = start.clone();
        result.append( append );
        return result;
    }
}