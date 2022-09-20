import Integer from "../../types/ints/Integer";
import { PureUPLCTerm } from "../UPLC/UPLCTerm";

export default class CEKEnv
{
    private _env: PureUPLCTerm[];

    constructor()
    {
        this._env = [];
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
        return this._env[ this._env.length - 1 - _dbn ];
    }
}