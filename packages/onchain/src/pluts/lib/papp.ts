import { hasOwn, defineNonDeletableNormalProperty } from "@harmoniclabs/obj-utils";
import { IRApp, IRError, IRFunc, IRHoisted, IRNative, IRTerm, IRVar, isIRTerm } from "../../IR";
import { IRNativeTag } from "../../IR/IRNodes/IRNative/IRNativeTag";
import { assert } from "../../utils/assert";
import { PType } from "../PType";
import { PLam } from "../PTypes";
import { Term } from "../Term";
import { includesDynamicPairs } from "../type_system/includesDynamicPairs";
import { typeExtends } from "../type_system/typeExtends";
import { PrimType, TermType, data } from "../type_system/types";
import { termTypeToString } from "../type_system/utils";
import { type UtilityTermOf, addUtilityForType } from "./addUtilityForType";
import { PappArg, pappArgToTerm } from "./pappArg";
import { _fromData } from "./std/data/conversion/fromData_minimal";
import { _papp } from "./std/data/conversion/minimal_common";


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
        Term<PLam<OutIn,OutOut>>
        & {
            $: ( someInput: PappArg<OutIn> ) => PappResult<OutOut>
        } :
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
        _b = pappArgToTerm( b, lambdaType[1] ) as any;
    }

    const outputType = lambdaType[2]; // applyLambdaType( lambdaType, _b.type );

    const e_stack = Error().stack;

    const outputTerm = addUtilityForType( outputType )(
        new Term(
            outputType,
            dbn => {

                let funcIR: IRTerm;

                if((_b as any).__isDynamicPair || (includesDynamicPairs( _b.type ) && !includesDynamicPairs( lambdaType[1] )))
                {
                    if(!hasOwn( a, "unsafeWithInputOfType" ))
                    {
                        /*
                        console.warn(
`%c WARNING: %ctrying to apply a function that takes pairs as inputs but it doesn't have an equivalent version
that handles pairs built with 'asData' elements (pairs built dynamically).
It is possible that this will generate invalid UPLC and this is a known issue which will be fixed in a future verson of plu-ts
Meanwhile you can either open an issue (https://github.com/HarmonicLabs/plu-ts/issues)
or you can join Harmonic Labs' discord and ask for help on your specific issue (https://discord.gg/CGKNcG7ade)\n`,
                            "color: black; background-color: yellow",
                            "color:yellow"
                        )
                        //*/
                        funcIR = a.toIR(dbn)
                    }
                    else funcIR = (a as any).unsafeWithInputOfType( _b.type ).toIR(dbn)
                }
                else
                {
                    funcIR = a.toIR(dbn)
                }

                if( funcIR instanceof IRError ) return funcIR;
                
                const argIR  = _b.toIR( dbn );
                if( argIR instanceof IRError ) return argIR;

                // omit id function
                if( isIdentityIR( funcIR ) ) return argIR;

                if(!isIRTerm( funcIR ))
                {
                    console.log( e_stack );
                }

                const app = new IRApp(
                    funcIR,
                    argIR
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