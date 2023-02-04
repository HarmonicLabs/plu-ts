import JsRuntime from "../../../utils/JsRuntime";
import ObjectUtils from "../../../utils/ObjectUtils";
import { UPLCTerm } from "../../UPLC/UPLCTerm";
import { Application } from "../../UPLC/UPLCTerms/Application";
import { ErrorUPLC } from "../../UPLC/UPLCTerms/ErrorUPLC";
import { HoistedUPLC } from "../../UPLC/UPLCTerms/HoistedUPLC";
import { Lambda } from "../../UPLC/UPLCTerms/Lambda";
import { UPLCVar } from "../../UPLC/UPLCTerms/UPLCVar";
import { PType } from "../PType";
import { PLam } from "../PTypes";
import { Term, TermType, typeExtends, PrimType } from "../Term";
import { applyLambdaType } from "../Term/Type/applyLambdaType";
import { isLambdaType } from "../Term/Type/kinds";
import { termTypeToString } from "../Term/Type/utils";
import { UtilityTermOf, addUtilityForType } from "./addUtilityForType";
import { PappArg, pappArgToTerm } from "./pappArg";


function isIdentityUPLC( uplc: UPLCTerm ): uplc is Lambda
{
    return (
        ( uplc instanceof HoistedUPLC && isIdentityUPLC( uplc.UPLC ) ) || 
        (
            uplc instanceof Lambda && 
            uplc.body instanceof UPLCVar &&
            uplc.body.deBruijn.asBigInt === BigInt( 0 )
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

    if(!( isLambdaType( lambdaType ) )) throw JsRuntime.makeNotSupposedToHappenError(
        "a term not representing a Lambda (aka. Type.Lambda) was passed to an application"
    );

    let _b: Term<Input>;
    if( b instanceof Term )
    {
        JsRuntime.assert(
            typeExtends( b.type, lambdaType[ 1 ] ),
            "while applying 'Lambda'; unexpected type of input; it should be possible to assign the input to \"" + termTypeToString( lambdaType[1] ) +
            "\"; received input was of type: \"" + termTypeToString( b.type ) + "\""
        );
        _b = b as any;
    }
    else
    {
        _b = pappArgToTerm( b, lambdaType[1] ) as any;
    }

    const outputType = applyLambdaType( lambdaType, _b.type );
    const outputTerm = addUtilityForType( outputType )(
        new Term(
            outputType,
            dbn => {

                const funcUPLC = 
                    ( (_b as any).__isDynamicPair || _b.type[0] === PrimType.PairAsData) ?
                        
                        (dynPairVersion => 
                            dynPairVersion instanceof Term ? 
                                dynPairVersion.toUPLC( dbn ) : 
                                a.toUPLC( dbn )
                        )((a as any).withDynamicPairAsInput)

                        : a.toUPLC( dbn );
                        
                if( funcUPLC instanceof ErrorUPLC ) return funcUPLC;
                const argUPLC  = _b.toUPLC( dbn );
                if( argUPLC instanceof ErrorUPLC ) return argUPLC;

                // omit id function
                if( isIdentityUPLC( funcUPLC ) ) return argUPLC;

                const app = new Application(
                    funcUPLC,
                    argUPLC
                );

                return app; 
            },
            false // isConstant
        ) as any
    );

    if( isLambdaType( outputTerm.type ) && ( !ObjectUtils.hasOwn( outputTerm, "$" ) ))
        // defined "$" property can be overridden but not deleted
        // override is necessary to allow a more specific implementation
        // 
        // example is for lazy builtins such as ```pif``` that need to modify the input
        // wrapping it into a "Delay"
        return ObjectUtils.defineNonDeletableNormalProperty(
            outputTerm,
            "$",
            ( someInput: any ) => papp( outputTerm as any, someInput )
        ) as any;

   
    // @ts-ignore Type instantiation is excessively deep and possibly infinite.
    return outputTerm as any;
}