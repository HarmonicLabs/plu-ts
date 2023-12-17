import { toHex } from "@harmoniclabs/uint8array-utils";
import { termTyToConstTy } from "../../../pluts/type_system/termTyToConstTy";
import { IRApp } from "../../IRNodes/IRApp";
import { IRConst } from "../../IRNodes/IRConst";
import { IRFunc } from "../../IRNodes/IRFunc";
import { IRHoisted } from "../../IRNodes/IRHoisted";
import { IRLetted } from "../../IRNodes/IRLetted";
import { IRNative } from "../../IRNodes/IRNative";
import { nativeTagToString } from "../../IRNodes/IRNative/IRNativeTag";
import { IRVar } from "../../IRNodes/IRVar";
import { IRTerm } from "../../IRTerm";
import { showIR } from "../../utils/showIR";
import { IRError } from "../../IRNodes/IRError";
import { IRForced } from "../../IRNodes/IRForced";
import { IRDelayed } from "../../IRNodes/IRDelayed";
import { UPLCTerm, UPLCVar, Lambda, Application, UPLCConst, Builtin, ErrorUPLC, Force, Delay } from "@harmoniclabs/uplc";

export type RawSrcMap = { [node_index: number]: string };

export function _irToUplc(
    ir: IRTerm, 
    srcmap: RawSrcMap | undefined = undefined, 
    node_index: number = 0
)
: { 
    term: UPLCTerm, 
    max_idx: number
}
{
    if( ir instanceof IRVar ) return {
        term: new UPLCVar( ir.dbn ),
        max_idx: node_index
    };

    if( ir instanceof IRFunc )
    {
        const { term: body, max_idx } = _irToUplc( ir.body, srcmap, node_index );

        let lam: Lambda = new Lambda( body );

        for( let i = 1; i < ir.arity; i++ )
        {
            lam = new Lambda( lam );
        }

        return {
            term: lam,
            max_idx
        };
    }

    if( ir instanceof IRApp )
    {
        const { term: fn, max_idx: fn_max_idx } =   _irToUplc( ir.fn , srcmap, node_index + 1 );
        const { term: arg, max_idx: arg_max_idx } = _irToUplc( ir.arg, srcmap, fn_max_idx + 1 );

        let src = ir.meta.__src__;
        if( srcmap && typeof src === "string" )
        {
            srcmap[node_index] = adaptSrcString( src );
        }

        return {
            term: new Application( fn, arg ),
            max_idx: arg_max_idx
        };
    }

    if( ir instanceof IRConst )
    {
        return {
            term: new UPLCConst(
                termTyToConstTy( ir.type ),
                ir.value as any
            ),
            max_idx: node_index
        };
    }
    if( ir instanceof IRNative )
    {
        if( ir.tag < 0 )
        throw new Error(
            "Can't translate '" + nativeTagToString( ir.tag ) + "' 'IRNative' to 'UPLCBuiltin'"
        );

        return {
            term: new Builtin( ir.tag as any ),
            max_idx: node_index
        };
    }
    if( ir instanceof IRLetted )
    {
        throw new Error(
            "Can't convert 'IRLetted' to valid UPLC"
        );
    }
    if( ir instanceof IRHoisted )
    {
        // return this.hoisted.toUPLC();
        throw new Error(
            "Can't convert 'IRHoisted' to valid UPLC;" +
            "\nhoisted hash was: " + toHex( ir.hash ) +
            "\nhoisted term was: " + showIR( ir.hoisted ).text
        );
    }
    if( ir instanceof IRError )
    {
        if( typeof ir.addInfos.__src__ === "string" && srcmap )
        {
            srcmap[node_index] = adaptSrcString( ir.addInfos.__src__ );
        }
        return {
            term: new ErrorUPLC( ir.msg, ir.addInfos ),
            max_idx: node_index
        };
    }
    if( ir instanceof IRForced )
    {
        const { term: toForce, max_idx } = _irToUplc( ir.forced, srcmap, node_index ); 
        return {
            term: new Force( toForce ),
            max_idx
        };
    }
    if( ir instanceof IRDelayed )
    {
        const { term: toDelay, max_idx } = _irToUplc( ir.delayed, srcmap, node_index );
        return {
            term: new Delay( toDelay ),
            max_idx
        };
    }

    throw new Error("unknown IR term calling '_irToUplc'")
}

function adaptSrcString( src: string ): string
{
    // "   at $ (some/path/to/src.ts:line:column)" -> "some/path/to/src.ts:line:column"
    let idx = src.indexOf("(");
    src = idx >= 0 ? src.slice( idx + 1, src.length - 1 ) : src;

    // "   at some/path/to/src.ts:line:column" -> "some/path/to/src.ts:line:column"
    idx = src.indexOf("at ");
    src = idx >= 0 ? src.slice( idx + 3 ) : src;

    return src;
}