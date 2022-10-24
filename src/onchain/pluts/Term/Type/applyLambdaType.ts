import { PrimType, TermType } from ".";
import BasePlutsError from "../../../../errors/BasePlutsError";
import { typeExtends } from "./extension";
import { isAliasType } from "./kinds";
import { findSubsToRestrict, replaceTypeParam } from "./tyParams";
import { cloneTermType } from "./utils";

export default function applyLambdaType( lambdaType: Readonly<[ PrimType.Lambda, TermType, TermType ]>, arg: Readonly<TermType> ): TermType
{
    if( !typeExtends( arg, lambdaType[1] ) )
    {
        /**
         * @todo add proper error type
         */
        throw new BasePlutsError(
            "invalid type of input while applying lambda type"
        );
    }
    if( isAliasType( lambdaType[1] ) )
    {
        // alias types are constants
        return cloneTermType( lambdaType[2] );
    }

    const subs = findSubsToRestrict( arg, lambdaType[1] );

    let outputType = cloneTermType( lambdaType[2] );

    for( const sub of subs )
    {
        outputType = replaceTypeParam( sub.tyVar, sub.tyArg as any, outputType );
    }

    return outputType;
}