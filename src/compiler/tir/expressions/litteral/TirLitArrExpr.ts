import { SourceRange } from "../../../../ast/Source/SourceRange";
import { IRTerm } from "../../../../IR";
import { mergeSortedStrArrInplace } from "../../../../utils/array/mergeSortedStrArrInplace";
import { TirType } from "../../types/TirType";
import { ITirExpr } from "../ITirExpr";
import { TirExpr } from "../TirExpr";
import { ToIRTermCtx } from "../ToIRTermCtx";

export class TirLitArrExpr
    implements ITirExpr
{
    get isConstant(): boolean
    {
        return this.elems.every( elem => elem.isConstant );
    }
    
    constructor(
        readonly elems: TirExpr[],
        readonly type: TirType,
        readonly range: SourceRange,
    ) {}

    deps(): string[]
    {
        return this.elems.reduce((deps, elem) => {
            const elemDeps = elem.deps();
            mergeSortedStrArrInplace( deps, elemDeps );
            return deps;
        }, []);
    }

    toIR( ctx: ToIRTermCtx ): IRTerm
    {
        let nConstantsFromEnd = 0;
        const elems = this.elems;

        for(let i = elems.length - 1; i >= 0; i--)
        {
            if( elems[i].isConstant ) nConstantsFromEnd++;
            else break;
        }

        /**
         * if nConstantsFromEnd === 0 
         * 
         * ```ts
         * elems.slice( elems.length - nConstantsFromEnd )
         * ```
         * 
         * evalueates to ```[]```
         * 
         * which makes calling 
         * 
         * ```ts
         * pconstList( elemsT )([])
         * ```
         * 
         * equivalent to
         * 
         * ```ts
         * pnil( elemsT )
         * ```
         */
        let plist = pconstList( elemsT )( elems.slice( elems.length - nConstantsFromEnd ) );

        // all the elements where constants
        if( nConstantsFromEnd === elems.length ) return plist;

        for( let i = elems.length - nConstantsFromEnd - 1; i >= 0; i-- )
        {
            plist =
                _papp(
                    _papp(
                        pprepend( elemsT ),
                        elems[i]
                    ),
                    plist
                ) as any
        }

        return addPListMethods( plist );
    }
}