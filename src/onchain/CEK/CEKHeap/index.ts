import BasePlutsError from "../../../errors/BasePlutsError";
import Cloneable from "../../../types/interfaces/Cloneable";
import { CEKValue, eqCEKValue } from "../CEKValue";


export default class CEKHeap
    implements Cloneable<CEKHeap>
{
    private _heap: CEKValue[];

    constructor( init: CEKValue[] = [] )
    {
        this._heap = init;
    }

    private _checkResult( value: CEKValue, idx: number ): number
    {
        if(
            ( idx < 0 || idx >= this._heap.length || idx !== Math.round( idx ) ) ||
            !eqCEKValue( value, this.get( idx ) as any )
        ) throw new BasePlutsError(`AhAh!; ${idx}`);

        return idx;
    }

    clone(): CEKHeap
    {
        console.log( "cloning heap" );
        return new CEKHeap( this._heap.map( uplc => uplc.clone() ) )
    }

    add( varValue: CEKValue ): number
    {
        const alreadyPresent = this._heap.findIndex(
            ( heapValue ) => eqCEKValue( heapValue, varValue )
        );
        if( alreadyPresent < 0 )
        {
<<<<<<< HEAD
            this._heap.push( Object.freeze( varValue ) );
            return this._heap.length - 1;
=======
            this._heap.push( varValue );
            return this._checkResult( varValue, this._heap.length - 1 );
>>>>>>> parent of 1067d89... can't clone ScriptContext Data; RangeError: Maximum call stack size exceeded
        }
        return this._checkResult( varValue, alreadyPresent );
    }

    get( idx: number ): CEKValue | undefined
    {
        if( idx < 0 || idx >= this._heap.length || idx !== Math.round( idx ) ) return undefined;
        return this._heap[ idx ].clone();
    }
}