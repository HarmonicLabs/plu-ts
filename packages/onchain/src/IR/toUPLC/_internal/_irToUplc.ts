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


export function _irToUplc( ir: IRTerm ): UPLCTerm
{
    if( ir instanceof IRVar ) return new UPLCVar( ir.dbn );
    if( ir instanceof IRFunc )
    {
        let lam: Lambda = new Lambda(
            _irToUplc( ir.body )
        );

        for( let i = 1; i < ir.arity; i++ )
        {
            lam = new Lambda( lam );
        }

        return lam;
    }
    if( ir instanceof IRApp )
    {
        return new Application(
            _irToUplc( ir.fn ),
            _irToUplc( ir.arg )
        );
    }
    if( ir instanceof IRConst )
    {
        return new UPLCConst(
            termTyToConstTy( ir.type ),
            ir.value as any
        );
    }
    if( ir instanceof IRNative )
    {
        if( ir.tag < 0 )
        throw new Error(
            "Can't translate '" + nativeTagToString( ir.tag ) + "' 'IRNative' to 'UPLCBuiltin'"
        );

        return new Builtin( ir.tag as any );
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
        return new ErrorUPLC( ir.msg, ir.addInfos );
    }
    if( ir instanceof IRForced )
    {
        return new Force(
            _irToUplc( ir.forced )
        )
    }
    if( ir instanceof IRDelayed )
    {
        return new Delay(
            _irToUplc( ir.delayed )
        )
    }

    throw new Error("unknown IR term calling '_irToUplc'")
}