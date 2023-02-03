import JsRuntime from "../../../../utils/JsRuntime";
import ObjectUtils from "../../../../utils/ObjectUtils";

import { RestrictedStructInstance, PStruct } from "./pstruct";
import { pindexList } from "../../stdlib/List/methods";
import { ConstantableStructCtorDef, ConstantableStructDefinition, data, fn, lam, list, StructCtorDef, TermType, tyVar } from "../../Term/Type/base";
import { getFromDataForType } from "../PData/conversion/getFromDataTermForType";
import { constT } from "../../../UPLC/UPLCTerms/UPLCConst/ConstType";
import { isConstantableStructDefinition, isLambdaType } from "../../Term/Type/kinds";
import { PInt, pInt } from "../PInt";
import { plet, papp, plam } from "../../Syntax/syntax";
import { termTypeToString } from "../../Term/Type/utils";
import { BasePlutsError } from "../../../../errors/BasePlutsError";
import { UPLCTerm } from "../../../UPLC/UPLCTerm";
import { Application } from "../../../UPLC/UPLCTerms/Application";
import { Builtin } from "../../../UPLC/UPLCTerms/Builtin";
import { Delay } from "../../../UPLC/UPLCTerms/Delay";
import { ErrorUPLC } from "../../../UPLC/UPLCTerms/ErrorUPLC";
import { Force } from "../../../UPLC/UPLCTerms/Force";
import { HoistedUPLC } from "../../../UPLC/UPLCTerms/HoistedUPLC";
import { Lambda } from "../../../UPLC/UPLCTerms/Lambda";
import { UPLCConst } from "../../../UPLC/UPLCTerms/UPLCConst";
import { UPLCVar } from "../../../UPLC/UPLCTerms/UPLCVar";
import { TermList } from "../../stdlib/UtilityTerms/TermList";
import { PType } from "../../PType";
import { Term } from "../../Term";
import { PData } from "../PData/PData";
import { PLam } from "../PFn/PLam";
import { PList } from "../PList";
import { matchSingleCtorStruct } from "./matchSingleCtorStruct";
import { capitalize } from "../../../../utils/ts/capitalize";
import { DataI } from "../../../../types/Data/DataI";
import { addUtilityForType } from "../../stdlib/UtilityTerms/addUtilityForType";
import { punsafeConvertType } from "../../Syntax/punsafeConvertType";


export type RawFields<CtorDef extends ConstantableStructCtorDef> = 
    Term<PList<PData>> &
    {
        extract: <Fields extends (keyof CtorDef)[]>( ...fields: Fields ) => {
            in: <PExprResult extends PType>( expr: ( extracted: RestrictedStructInstance<CtorDef,Fields> ) => Term<PExprResult> ) => Term<PExprResult>
        }
    }


function getExtractedFieldsExpr<CtorDef extends ConstantableStructCtorDef, Fields extends (keyof CtorDef)[], PExprResult extends PType>(
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
    const fieldType = ctorDef[ allFieldsNames[ idx ] ];

    return plet( getFromDataForType( fieldType )(
        // @ts-ignore Type instantiation is excessively deep and possibly infinite.
        papp( elemAt, pInt( idx ) )
    )).in( value => {

        ObjectUtils.defineNormalProperty(
            partialExtracted,
            allFieldsNames[ idx ],
            addUtilityForType( fieldType )( value )
        );

        return getExtractedFieldsExpr(
            elemAt,
            ctorDef,
            allFIndexes.slice(1),
            expr,
            partialExtracted
        );
    });
}

function defineExtract<CtorDef extends ConstantableStructCtorDef>
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

            // console.log( `extracting [${fields}] from [${fieldsNames}]` );

            const fieldsIdxs = Object.freeze(
                fields
                .map( f => fieldsNames.findIndex( fName => fName === f ) )
                // ignore fields not present in the definion or duplicates
                .filter( ( idx, i, thisArr ) => idx >= 0 && thisArr.indexOf( idx ) === i )
                .sort( ( a,b ) => a < b ? -1 : ( a === b ? 0 : 1 ) )
            );

            return ObjectUtils.defineReadOnlyProperty(
                {},
                "in",
                <PExprResult extends PType>( expr: ( extracted: RestrictedStructInstance<CtorDef,Fields> ) => Term<PExprResult> ): Term<PExprResult> => {

                    if( fieldsIdxs.length === 0 ) return expr({} as any);

                    return plet(
                        // @ts-ignore Type instantiation is excessively deep and possibly infinite.
                        pindexList( data )
                        .$( _fieldsList ) ).in( elemAt =>
                        getExtractedFieldsExpr(
                            elemAt,
                            ctorDef,
                            fieldsIdxs as any,
                            expr,
                            {}
                        )
                    );
                }
            )
        }
    ) as any;
}

type CtorCallback<SDef extends ConstantableStructDefinition> = ( rawFields: RawFields<SDef[keyof SDef & string]> ) => Term<PType>;

type EmptyObject = { [x: string | number | symbol ]: never };

type MatchRest<PReturnT extends PType> = {
    _: ( continuation: ( rawFields: TermList<PData> ) => Term<PReturnT> ) => Term<PReturnT>
}

type TypedPMatchOptions<SDef extends ConstantableStructDefinition, PReturnT extends PType> = {
    [Ctor in keyof SDef as `on${Capitalize<string & Ctor>}`]
        : ( cb: ( rawFields: RawFields<SDef[Ctor]> ) => Term<PReturnT> )
            =>  Omit<SDef,Ctor> extends EmptyObject ?
                Term<PReturnT> :
                TypedPMatchOptions<Omit<SDef,Ctor>, PReturnT>
} & MatchRest<PReturnT>


export type PMatchOptions<SDef extends ConstantableStructDefinition> = {
    [Ctor in keyof SDef as `on${Capitalize<string & Ctor>}`]
        : <PReturnT extends PType>( cb: ( rawFields: RawFields<SDef[Ctor]> ) => Term<PReturnT> )
            =>  Omit<SDef,Ctor> extends EmptyObject ?
                Term<PReturnT> :
                TypedPMatchOptions<Omit<SDef,Ctor>, PReturnT>
} & {
    _: <PReturnT extends PType>( continuation: ( rawFields: TermList<PData> ) => Term<PReturnT> ) => Term<PReturnT>
}

export function matchNCtorsIdxs( _n: number, returnT: TermType )
{
    if( _n <= 1 ) throw new BasePlutsError("mathcing ill formed struct data");
    const n = Math.round( _n );
    if( _n !== n ) throw new BasePlutsError("number of ctors to match must be an integer");

    const continuationT = lam( list(data), returnT );

    // built immediately; not at compilation

    // all this mess just to allow hoisting
    // you have got to reason backwards to understand the process

    let body: UPLCTerm = new ErrorUPLC("matchNCtorsIdxs; unmatched");

    for(let i = n - 1; i >= 0; i-- )
    {
        // pif( continuationT ).$( isCtorIdx.$( pInt( i ) ) )
        // .then( continuation_i )
        // .else( ... )
        body = new Force(
            new Application(
                new Application(
                    new Application(
                        Builtin.ifThenElse,
                        new Application(
                            new UPLCVar( 0 ),         // isCtorIdx // last variable introduced (see below)
                            UPLCConst.int( i )        // .$( pInt( i ) )
                        )
                    ),
                    new Delay( new UPLCVar(
                        2 + // isCtorIdx and structConstrPair are in scope
                        i   // continuation_i
                    ) ) // then matching continuation
                ),
                new Delay( body ) // else go check the next index; or error if it was last possible index
            )
        );
    }

    // plet( peqInt.$( pfstPir(...).$( structConstrPair ) ) ).in( isCtorIdx => ... )
    body = new Application(
        new Lambda( // isCtorIdx
            body
        ),
        // peqInt.$( pfstPir(...).$( structConstrPair ) )
        new Application(
            Builtin.equalsInteger,
            new Application(
                Builtin.fstPair,
                new UPLCVar( 0 ) // structConstrPair // last variable introduced (see below)
            )
        )
    );

    // <whatever continuation was matched>.$( psndPair(...).$( structConstrPair ) )
    // aka passing the fields to the continuation
    body = new Application(
        body,
        new Application(
            Builtin.sndPair,
            new UPLCVar( 0 ), // structConstrPair // last variable introduced (see below)
        )
    );

    // plet( punConstrData.$( structData ) )  ).in( structConstrPair => ... )
    body = new Application(
        new Lambda( // structConstrPair
            body
        ),
        new Application(
            Builtin.unConstrData,
            new UPLCVar( n ) // structData
        )
    );

    for(let i = n - 1; i >= 0; i-- )
    {
        body = new Lambda( // continuation n - 1 - i
            body
        );
    }

    // seriously, all this mess for this HoistedUPLC
    body = new HoistedUPLC(
        new Lambda( // structData
            body
        )
    );

    return new Term(
        fn([
            data,
            ...(new Array( n ).fill( continuationT ))
        ],  returnT
        ),
        _dbn => body
    );
}

function getReturnTypeFromContinuation<SDef extends ConstantableStructDefinition>(
    cont: CtorCallback<SDef>,
    ctorDef: StructCtorDef
): TermType
{
    return cont( 
        defineExtract(
            // mock the fields
            // we are not really interested in the result here; only in the type
            new Term(
                list( data ),
                _dbn =>
                    UPLCConst.listOf( constT.data )(
                        (new Array( Object.keys( ctorDef ).length ))
                        .fill( new DataI( 0 ) )
                    )
            ), 
            ctorDef as SDef[string]
        ) 
    ).type;
}

function hoistedMatchCtors<SDef extends ConstantableStructDefinition>(
    structData: Term<PData>,
    sDef: SDef,
    ctorCbs: (CtorCallback<SDef> | Term<PLam<PList<PData>, PType>>)[],
)
    : Term<PType>
{
    const length = ctorCbs.length;

    if( length <= 0 ) throw new BasePlutsError("trying to match ill formed struct");

    // const returnT = tyVar("single_ctor_match_return_type");
    const ctors = Object.keys(sDef);

    if( length === 1 )
    {
        const cont = ctorCbs[0];

        if( cont instanceof Term )
        {
            if( !isLambdaType( cont.type ) )
            {
                // todo: add proper error
                throw new BasePlutsError(
                    "pmatch continuation was not a lambda"
                );
            }

            return papp(
                papp(
                    matchSingleCtorStruct,
                    structData
                ),
                cont
            );
        }

        const thisCtor = sDef[ ctors[0] ] as SDef[string];
        return papp(
            papp(
                matchSingleCtorStruct,
                structData
            ),
            plam( list(data), getReturnTypeFromContinuation( cont, thisCtor ) )
            ( fieldsListData => 
                cont( 
                    defineExtract( 
                        fieldsListData, 
                        thisCtor
                    ) 
                )
            )
        );
    }

    // multiple ctors struct case

    let cont = ctorCbs.find( cb => typeof cb === "function" ) ?? ctorCbs[ 0 ];

    let returnT: TermType | undefined = 
        cont instanceof Term ?
        cont.type[2] as TermType :
        undefined
    
    let result = papp(
        matchNCtorsIdxs( ctors.length, tyVar("will_be_substituted_by_lambda_applicaiton") ) as any,
        structData
    );

    for( let i = ctors.length - 1; i >= 0 ; i-- )
    {
        const thisCont = ctorCbs[i];
        const thisCtor = sDef[ ctors[i] ] as SDef[string];
        result = papp(
            result as any,
            thisCont instanceof Term ?
            thisCont : 
            plam( list(data), returnT ?? getReturnTypeFromContinuation( thisCont, thisCtor ) )
            ( fieldsListData => 
                thisCont( 
                    defineExtract( 
                        fieldsListData,
                        thisCtor
                    ) 
                )
            ) as any
        );
    }

    return result;
}

export function pmatch<SDef extends ConstantableStructDefinition>( struct: Term<PStruct<SDef>> ): PMatchOptions<SDef>
{
    const sDef = struct.type[1] as ConstantableStructDefinition;
    if( !isConstantableStructDefinition( sDef ) )
    {
        /**
         * @todo add proper error
         */
        throw new BasePlutsError("unexpected struct type while running 'pmatch'; " +
            "\ntype expected to be a 'ConstantableStructDefiniton' was: " + termTypeToString( struct.type )
        );
    }

    const ctors = Object.keys( sDef );
    const ctorCbs: CtorCallback<SDef>[] = ctors.map( _ => undefined ) as any;

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

            const matcher = "on" + capitalize( ctor );
            let result = {};
            result = ObjectUtils.defineReadOnlyProperty(
                result,
                matcher,
                ( cb: ( rawFields: RawFields<SDef[typeof ctor]> ) => Term<PType> ): Term<PType> => {

                    // same stuff of previous ctors
                    ctorCbs[idx] = cb;

                    return hoistedMatchCtors(
                        punsafeConvertType( struct, data ),
                        sDef,
                        ctorCbs as any
                    );

                }
            );
            return ObjectUtils.defineReadOnlyProperty(
                result,
                "_",
                (result as any)[matcher]
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

        return ObjectUtils.defineReadOnlyProperty(
            remainingCtorsObj,
            "_",
            ( cb: ( rawFields: Term<PList<PData>> ) => Term<PType> ) => {

                const maxLengthFound = 
                    ctors
                    .map( ctor => Object.keys( sDef[ ctor ] ).length )
                    .reduce( (prev, curr, i ) => Math.max( prev, curr ) , 0 );

                const returnT = getReturnTypeFromContinuation(
                    cb,
                    sDef[
                        ctors[
                            ctors.findIndex( ctor => Object.keys( sDef[ ctor ] ).length === maxLengthFound )
                        ]
                    ]
                )
                
                return plet(
                    plam( list(data), returnT )( cb )
                ).in( othCtorsContinuation => {

                    for( let i = 0; i < ctorCbs.length; i++ )
                    {
                        if( typeof ctorCbs[i] !== "function" )
                        {
                            ctorCbs[i] = othCtorsContinuation as any;
                        }
                    }

                    return hoistedMatchCtors(
                        punsafeConvertType( struct, data ),
                        sDef,
                        ctorCbs as any
                    );
                })
            }
        );
    }

    return permutations( ctors ) as any;
}