import Cloneable from "../../../types/interfaces/Cloneable";
import Integer from "../../../types/ints/Integer";
import { PureUPLCTerm } from "../../UPLC/UPLCTerm";
import CEKHeap from "../CEKHeap";

export default class CEKEnv
    implements Cloneable<CEKEnv>
{
    private _heapPtrs: number[];
    readonly _heapRef: CEKHeap;

    constructor( heapRef: CEKHeap, initPtrs: number[] = [] )
    {
        this._heapRef = heapRef;
        this._heapPtrs= initPtrs;
    }

    clone(): CEKEnv
    {
        return new CEKEnv( this._heapRef, this._heapPtrs.map( ptr => ptr ) );
    }

    push( varValue: PureUPLCTerm ): void
    {
        this._heapPtrs.push( this._heapRef.add( varValue ) );
    }

    get( dbn: number | bigint | Integer ): PureUPLCTerm | undefined
    {
        const _dbn: number = 
            dbn instanceof Integer ? Number( dbn.asBigInt ) :
            typeof dbn === "bigint" ? Number( dbn ):
            dbn;

        if( (this._heapPtrs.length - _dbn) < 1 ) return undefined;
        return this._heapRef.get( this._heapPtrs[ this._heapPtrs.length - 1 - _dbn ] );
    }

    static eq( a: CEKEnv, b: CEKEnv ): boolean
    {
        if(!(
            a instanceof CEKEnv ||
            b instanceof CEKEnv
        )) return false;
    
        if( a === b ) return true; // shallow eq

        return (
            a._heapRef === b._heapRef && // exact same heapRef object
            a._heapPtrs.length === b._heapPtrs.length &&
            a._heapPtrs.every( ( ptr,i ) => ptr === b._heapPtrs[ i ] )
        );
    }
}