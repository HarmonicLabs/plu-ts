import Cloneable from "../../types/interfaces/Cloneable";
import Integer from "../../types/ints/Integer";
import { PureUPLCTerm } from "../UPLC/UPLCTerm";
import { eqCEKValue } from "./CEKValue";

export default class CEKEnv
    implements Cloneable<CEKEnv>
{
    private _env: PureUPLCTerm[];

    constructor( init: PureUPLCTerm[] = [] )
    {
        this._env = init;
    }

    clone(): CEKEnv
    {
        return new CEKEnv( this._env.map( uplc => uplc.clone() ) )
    }

    push( varValue: PureUPLCTerm ): void
    {
        this._env.push( varValue );
    }

    pop(): PureUPLCTerm | undefined
    {
        return this._env.pop();
    }

    get( dbn: number | bigint | Integer ): PureUPLCTerm | undefined
    {
        const _dbn: number = 
            dbn instanceof Integer ? Number( dbn.asBigInt ) :
            typeof dbn === "bigint" ? Number( dbn ):
            dbn;
        if( (this._env.length - _dbn) < 1 ) return undefined;
        return this._env[ this._env.length - 1 - _dbn ].clone();
    }

    static eq( a: CEKEnv, b: CEKEnv ): boolean
    {
        if(!(
            a instanceof CEKEnv ||
            b instanceof CEKEnv
        )) return false;
    
        if( a === b ) return true; // shallow eq

        return (
            a._env.length === b._env.length &&
            a._env.every(( v,i ) => eqCEKValue( v, b._env[i] ) )
        );
    }
}