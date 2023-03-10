import { BitStream } from "../../../types/bits/BitStream";
import { UPLCTerm } from "../UPLCTerm";
import { BinaryString } from "../../../types/bits/BinaryString";
import { Cloneable } from "../../../types/interfaces/Cloneable";

export class Lambda
    implements Cloneable<Lambda>
{
    static get UPLCTag(): BitStream
    {
        return BitStream.fromBinStr(
            new BinaryString( "0010" )
        );
    }
    
    public body : UPLCTerm;

    constructor( body: UPLCTerm )
    {
        this.body = body
    }

    clone(): Lambda
    {
        return new Lambda( this.body.clone() );
    }

    /* 
    // should not be here;
    // 'Lambda' should be only a data type, no methods
    // keeping as comment for future reference

    private _getReferences(): UPLCVar[]
    {
        if( this._references === undefined )
        {
            function _getVarsWithDebruijnInTerm( n: bigint, term: UPLCTerm ): UPLCVar[]
            {
                if( term instanceof UPLCVar )       return (term.deBruijn.asBigInt === n) ? [ term ] : [] ;
                if( term instanceof Delay )         return _getVarsWithDebruijnInTerm( n, term.delayedTerm );
                if( term instanceof Lambda )        return _getVarsWithDebruijnInTerm( n + BigInt( 1 ), term.body );
                if( term instanceof Application )   return [ ..._getVarsWithDebruijnInTerm( n, term.funcTerm ), ..._getVarsWithDebruijnInTerm( n, term.argTerm ) ];
                if( term instanceof Force )         return _getVarsWithDebruijnInTerm( n, term.termToForce );

                // Const
                // ErrorUPLC
                // Builtin
                return [];
            }

            this._references = _getVarsWithDebruijnInTerm( BigInt( 1 ), this._body );
        }

        return this._references;
    }
    */
}