import BasePlutsError from "../../../errors/BasePlutsError";
import PScriptContext from "../API/V1/ScriptContext";
import { pif, pstrictIf } from "../stdlib/Builtins";
import { PDataRepresentable } from "../PType";
import PBool from "../PTypes/PBool";
import PData from "../PTypes/PData";
import { getFromDataForType } from "../PTypes/PData/conversion";
import PLam, { TermFn } from "../PTypes/PFn/PLam";
import PUnit, { pmakeUnit } from "../PTypes/PUnit";
import { papp, pdelay, perror, pfn, pforce, punsafeConvertType } from "../Syntax";
import Term from "../Term";
import Type, { bool, data, delayed, unit } from "../Term/Type";
import { typeExtends } from "../Term/Type/extension";
import { isConstantableTermType, isLambdaType } from "../Term/Type/kinds";
import { termTypeToString } from "../Term/Type/utils";


export function makeValidator( typedValidator: Term<PLam<PDataRepresentable,PLam<PDataRepresentable,PLam<typeof PScriptContext, PBool>>>> )
    : TermFn<[PData,PData,PData], PUnit>
{
    return pfn([
        data,
        data,
        data
    ],  unit
    )(( rawDatum, rawRedeemer, rawCtx ) => {

        const vType = typedValidator.type;
        const err = new BasePlutsError(
            "cannot make a validator from a term of type " + termTypeToString( vType )
        );

        if( !isLambdaType( vType ) ) throw err;
        
        const datumType = vType[1];
        if( !isConstantableTermType( datumType ) ) throw  err;

        const postDatum = vType[2];

        if( !isLambdaType( postDatum ) ) throw err;

        const redeemerType = postDatum[1];
        if( !isConstantableTermType( redeemerType ) ) throw  err;

        const postRedeemer = postDatum[2];

        if( !isLambdaType( postRedeemer ) ) throw err;

        const ctxType = postRedeemer[1];
        if( !isConstantableTermType( ctxType ) ) throw err;

        const expectedBool = postRedeemer[2];

        if( !typeExtends( expectedBool, bool ) ) throw err;

        return pif( unit ).$(
                papp(
                    papp(
                        papp(
                            typedValidator,
                            getFromDataForType( datumType )( rawDatum )
                        ),
                        getFromDataForType( redeemerType )( rawRedeemer )
                    ),
                    getFromDataForType( ctxType )( rawCtx )
                )
            )
            .$( pmakeUnit() )
            .$( perror( unit ) );
    });
}