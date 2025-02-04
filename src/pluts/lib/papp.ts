import { hasOwn, defineNonDeletableNormalProperty } from "@harmoniclabs/obj-utils";
import { IRNativeTag } from "../../IR/IRNodes/IRNative/IRNativeTag";
import { assert } from "../../utils/assert";
import { PType } from "../PType";
import { PLam } from "../PTypes";
import { Term } from "../Term";
import { includesDynamicPairs } from "../../type_system/includesDynamicPairs";
import { typeExtends } from "../../type_system/typeExtends";
import { PrimType, TermType, data } from "../../type_system/types";
import { termTypeToString } from "../../type_system/utils";
import { type UtilityTermOf, addUtilityForType } from "./std/UtilityTerms/addUtilityForType";
import { PappArg, pappArgToTerm } from "./pappArg";
import { _fromData } from "./std/data/conversion/fromData_minimal";
import { _papp } from "./std/data/conversion/minimal_common";
import { IRVar } from "../../IR/IRNodes/IRVar";
import { IRFunc } from "../../IR/IRNodes/IRFunc";
import { IRNative } from "../../IR/IRNodes/IRNative";
import { IRHoisted } from "../../IR/IRNodes/IRHoisted";
import { IRTerm } from "../../IR/IRTerm";
import { IRApp } from "../../IR/IRNodes/IRApp";
import { IRError } from "../../IR/IRNodes/IRError";
import type { BaseUtilityTermExtension } from "./std/UtilityTerms/BaseUtilityTerm";


function isIdentityIR( ir: IRTerm ): boolean
{
    return (
        ( ir instanceof IRHoisted && isIdentityIR( ir.hoisted ) ) ||
        ( ir instanceof IRNative && ir.tag === IRNativeTag._id ) ||
        (
            ir instanceof IRFunc && 
            ir.body instanceof IRVar &&
            ir.body.dbn === 0
        )
    );
}

export type PappResult<Output extends PType> =
    Output extends PLam<infer OutIn extends PType, infer OutOut extends PType> ?
        Term<PLam<OutIn,OutOut>> & {
            $: ( someInput: PappArg<OutIn> ) => PappResult<OutOut>
        } & BaseUtilityTermExtension :
    UtilityTermOf<Output>

function unwrapDataIfNeeded( input: Term<PType>, expectedInputTy: TermType ): Term<any>
{
    input = (
        // we know the actual type that the data represents
        input.type[0] === PrimType.AsData &&
        // and the function is not expecting actually data
        !typeExtends( expectedInputTy, data )
    ) ?
    // transform to the value
    _fromData( input.type[1] as any )( input as any ) :
    // keep the data
    input;

    return input;
}

/**
 * 
 * @param {Term<PLam<Input, Output>>} a Term that evalueates to an UPLC function ( type: ```Type.Lambda( inputT, outputT )``` ) 
 * @param {Term<Input>} b the argument of to provide to the first parameter 
 * @returns {Term<Output>} the result of the calculation
 * 
 * if the type of the output extends the type ```Type.Lambda( Type.Any, Type.Any )```
 */
export function papp<Input extends PType, Output extends PType>( a: Term<PLam<Input,Output>>, b: PappArg<Input> )
    : UtilityTermOf<Output>
{
    let lambdaType: TermType = a.type;

    if(!( lambdaType[0] === PrimType.Lambda ) )
    throw new Error(
        "a term not representing a Lambda (aka. Type.Lambda) was passed to an application"
    );

    let _b: Term<Input>;
    if( b instanceof Term )
    {
        // unwrap 'asData' if is the case
        b = unwrapDataIfNeeded( b, lambdaType[1] );

        assert(
            typeExtends( b.type, lambdaType[ 1 ] ),
            "while applying 'Lambda'; unexpected type of input;\n\nit should be possible to assign the input to \"" + termTypeToString( lambdaType[1] ) +
            "\";\nreceived input was of type: \"" + termTypeToString( b.type ) + "\"" + 
            "\n\noutput would be of type: \"" + termTypeToString( a.type[2] as any ) + "\""
        );
        _b = b as any;
    }
    else
    {
        _b = pappArgToTerm( b as any, lambdaType[1] ) as any;
    }

    const outputType = lambdaType[2]; // applyLambdaType( lambdaType, _b.type );

    // const e_stack = Error().stack?.split("\n");

    let n = 2;
    // let src = e_stack ? 
    //     e_stack[2].includes("$ ") ? 
    //         e_stack[n = 3] : 
    //         e_stack[2] 
    //     : undefined;

    const outputTerm = addUtilityForType( outputType )(
        new Term(
            outputType,
            (cfg, dbn) => {

                let funcIR: IRTerm;

                if((_b as any).__isDynamicPair || (includesDynamicPairs( _b.type ) && !includesDynamicPairs( lambdaType[1] )))
                {
                    if(!hasOwn( a, "unsafeWithInputOfType" ))
                    {
                        funcIR = a.toIR( cfg,dbn)
                    }
                    else funcIR = (a as any).unsafeWithInputOfType( _b.type ).toIR( cfg,dbn)
                }
                else
                {
                    funcIR = a.toIR( cfg,dbn)
                }

                if( funcIR instanceof IRError ) return funcIR;
                
                const argIR  = _b.toIR( cfg, dbn );
                if( argIR instanceof IRError ) return argIR;

                // omit id function
                if( isIdentityIR( funcIR ) ) return argIR;

                const app = new IRApp(
                    funcIR,
                    argIR,
                    // { __src__: src }
                );

                return app; 
            },
            false // isConstant
        ) as any
    );

    if( ( outputTerm.type[0] === PrimType.Lambda ) && ( !hasOwn( outputTerm, "$" ) ))
        // defined "$" property can be overridden but not deleted
        // override is necessary to allow a more specific implementation
        // 
        // example is for lazy builtins such as ```pif``` that need to modify the input
        // wrapping it into a "Delay"
        return defineNonDeletableNormalProperty(
            outputTerm,
            "$",
            ( someInput: any ) => papp( outputTerm as any, someInput )
        ) as any;

    return outputTerm as any;
}