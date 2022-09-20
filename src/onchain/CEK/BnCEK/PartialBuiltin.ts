import UPLCTerm from "../../UPLC/UPLCTerm";
import UPLCBuiltinTag from "../../UPLC/UPLCTerms/Builtin/UPLCBuiltinTag";


export default class PartialBuiltin
{
    private _tag: UPLCBuiltinTag;
    private _args: UPLCTerm[];
    private _nRequiredArgs: number;

    get tag(): UPLCBuiltinTag { return this._tag; }
    get args(): UPLCTerm[] { return this._args; }

    constructor( tag: UPLCBuiltinTag )
    {
        this._tag = tag;
        this._args = [];
        this._nRequiredArgs = PartialBuiltin.getNRequiredArgsFor( tag );
    }

    get nMissingArgs(): number
    {
        return this._nRequiredArgs - this._args.length;
    }

    apply( arg: UPLCTerm ): void
    {
        this._args.push( arg );
    }

    /**
     * @todo
     */
    static getNRequiredArgsFor( tag: UPLCBuiltinTag ): number
    {
        if( tag === UPLCBuiltinTag.ifThenElse ) return 3;
        if( tag === UPLCBuiltinTag.equalsInteger ) return 2;
        
        return 0;
    }
}