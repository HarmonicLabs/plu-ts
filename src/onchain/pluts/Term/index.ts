import UPLCTerm from "../../UPLC/UPLCTerm";
import PType from "../PType";


export default class Term<A extends PType>
{
    /**
     * this field is never instantiated in the constructor
     * 
     * in most cases it will never be used
     * 
     * it's solely purpose is to allow typescript to ries errors (at type level)
     * when the type arguments don't match
     * 
     * at javascriopt runtime there is no difference between terms
     */
    private _value?: A;

    private _toUPLC: ( deBruijnLevel: bigint ) => UPLCTerm
    get toUPLC(): ( deBruijnLevel: bigint | number ) => UPLCTerm
    {
        return ( deBruijnLevel: bigint | number ) =>
        {
            if( typeof deBruijnLevel !== "bigint" ) deBruijnLevel = BigInt( deBruijnLevel );
            return this._toUPLC( deBruijnLevel );
        } 
    };

    constructor( toUPLC: (dbn: bigint ) => UPLCTerm )
    {
        this._toUPLC = toUPLC;
    }
}
