import { ConstantableStructCtorDef, RestrictedStructInstance, ConstantableStructDefinition, PStruct } from ".";
import BasePlutsError from "../../../../errors/BasePlutsError";
import JsRuntime from "../../../../utils/JsRuntime";
import ObjectUtils from "../../../../utils/ObjectUtils";
import evalScript from "../../../CEK";
import UPLCVar from "../../../UPLC/UPLCTerms/UPLCVar";
import { pif, punConstrData, pfstPair, psndPair, pappendStr } from "../../Prelude/Builtins";
import { pindexList } from "../../Prelude/List";
import { plength } from "../../Prelude/List/plength";
import PType from "../../PType";
import { pintToStr } from "../../stdlib/pintToStr";
import { ptraceError } from "../../stdlib/ptrace";
import { plet, papp, punsafeConvertType } from "../../Syntax";
import Term from "../../Term";
import Type, { data, int, list } from "../../Term/Type";
import { isConstantableStructDefinition } from "../../Term/Type/kinds";
import { ctorDefToString, termTypeToString } from "../../Term/Type/utils";
import PData from "../PData";
import { getFromDataForType } from "../PData/conversion";
import PLam from "../PFn/PLam";
import PInt, { pInt } from "../PInt";
import PList from "../PList";
import { pStr } from "../PString";


export type RawFields<CtorDef extends ConstantableStructCtorDef> = 
    Term<PList<PData>> &
    {
        extract: <Fields extends (keyof CtorDef)[]>( ...fields: Fields ) => {
            in: <PExprResult extends PType>( expr: ( extracted: RestrictedStructInstance<CtorDef,Fields> ) => Term<PExprResult> ) => Term<PExprResult>
        }
    }


function getToRawFieldsFinalExpr<CtorDef extends ConstantableStructCtorDef, Fields extends (keyof CtorDef)[], PExprResult extends PType>(
    elemAt: Term<PLam<PInt, PData>> & {
        $: (input: Term<PInt>) => Term<PData>;
    },
    ctorDef: CtorDef,
    allFIndexes: number[],
    expr: ( extracted: RestrictedStructInstance<CtorDef,Fields> ) => Term<PExprResult> ,
    partialExtracted: object
): Term<PExprResult>
{
    const allFieldsNames = Object.keys( ctorDef );

    if( allFIndexes.length === 0 )
    {
        return expr( partialExtracted as any );
    }

    const idx = allFIndexes[0];
    return plet( getFromDataForType( ctorDef[ allFieldsNames[ idx ] ] )( papp( elemAt, pInt( idx ) ) ) ).in( value => {

        ObjectUtils.defineReadOnlyProperty(
            partialExtracted,
            allFieldsNames[ idx ],
            // bad solution, hopefully temporary
            // for some reason the value ( which is of course an UPLCVar )
            // would have always evalueated to debruijn 0
            // resulting always on the last field extracted when extracting multiple fields
            new Term(
                value.type,
                _dbn => new UPLCVar(
                    allFIndexes.length - 1
                )
            )
        );

        return getToRawFieldsFinalExpr(
            elemAt,
            ctorDef,
            allFIndexes.slice(1),
            expr,
            partialExtracted
        );
    });
}

function toRawFields<CtorDef extends ConstantableStructCtorDef>
    ( fieldsList: Readonly<Term<PList<PData>>>, ctorDef: CtorDef ): RawFields<CtorDef>
{
    const fieldsNames = Object.keys( ctorDef );
    // basically cloning;
    const _fieldsList = punsafeConvertType( fieldsList as any, fieldsList.type );

    return ObjectUtils.defineReadOnlyProperty(
        _fieldsList,
        "extract",
        <Fields extends (keyof CtorDef)[]>( ...fields: Fields ): {
            in: <PExprResult extends PType>( expr: ( extracted: RestrictedStructInstance<CtorDef,Fields> ) => Term<PExprResult> ) => Term<PExprResult>
        } => {

            const fieldsIdxs =
                fields
                .map( f => fieldsNames.findIndex( fName => fName === f ) )
                // ignore fields not present in the definion or duplicates
                .filter( (idx, i, thisArr ) => idx >= 0 && thisArr.indexOf( idx ) === i )
                .sort( ( a,b ) => a < b ? -1 : ( a === b ? 0 : 1 ) );

            return ObjectUtils.defineReadOnlyProperty(
                {},
                "in",
                <PExprResult extends PType>( expr: ( extracted: RestrictedStructInstance<CtorDef,Fields> ) => Term<PExprResult> ): Term<PExprResult> => {

                    if( fieldsIdxs.length === 0 ) return expr({} as any);

                    return plet( pindexList( data ).$( _fieldsList ) ).in( elemAt =>
                        getToRawFieldsFinalExpr(
                            elemAt,
                            ctorDef,
                            fieldsIdxs,
                            expr,
                            {}
                        )
                    );
                }
            )
        }
    ) as any;
}

function capitalize<s extends string>( str: s ): Capitalize<s>
{
    return str.length === 0 ? '' : str[0].toUpperCase() + str.slice(1) as any;
}

function getFinalPMatchExpr<CtorDefs extends ConstantableStructCtorDef[]>
(
    ctorCbs: (( rawFields: RawFields<CtorDefs[number]> ) => Term<PType>)[],
    ctorsDefs: CtorDefs,
    ctorIdx: Term<PInt>,
    rawDataFields: Term<PList<PData>>
)
{
    const last = ctorCbs.length - 1;

    const results = ctorCbs.map( (cb, i) => {
        return cb( toRawFields( rawDataFields, ctorsDefs[i] ) )
    });

    // struct definitions must have at least one constructor
    // implies element 0 is present;
    const returnT = results[0].type;

    let res = pif( returnT ).$( pInt( last ).eq( ctorIdx ) )
        .then( punsafeConvertType( results[ last ], returnT ) )
        .else(
            ptraceError( returnT as any )
            .$( 
                pStr("unmatched ctor; max:" + last.toString() + "; idx:")
                .concat( pintToStr.$( ctorIdx ) )
                .concat( pStr("; f:") )
                .concat(
                    pintToStr.$( plength.$( rawDataFields ) )
                )
            )
        );

    for( let i = ctorCbs.length - 2; i >= 0; i-- )
    {
        res = pif( returnT ).$( pInt( i ).eq( ctorIdx ) )
        .then( results[ i ] )
        .else( res )
    }

    return res;
}

export type PMatchOptions<SDef extends ConstantableStructDefinition> = {
    [Ctor in keyof SDef as `on${Capitalize<string & Ctor>}`]
        : ( cb: ( rawFields: RawFields<SDef[Ctor]> ) => Term<PType> )
            =>  Omit<SDef,Ctor> extends { [x: string | number | symbol ]: never } ?
                Term<PType> :
                PMatchOptions<Omit<SDef,Ctor>>
}

export default function pmatch<SDef extends ConstantableStructDefinition>( struct: Term<PStruct<SDef>> ): PMatchOptions<SDef>
{
    const sDef = struct.type[1] as ConstantableStructDefinition;
    if( !isConstantableStructDefinition( sDef ) )
    {
        /**
         * @todo add proper error
         */
        throw new BasePlutsError("unexpected struct type while running 'pmatch'; " +
            "\ntype expected to be 'ConstantableStructDefiniton' was: " + termTypeToString( sDef )
        );
    }

    const ctors = Object.keys( sDef );
    const ctorCbs: (( rawFields: RawFields<SDef[keyof SDef & string]> ) => Term<PType>)[] = Array( ctors.length );

    function indexOfCtor( ctor: string ): number
    {
        const res = ctors.indexOf( ctor )
        if( res < 0 )
        {
            throw JsRuntime.makeNotSupposedToHappenError(
                "internal function 'indexOfCtor' in 'definePMatchPermutations' couldn't find the constructor \"" + ctor +
                "\" between [" + ctors.map( c => c.toString() ).join(',') + ']'
            );
        }
        return res;
    }

    function permutations( missingCtors: string[] )
    {
        if( missingCtors.length <= 0 ) return {};

        // last permutation reurns the expression
        if( missingCtors.length === 1 )
        {
            const ctor = missingCtors[0] as keyof SDef & string;
            const idx = indexOfCtor( ctor );

            return ObjectUtils.defineReadOnlyProperty(
                {},
                "on" + capitalize( ctor ),
                ( cb: ( rawFields: RawFields<SDef[typeof ctor]> ) => Term<PType> ): Term<PType> => {

                    // same stuff of previous ctors
                    ctorCbs[idx] = cb;

                    // plus actual expression
                    return plet( punConstrData.$( struct as any ) ).in( constrPair =>
                        plet( pfstPair( int, list( data ) ).$( constrPair ) ).in( constrIdx =>
                        plet( psndPair( int, list( data ) ).$( constrPair ) ).in( rawDataFields => {

                            return getFinalPMatchExpr(
                                ctorCbs as any,
                                ctors.map( ctorName => sDef[ ctorName ] ),
                                constrIdx,
                                rawDataFields
                            );

                        })));
                }
            );
        }

        const remainingCtorsObj = {};

        missingCtors.forEach( ctor => {

            const idx = indexOfCtor( ctor );

            ObjectUtils.defineReadOnlyProperty(
                remainingCtorsObj,
                "on" + capitalize( ctor ),
                ( cb: ( rawFields: object ) => Term<PType> ) => {

                    ctorCbs[idx] = cb;

                    return permutations( missingCtors.filter( c => c !== ctor ) )
                }
            );
            
        });

        return remainingCtorsObj;
    }

    return permutations( ctors ) as any;
}