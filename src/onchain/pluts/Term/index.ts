import { isCloneable } from "../../../types/interfaces/Cloneable";
import JsRuntime from "../../../utils/JsRuntime";
import UPLCTerm from "../../UPLC/UPLCTerm";
import PType from "../PType";
import { FromPType, Type } from "./Type";
import { isWellFormedType } from "./Type/utils";


export type UnTerm<T extends Term<PType>> = T extends Term<infer PT extends PType > ? PT : never;

export default class Term<A extends PType>
{
    /**
     * in most cases it will never be used
     * 
     * it's solely purpose is to allow typescript to rise errors (at type level)
     * when the type arguments don't match
     */
    protected _pInstance?: A;
    get pInstance(): A | undefined
    {
        if( this._pInstance === undefined ) return undefined;
        return isCloneable( this._pInstance ) ? 
            this._pInstance.clone() : 
            this._pInstance;
    }

    protected _type: FromPType<A>;
    get type(): FromPType<A> { return this._type };

    protected _toUPLC: ( deBruijnLevel: bigint ) => UPLCTerm
    get toUPLC(): ( deBruijnLevel: bigint | number ) => UPLCTerm
    {
        return ( deBruijnLevel: bigint | number ) =>
        {
            if( typeof deBruijnLevel !== "bigint" ) deBruijnLevel = BigInt( deBruijnLevel );
            return this._toUPLC( deBruijnLevel );
        } 
    };

    constructor( type: FromPType<A> , toUPLC: ( dbn: bigint ) => UPLCTerm )
    {
        JsRuntime.assert(
            isWellFormedType( type ),
            "invalid type constructing Term: " + type
        );

        this._type = type;
        this._toUPLC = toUPLC;
    }
}
