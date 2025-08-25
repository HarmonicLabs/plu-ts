import { Data } from "@harmoniclabs/plutus-data";
import { Machine, CEKConst, CEKError } from "@harmoniclabs/plutus-machine";
import { UPLCTerm, showUPLC } from "@harmoniclabs/uplc";
import { SourceRange } from "../../../../ast/Source/SourceRange";
import { compileIRToUPLC, IRConst, IRConstValue, IRNative, IRTerm } from "../../../../IR";
import { pconstList, pprepend, addPListMethods } from "../../../../pluts";
import { _papp } from "../../../../pluts/lib/std/data/conversion/minimal_common";
import { mergeSortedStrArrInplace } from "../../../../utils/array/mergeSortedStrArrInplace";
import { TirType } from "../../types/TirType";
import { ITirExpr } from "../ITirExpr";
import { TirExpr } from "../TirExpr";
import { ToIRTermCtx } from "../ToIRTermCtx";
import { getListTypeArg } from "../../types/utils/getListTypeArg";
import { getUnaliased } from "../../types/utils/getUnaliased";
import { TirCallExpr } from "../TirCallExpr";
import { TirNativeFuncExpr } from "../TirNativeFuncExpr";
import { TirListT } from "../../types/TirNativeType";
import { _ir_apps } from "../../../../IR/tree_utils/_ir_apps";

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
        const elemsT = getListTypeArg( getUnaliased( this.type ) )!;

        if( !elemsT ) throw new Error("invalid type for list");

        for(let i = elems.length - 1; i >= 0; i--)
        {
            if( elems[i].isConstant ) nConstantsFromEnd++;
            else break;
        }

        let list: IRTerm = constantList( elems.slice( elems.length - nConstantsFromEnd ), elemsT, ctx ); 

        // all the elements where constants
        if( nConstantsFromEnd === elems.length ) return list;

        for( let i = elems.length - nConstantsFromEnd - 1; i >= 0; i-- )
        {
            list = _ir_apps(
                IRNative.mkCons,
                elems[i].toIR( ctx ),
                list
            );
        }

        return list;
    }
}

function constantList( elems: TirExpr[], elemsT: TirType, ctx: ToIRTermCtx ): IRConst
{
    return IRConst.listOf( elemsT )(
        elems.map(
            el => {
                let res = Machine.evalSimple(
                    compileIRToUPLC( el.toIR( ctx ) )
                );

                if(!(
                    res instanceof CEKConst
                    // || res instanceof CEKError
                )) throw new Error("invalid constant");

                return res.value as IRConstValue;
            }
        )
    )
}