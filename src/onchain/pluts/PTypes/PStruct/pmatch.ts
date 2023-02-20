import JsRuntime from "../../../../utils/JsRuntime";
import ObjectUtils from "../../../../utils/ObjectUtils";

import { RestrictedStructInstance, PStruct, pstruct } from "./pstruct";
import { constT } from "../../../UPLC/UPLCTerms/UPLCConst/ConstType";
import { ctorDefToString, termTypeToString } from "../../type_system/utils";
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
import { PType } from "../../PType";
import { Term } from "../../Term";
import { PData } from "../PData/PData";
import { PLam } from "../PFn/PLam";
import { PList } from "../PList";
import { matchSingleCtorStruct } from "./matchSingleCtorStruct";
import { capitalize } from "../../../../utils/ts/capitalize";
import { DataI } from "../../../../types/Data/DataI";
import { plet } from "../../lib/plet";
import { papp } from "../../lib/papp";
import { UtilityTermOf, addUtilityForType } from "../../lib/addUtilityForType";
import { punsafeConvertType } from "../../lib/punsafeConvertType";
import { TermList } from "../../lib/std/UtilityTerms/TermList";
import { plam } from "../../lib/plam";
import { TermFn } from "../PFn";
import { LamT, PrimType, StructCtorDef, StructDefinition, TermType, data, fn, int, lam, list, struct, tyVar } from "../../type_system/types";
import { isStructDefinition } from "../../type_system";
import { phead } from "../../lib/builtins/list";
import { fromData_minimal } from "../../lib/std/data/conversion/fromData_minimal";
import { genHoistedSourceUID } from "../../../UPLC/UPLCTerms/HoistedUPLC/HoistedSourceUID/genHoistedSourceUID";


const elemAtCache: { [n: number]: TermFn<[ PList<PData> ], PData > } = {};

export function getElemAtTerm( n: number ): TermFn<[ PList<PData> ], PData >
{
    if( n < 0 || n !== Math.round(n) )
    throw new BasePlutsError(
        "unexpected index in pmatch field extraction"
    );

    if( elemAtCache[n] !== undefined ) return elemAtCache[n];

    if( n === 0 ) return phead( data );

    let uplc: UPLCTerm = new UPLCVar(0);

    const initialN = n;
    while( n > 0 )
    {
        uplc = new Application( Builtin.tailList, uplc );
        n--;
    }

    uplc = new HoistedUPLC(
        new Lambda(
            new Application(
                Builtin.headList,
                uplc
            )
        ),
        genHoistedSourceUID() // executed once, all other times for the same n we get the term from the 'cache'
    );

    const term = new Term( lam( list(data), data ), _dbn => uplc );

    ObjectUtils.defineReadOnlyProperty(
        term, "$",
        ( lst: Term<PList<PData>>) => 
            new Term(
                data,
                dbn => new Application( uplc.clone(), lst.toUPLC(dbn) )
            )
    );

    elemAtCache[initialN] = term as any;
    return term as any;
}


export type RawFields<CtorDef extends StructCtorDef> = 
    Term<PList<PData>> &
    {
        extract: <Fields extends (keyof CtorDef)[]>( ...fields: Fields ) => {
            in: <PExprResult extends PType>( expr: ( extracted: RestrictedStructInstance<CtorDef,Fields> ) => Term<PExprResult> ) => Term<PExprResult>
        }
    }

function getExtractedFieldsExpr<CtorDef extends StructCtorDef, Fields extends (keyof CtorDef)[], PExprResult extends PType>(
    fieldsData: Term<PList<PData>>,
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

    return plet(
        addUtilityForType( fieldType )(
            fromData_minimal( fieldType )(
                getElemAtTerm( idx ).$( fieldsData )
            )
        )
    ).in( value => {

        ObjectUtils.defineNormalProperty(
            partialExtracted,
            allFieldsNames[ idx ],
            punsafeConvertType( value, fieldType )
        );

        return getExtractedFieldsExpr(
            fieldsData,
            ctorDef,
            allFIndexes.slice(1),
            expr,
            partialExtracted
        );
    });
}

function defineExtract<CtorDef extends StructCtorDef>
    ( fieldsList: Term<PList<PData>>, ctorDef: CtorDef ): RawFields<CtorDef>
{
    const fieldsNames = Object.keys( ctorDef );
    // basically cloning;
    const _fieldsList = fieldsList;

    return ObjectUtils.defineReadOnlyProperty(
        _fieldsList,
        "extract",
        <Fields extends (keyof CtorDef)[]>( ...fields: Fields ): {
            in: <PExprResult extends PType>( expr: ( extracted: RestrictedStructInstance<CtorDef,Fields> ) => Term<PExprResult> ) => Term<PExprResult>
        } => {

            const fieldsIndicies = fields
                .map( f => fieldsNames.findIndex( fName => fName === f ) )
                // ignore fields not present in the definion or duplicates
                .filter( ( idx, i, thisArr ) => idx >= 0 && thisArr.indexOf( idx ) === i )
                .sort( ( a,b ) => a < b ? -1 : ( a === b ? 0 : 1 ) );

            return ObjectUtils.defineReadOnlyProperty(
                {},
                "in",
                <PExprResult extends PType>( expr: ( extracted: RestrictedStructInstance<CtorDef,Fields> ) => Term<PExprResult> ): Term<PExprResult> => {

                    if( fieldsIndicies.length === 0 ) return expr({} as any);

                    const res = getExtractedFieldsExpr(
                        _fieldsList,
                        ctorDef,
                        fieldsIndicies,
                        expr,
                        {}
                    );

                    return res;
                }
            )
        }
    ) as any;
}

type CtorCallback<SDef extends StructDefinition> = ( rawFields: RawFields<SDef[keyof SDef & string]> ) => Term<PType>;

type EmptyObject = { [x: string | number | symbol ]: never };

type MatchRest<PReturnT extends PType> = {
    _: ( continuation: ( rawFields: TermList<PData> ) => Term<PReturnT> ) => Term<PReturnT>
}

type TypedPMatchOptions<SDef extends StructDefinition, PReturnT extends PType> = {
    [Ctor in keyof SDef as `on${Capitalize<string & Ctor>}`]
        : ( cb: ( rawFields: RawFields<SDef[Ctor]> ) => Term<PReturnT> )
            =>  Omit<SDef,Ctor> extends EmptyObject ?
                UtilityTermOf<PReturnT> :
                TypedPMatchOptions<Omit<SDef,Ctor>, PReturnT>
} & MatchRest<PReturnT>


export type PMatchOptions<SDef extends StructDefinition> = {
    [Ctor in keyof SDef as `on${Capitalize<string & Ctor>}`]
        : <PReturnT extends PType>( cb: ( rawFields: RawFields<SDef[Ctor]> ) => Term<PReturnT> )
            =>  Omit<SDef,Ctor> extends EmptyObject ?
                UtilityTermOf<PReturnT> :
                TypedPMatchOptions<Omit<SDef,Ctor>, PReturnT>
} & {
    _: <PReturnT extends PType>( continuation: ( rawFields: TermList<PData> ) => Term<PReturnT> ) => Term<PReturnT>
}

const matchNCtorsIdxsCache: { [n: number]: Term<any> } = {};

export function matchNCtorsIdxs( _n: number, returnT: TermType )
{
    if( _n <= 1 ) throw new BasePlutsError("mathcing ill formed struct data");
    const n = Math.round( _n );
    if( _n !== n ) throw new BasePlutsError("number of ctors to match must be an integer");

    if( matchNCtorsIdxsCache[n] !== undefined ) return matchNCtorsIdxsCache[n];

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
        ),
        genHoistedSourceUID() // executed once, all other times for the same n we get the term from the 'cache'
    );

    type ContinuationT = LamT<[PrimType.List, [PrimType.Data]], TermType>

    return new Term(
        fn([
            data,
            ...(new Array( n ).fill( continuationT )) as [ ContinuationT, ...ContinuationT[] ]
        ],  returnT) as any,
        _dbn => body
    );
}

function getReturnTypeFromContinuation<SDef extends StructDefinition>(
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

/**
 * 
 * @param structData 
 * @param sDef 
 * @param ctorCbs
 *  
 * @returns the term that matches the ctor 
 */
function hoistedMatchCtors<SDef extends StructDefinition>(
    structData: Term<PStruct<SDef>>,
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
            if( cont.type[0] !== PrimType.Lambda )
            {
                // todo: add proper error
                throw new BasePlutsError(
                    "pmatch continuation was not a lambda"
                );
            }

            return papp(
                papp(
                    matchSingleCtorStruct( cont.type[2] ),
                    structData as any
                ),
                cont
            );
        }

        const thisCtor = sDef[ ctors[0] ] as SDef[string];
        const returnT = getReturnTypeFromContinuation( cont, thisCtor );

        return papp(
            papp(
                matchSingleCtorStruct( returnT ),
                structData as any
            ),
            plam( list(data), returnT )
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
    let ctorIdx = 0;
    let cont = ctorCbs.find(
        (cb, i) => {
            if( typeof cb === "function" )
            {
                ctorIdx = i;
                return true;
            }
            return false;
        }) ?? ctorCbs[ 0 ];

    const thisCtor = sDef[ Object.keys( sDef )[ ctorIdx ] ] as SDef[string];

    let returnT: TermType | undefined = 
        cont instanceof Term ?
        cont.type[2] as TermType :
        getReturnTypeFromContinuation( cont, thisCtor )
    
    let result = papp(
        matchNCtorsIdxs( ctors.length, returnT ) as any,
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

export function pmatch<SDef extends StructDefinition>( struct: Term<PStruct<SDef>> ): PMatchOptions<SDef>
{
    const sDef = struct.type[1] as StructDefinition;
    if( !isStructDefinition( sDef ) )
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
                        struct as any,
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

        // here add all the missing ctors contiunuations
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

                    const res =  hoistedMatchCtors(
                        struct as any,
                        sDef,
                        ctorCbs as any
                    );

                    return res;
                })
            }
        );
    }

    return permutations( ctors ) as any;
}