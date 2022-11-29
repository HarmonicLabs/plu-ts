import BasePlutsError from "../../../errors/BasePlutsError";
import { pif } from "../stdlib/Builtins";
import PBool from "../PTypes/PBool";
import PData from "../PTypes/PData/PData";
import PLam from "../PTypes/PFn/PLam";
import PUnit, { pmakeUnit } from "../PTypes/PUnit";
import { papp, perror, pfn } from "../Syntax/syntax";
import Term from "../Term";
import { bool, data, unit } from "../Term/Type/base";
import { typeExtends } from "../Term/Type/extension";
import { isConstantableTermType, isLambdaType } from "../Term/Type/kinds";
import { termTypeToString } from "../Term/Type/utils";
import { V1 , V2 } from "../API";
import { getFromDataForType } from "../PTypes/PData/conversion/getFromDataTermForType";
import type PDataRepresentable from "../PType/PDataRepresentable";
import { TermFn } from "../PTypes/PFn/PFn";


export default function makeValidator(
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
    > )
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