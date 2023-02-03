import { constTypeEq } from "../../UPLC/UPLCTerms/UPLCConst/ConstType";
import { canConstValueBeOfConstType, eqConstValue } from "../../UPLC/UPLCTerms/UPLCConst/ConstValue";

import { BitStream } from "../../../types/bits/BitStream";
import { UPLCTerm } from "../../UPLC/UPLCTerm";
import { Application } from "../../UPLC/UPLCTerms/Application";
import { Builtin } from "../../UPLC/UPLCTerms/Builtin";
import { Delay } from "../../UPLC/UPLCTerms/Delay";
import { ErrorUPLC } from "../../UPLC/UPLCTerms/ErrorUPLC";
import { Force } from "../../UPLC/UPLCTerms/Force";
import { HoistedUPLC } from "../../UPLC/UPLCTerms/HoistedUPLC";
import { Lambda } from "../../UPLC/UPLCTerms/Lambda";
import { UPLCConst } from "../../UPLC/UPLCTerms/UPLCConst";
import { UPLCVar } from "../../UPLC/UPLCTerms/UPLCVar";
import { PartialBuiltin } from "../BnCEK/PartialBuiltin";
import { CEKEnv } from "../CEKEnv";
import { DelayCEK } from "../DelayCEK";
import { LambdaCEK } from "../LambdaCEK";

export type CEKValue = UPLCTerm | PartialBuiltin | LambdaCEK | DelayCEK

export function eqCEKValue( a: Readonly<CEKValue>, b: Readonly<CEKValue> ): boolean
{
    if(!(
        Object.getPrototypeOf( a ) === Object.getPrototypeOf( b )
    )) return false;

    if( a instanceof HoistedUPLC && b instanceof HoistedUPLC )
    {
        return BitStream.eq( a.compiled, b.compiled );
    }

    if( a instanceof DelayCEK && b instanceof DelayCEK )
    {
        return CEKEnv.eq( a.env, b.env ) && eqCEKValue( a.delayedTerm, b.delayedTerm );
    }

    if( a instanceof LambdaCEK && b instanceof LambdaCEK )
    {
        return CEKEnv.eq( a.env, b.env ) && eqCEKValue( a.body, b.body );
    }

    if( a instanceof PartialBuiltin && b instanceof PartialBuiltin )
    {
        return (
            a.tag === b.tag &&
            a.nMissingArgs === b.nMissingArgs &&
            a.args.every( (arg, i) => eqCEKValue( arg, b.args[ i ] ) )
        );
    }

    if( a instanceof UPLCVar && b instanceof UPLCVar)
    {
        return a.deBruijn.asBigInt === b.deBruijn.asBigInt;
    }

    if( a instanceof Delay && b instanceof Delay )
    {
        return eqCEKValue( a.delayedTerm, b.delayedTerm )
    }

    if( a instanceof Lambda && b instanceof Lambda)
    {
        return eqCEKValue( a.body, b.body );
    }

    if( a instanceof Application && b instanceof Application )
    {
        return eqCEKValue( a.argTerm, b.argTerm ) && eqCEKValue( a.funcTerm, b.funcTerm );
    }

    if( a instanceof UPLCConst && b instanceof UPLCConst )
    {
        return (
            constTypeEq( a.type, b.type ) &&
            canConstValueBeOfConstType( a.value, a.type ) &&
            canConstValueBeOfConstType( b.value, b.type ) &&
            (() => {
                try {
                    return eqConstValue( a.value, b.value );
                } catch (e) {
                    if( e instanceof RangeError ) return false;

                    throw e;
                }
            })()
        );
    }

    if( a instanceof Force && b instanceof Force )
    {
        return (
            eqCEKValue( a.termToForce, b.termToForce )
        );
    }
    
    if( a instanceof ErrorUPLC ) return b instanceof ErrorUPLC;

    if( a instanceof Builtin && b instanceof Builtin ) return a.tag === b.tag;

    return false;
}