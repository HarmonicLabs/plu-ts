import BitStream from "../../../types/bits/BitStream";
import UPLCTerm from "../UPLCTerm";
import BinaryString from "../../../types/bits/BinaryString";
import UPLCVar from "./UPLCVar";
import Delay from "./Delay";
import Application from "./Application";
import Force from "./Force";

export default class Lambda
{
    static get UPLCTag(): BitStream
    {
        return BitStream.fromBinStr(
            new BinaryString( "0010" )
        );
    }
    
    private readonly _body : UPLCTerm;
    get body(): UPLCTerm { return this._body; }


    constructor( body: UPLCTerm )
    {
        this._body = body
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

    getNReferences(): number
    {
        if( this._references === undefined )
        {
            return this._getReferences().length;
        }

        return this._references.length;
    }

    updateReferencesWithNewValue( referencedValue: UPLCTerm ): void
    {
        if( this._references === undefined )
        {
            this._getReferences();
        }

        this._references!.forEach( (uVar: UPLCVar) => { uVar.referencedTerm = referencedValue } );
    }
    */
}