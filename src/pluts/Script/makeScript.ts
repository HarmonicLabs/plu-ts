import type { PBool } from "../PTypes/PBool";
import type { PData } from "../PTypes/PData/PData";
import type { PLam } from "../PTypes/PFn/PLam";
import type { PUnit } from "../PTypes/PUnit";
import type { Term } from "../Term";
import { termTypeToString } from "../../type_system/utils";
import { V1 , V2 } from "../API";
import type { PDataRepresentable } from "../PType/PDataRepresentable";
import { TermFn } from "../PTypes/PFn/PFn";
import { perror } from "../lib/perror";
import { pmakeUnit } from "../lib/std/unit/pmakeUnit";
import { pif } from "../lib/builtins";
import { papp } from "../lib/papp";
import { pfn } from "../lib/pfn";
import { PrimType, bool, data, unit } from "../../type_system/types";
import { isWellFormedType, typeExtends } from "../../type_system";
import { fromData } from "../lib/std/data/conversion/fromData";
import { ptraceError } from "../lib/std/traces";


/**
 * @deprecated
 * 
 * since plutus v3, all plutus scripts take only the script context as argument
 * and redeemer and datum can be extracted from there
 * 
 * it is suggested to use plutus v3 (or higher) to get the best performance out of your contract
 * 
 * also make sure your contract returns a `unit` and no longer a `bool`
 */
export function makeValidator(
    typedValidator: Term<
        PLam<
        PDataRepresentable,
        PLam<
            PDataRepresentable,
            PLam<
                    typeof V1.PScriptContext | typeof V2.PScriptContext, 
                    PBool
                >
            >
        >
    >,
    errorMessage?: string
): TermFn<[PData,PData,PData], PUnit>
{
    return pfn([
        data,
        data,
        data
    ],  unit
    )(( rawDatum, rawRedeemer, rawCtx ) => {

        const vType = typedValidator.type;
        const err = () => new Error(
            "cannot make a validator from a term of type " + termTypeToString( vType )
        );

        if( vType[0] !== PrimType.Lambda ) throw err();
        
        const datumType = vType[1];
        if( !isWellFormedType( datumType ) ) throw  err();

        const postDatum = vType[2];

        if( postDatum[0] !== PrimType.Lambda ) throw err();

        const redeemerType = postDatum[1];
        if( !isWellFormedType( redeemerType ) ) throw  err();

        const postRedeemer = postDatum[2];

        if( postRedeemer[0] !== PrimType.Lambda ) throw err();

        const ctxType = postRedeemer[1];
        if( !isWellFormedType( ctxType ) ) throw err();

        const expectedBool = postRedeemer[2];

        if( !typeExtends( expectedBool, bool ) ) throw err();

        const errorTerm = errorMessage === undefined ?
            perror( unit ) : ptraceError( unit, errorMessage ).$(errorMessage);

        return pif( unit ).$(
                papp(
                    papp(
                        papp(
                            typedValidator,
                            fromData( datumType )( rawDatum )
                        ),
                        fromData( redeemerType )( rawRedeemer )
                    ),
                    fromData( ctxType )( rawCtx )
                )
            )
            .$( pmakeUnit() )
            .$( errorTerm );
    });
}


/**
 * @deprecated
 * 
 * since plutus v3, all plutus scripts take only the script context as argument
 * and redeemer and datum can be extracted from there
 * 
 * it is suggested to use plutus v3 (or higher) to get the best performance out of your contract
 * 
 * also make sure your contract returns a `unit` and no longer a `bool`
 */
export function makeRedeemerValidator(
    typedValidator: Term<
        PLam<
            PDataRepresentable,
            PLam<
                    typeof V1.PScriptContext | typeof V2.PScriptContext, 
                    PBool
                >
        >
    >,
    errorMessage?: string
): TermFn<[PData,PData], PUnit>
{
    return pfn([
        data,
        data
    ],  unit
    )(( rawRedeemer, rawCtx ) => {

        const vType = typedValidator.type;
        const err = () => new Error(
            "cannot make a validator from a term of type " + termTypeToString( vType )
        );

        if( vType[0] !== PrimType.Lambda ) throw err();

        const redeemerType = vType[1];
        if( !isWellFormedType( redeemerType ) ) throw err();

        const postRedeemer = vType[2];

        if( postRedeemer[0] !== PrimType.Lambda ) throw err();

        const ctxType = postRedeemer[1];
        if( !isWellFormedType( ctxType ) ) throw err();

        const expectedBool = postRedeemer[2];

        if( !typeExtends( expectedBool, bool ) ) throw err();

        const errorTerm = errorMessage === undefined ?
            perror( unit ) : ptraceError( unit, errorMessage ).$(errorMessage);

        return pif( unit ).$(
                papp(
                    papp(
                        typedValidator,
                        fromData( redeemerType )( rawRedeemer )
                    ),
                    fromData( ctxType )( rawCtx )
                )
            )
            .$( pmakeUnit() )
            .$( errorTerm );
    });
}