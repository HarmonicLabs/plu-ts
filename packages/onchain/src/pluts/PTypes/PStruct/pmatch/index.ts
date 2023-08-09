
import { PStruct, StructInstance } from "../pstruct";
import { PType } from "../../../PType";
import { Term } from "../../../Term";
import { PData } from "../../PData/PData";
import { PLam } from "../../PFn/PLam";
import { PList } from "../../PList";
import { getFields } from "../matchSingleCtorStruct";
import { papp } from "../../../lib/papp";
import { UtilityTermOf, addUtilityForType } from "../../../lib/addUtilityForType";
import { TermList } from "../../../lib/std/UtilityTerms/TermList";
import { plam } from "../../../lib/plam";
import { TermFn } from "../../PFn";
import { LamT, PrimType, StructCtorDef, StructDefinition, TermType, data, fn, lam, list } from "../../../type_system/types";
import { isStructDefinition, termTypeToString } from "../../../type_system";
import { phead } from "../../../lib/builtins/list";
import { _fromData } from "../../../lib/std/data/conversion/fromData_minimal";
import { _old_plet } from "../../../lib/plet/old";
import { _plet } from "../../../lib/plet/minimal";
import { defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { DataI } from "@harmoniclabs/plutus-data";
import { IRTerm } from "../../../../IR/IRTerm";
import { IRVar } from "../../../../IR/IRNodes/IRVar";
import { IRNative } from "../../../../IR/IRNodes/IRNative";
import { IRApp } from "../../../../IR/IRNodes/IRApp";
import { IRHoisted } from "../../../../IR/IRNodes/IRHoisted";
import { IRFunc } from "../../../../IR/IRNodes/IRFunc";
import { IRConst } from "../../../../IR/IRNodes/IRConst";
import { IRForced } from "../../../../IR/IRNodes/IRForced";
import { IRError } from "../../../../IR/IRNodes/IRError";
import { IRDelayed } from "../../../../IR/IRNodes/IRDelayed";
import { _punsafeConvertType } from "../../../lib/punsafeConvertType/minimal";

const elemAtCache: { [n: number]: TermFn<[ PList<PData> ], PData > } = {};

export function getElemAtTerm( n: number ): TermFn<[ PList<PData> ], PData >
{
    if( n < 0 || n !== Math.round(n) )
    throw new Error(
        "unexpected index in pmatch field extraction"
    );

    if( elemAtCache[n] !== undefined ) return elemAtCache[n];

    if( n === 0 ) return phead( data );

    let uplc: IRTerm = new IRVar(0);

    const initialN = n;
    while( n > 0 )
    {
        uplc = new IRApp( IRNative.tailList, uplc );
        n--;
    }

    uplc = new IRHoisted(
        new IRFunc( 1,
            new IRApp(
                IRNative.headList,
                uplc
            )
        )
    );

    const term = new Term( lam( list(data), data ), _dbn => uplc );

    defineReadOnlyProperty(
        term, "$",
        ( lst: Term<PList<PData>>) => 
            new Term(
                data,
                dbn => new IRApp( uplc.clone(), lst.toIR(dbn) )
            )
    );

    elemAtCache[initialN] = term as any;
    return term as any;
}

function getStructInstance<CtorDef extends StructCtorDef>
    ( fieldsList: Term<PList<PData>>, ctorDef: CtorDef ): StructInstance<CtorDef>
{
    const instance: StructInstance<CtorDef> = {} as any;
    const fieldNames = Object.keys( ctorDef );

    
    for( let i = 0; i < fieldNames.length; i++ )
    {
        const fieldName = fieldNames[i];
        const fieldType = ctorDef[fieldName];

        Object.defineProperty(
            instance, fieldName,
            {
                value: addUtilityForType( fieldType )(
                    _punsafeConvertType(
                        _plet( 
                            _fromData( fieldType )(
                                getElemAtTerm( i ).$( fieldsList )
                            )
                        ),
                        fieldType
                    )
                ),
                writable: false,
                enumerable: true,
                configurable: false
            }
        );
    }

    /**
     * to remove in 1.0.0
     * @deprecated
     */
    Object.defineProperty(
        instance, "extract",
        {
            value: ( ..._fields: any[] ) => {

                return  {
                    in: ( cb: ( instance: StructInstance<CtorDef> ) => Term<PType> ): Term<PType> => cb( instance )
                }
            },
            writable: false,
            enumerable: true,
            configurable: false
        }
    );


    return instance;
}

function capitalize<str extends string>( s: str ): Capitalize<str>
{
    if( s.length === 0 ) return s as any;
    return (s[0].toUpperCase() + s.slice( 1 )) as any;
}

type RawCtorCallback = ( mathcedCtorsFields: Term<PList<PData>> ) => Term<PType>;

type CtorCallback<SDef extends StructDefinition> = ( instance: StructInstance<SDef[keyof SDef & string]> ) => Term<PType>;

type EmptyObject = { [x: string | number | symbol ]: never };

type MatchRest<PReturnT extends PType> = {
    _: ( continuation: ( mathcedCtorsFields: TermList<PData> ) => Term<PReturnT> ) => UtilityTermOf<PReturnT>
}

type TypedPMatchOptions<SDef extends StructDefinition, PReturnT extends PType> = {
    [Ctor in keyof SDef as `on${Capitalize<string & Ctor>}`]
        : ( cb: ( mathcedCtorsFields: StructInstance<SDef[Ctor]> ) => Term<PReturnT> )
            =>  Omit<SDef,Ctor> extends EmptyObject ?
                UtilityTermOf<PReturnT> :
                TypedPMatchOptions<Omit<SDef,Ctor>, PReturnT>
} & MatchRest<PReturnT>

type MathcedCtorsFields<SCtorDef extends StructCtorDef> = StructInstance<SCtorDef> & {
    /**
     * @deprecated
     * you can use simple dot notation instead
    **/
    extract: ( ...fields: (keyof SCtorDef)[] ) => {
        /**
         * @deprecated
        **/
        in: <PExprReturn extends PType>( cb: ( mathcedCtorsFields: StructInstance<SCtorDef> ) => Term<PExprReturn> ) => Term<PExprReturn> 
    }
}

export type PMatchOptions<SDef extends StructDefinition> = {
    [Ctor in keyof SDef as `on${Capitalize<string & Ctor>}`]
        : <PReturnT extends PType>( cb: ( mathcedCtorsFields: MathcedCtorsFields<SDef[Ctor]> ) => Term<PReturnT> )
            =>  Omit<SDef,Ctor> extends EmptyObject ?
                UtilityTermOf<PReturnT> :
                TypedPMatchOptions<Omit<SDef,Ctor>, PReturnT>
} & {
    _: <PReturnT extends PType>( continuation: ( mathcedCtorsFields: TermList<PData> ) => Term<PReturnT> ) => UtilityTermOf<PReturnT>
}

const matchNCtorsIdxsCache: { [n: number]: Term<any> } = {};

export function matchNCtorsIdxs( _n: number, returnT: TermType )
{
    if( _n <= 1 ) throw new Error("mathcing ill formed struct data");
    const n = Math.round( _n );
    if( _n !== n ) throw new Error("number of ctors to match must be an integer");

    if( matchNCtorsIdxsCache[n] !== undefined ) return matchNCtorsIdxsCache[n];

    const continuationT = lam( list(data), returnT );

    // built immediately; not at compilation

    // all this mess just to allow hoisting
    // you have got to reason backwards to understand the process

    let body: IRTerm = new IRError("matchNCtorsIdxs; unmatched");

    for(let i = n - 1; i >= 0; i-- )
    {
        // pif( continuationT ).$( isCtorIdx.$( pInt( i ) ) )
        // .then( continuation_i )
        // .else( ... )
        body = new IRForced(
            new IRApp(
                new IRApp(
                    new IRApp(
                        IRNative.strictIfThenElse,
                        new IRApp(
                            new IRVar( 0 ),         // isCtorIdx // last variable introduced (see below)
                            IRConst.int( i )        // .$( pInt( i ) )
                        )
                    ),
                    new IRDelayed( new IRVar(
                        2 + // isCtorIdx and structConstrPair are in scope
                        i   // continuation_i
                    ) ) // then matching continuation
                ),
                new IRDelayed( body ) // else go check the next index; or error if it was last possible index
            )
        );
    }

    // plet( peqInt.$( pfstPir(...).$( structConstrPair ) ) ).in( isCtorIdx => ... )
    body = new IRApp(
        new IRFunc( 1, // isCtorIdx
            body
        ),
        // peqInt.$( pfstPir(...).$( structConstrPair ) )
        new IRApp(
            IRNative.equalsInteger,
            new IRApp(
                IRNative.fstPair,
                new IRVar( 0 ) // structConstrPair // last variable introduced (see below)
            )
        )
    );

    // <whatever continuation was matched>.$( psndPair(...).$( structConstrPair ) )
    // aka passing the fields to the continuation
    body = new IRApp(
        body,
        new IRApp(
            IRNative.sndPair,
            new IRVar( 0 ), // structConstrPair // last variable introduced (see below)
        )
    );

    // plet( punConstrData.$( structData ) )  ).in( structConstrPair => ... )
    body = new IRApp(
        new IRFunc( 1, // structConstrPair
            body
        ),
        new IRApp(
            IRNative.unConstrData,
            new IRVar( n ) // structData
        )
    );

    for(let i = n - 1; i >= 0; i-- )
    {
        body = new IRFunc( 1, // continuation n - 1 - i
            body
        );
    }

    // seriously, all this mess for this IRHoisted
    body = new IRHoisted(
        new IRFunc( 1, // structData
            body
        )
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

function getReturnTypeFromContinuation(
    cont: RawCtorCallback,
    ctorDef: StructCtorDef
): TermType
{
    return cont( 
            // mock the fields
            // we are not really interested in the result here; only in the type
            new Term(
                list( data ),
                _dbn =>
                    IRConst.listOf( data )(
                        (new Array( Object.keys( ctorDef ).length ))
                        .fill( new DataI( 0 ) )
                    )
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
    structData: Term<PStruct<SDef, any>>,
    sDef: SDef,
    ctorCbs: (RawCtorCallback | Term<PLam<PList<PData>, PType>>)[],
) : Term<PType>
{
    const length = ctorCbs.length;

    if( length <= 0 ) throw new Error("trying to match ill formed struct");

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
                throw new Error(
                    "pmatch continuation was not a lambda"
                );
            }

            return papp(
                cont,
                papp(
                    getFields,
                    structData as any as Term<PData>
                )
            );
        }

        const thisCtorDef = sDef[ ctors[0] ] as SDef[string];
        const returnT = getReturnTypeFromContinuation( cont, thisCtorDef );

        return papp(
            plam( list(data), returnT )( cont ),
            papp(
                getFields,
                structData as any as Term<PData>
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

    const thisCtorDef = sDef[ Object.keys( sDef )[ ctorIdx ] ] as SDef[string];

    let returnT: TermType | undefined = 
        cont instanceof Term ?
            cont.type[2] as TermType :
            getReturnTypeFromContinuation( cont, thisCtorDef )
    
    let result = papp(
        matchNCtorsIdxs( ctors.length, returnT ) as any,
        structData
    );

    for( let i = ctors.length - 1; i >= 0 ; i-- )
    {
        const thisCont = ctorCbs[i];
        const thisCtorDef = sDef[ ctors[i] ] as SDef[string];
        result = papp(
            result as any,
            thisCont instanceof Term ? thisCont : 
            plam( list(data), returnT ?? getReturnTypeFromContinuation( thisCont, thisCtorDef ) )
            ( thisCont )
        );
    }

    return result;
}

export function pmatch<SDef extends StructDefinition>( struct: Term<PStruct<SDef, {}>> ): PMatchOptions<SDef>
{
    const sDef = struct.type[1] as StructDefinition;
    if( !isStructDefinition( sDef ) )
    {
        /**
         * @todo add proper error
         */
        throw new Error("unexpected struct type while running 'pmatch'; " +
            "\ntype expected to be a 'ConstantableStructDefiniton' was: " + termTypeToString( struct.type )
        );
    }

    const ctors = Object.keys( sDef );
    const ctorCbs: RawCtorCallback[] = ctors.map( _ => undefined ) as any;

    function indexOfCtor( ctor: string ): number
    {
        const res = ctors.indexOf( ctor )
        if( res < 0 )
        {
            throw new Error(
                "internal function 'indexOfCtor' in 'definePMatchPermutations' couldn't find the constructor \"" + ctor +
                "\" between [" + ctors.map( c => c.toString() ).join(',') + ']'
            );
        }
        return res;
    }

    function permutations( missingCtors: string[] )
    {
        if( missingCtors.length <= 0 ) return {};

        // last permutation
        // returns the final expression
        if( missingCtors.length === 1 )
        {
            const ctor = missingCtors[0] as keyof SDef & string;
            const idx = indexOfCtor( ctor );

            const matcher = "on" + capitalize( ctor );
            const result = {};
            defineReadOnlyProperty(
                result,
                matcher,
                ( cb: ( instance: StructInstance<SDef[typeof ctor]> ) => Term<PType> ): Term<PType> => {

                    // build the `StructInstance` input from the struct fields
                    const callback = ( mathcedCtorsFields: Term<PList<PData>> ): Term<PType> => {

                        return cb( getStructInstance( mathcedCtorsFields, sDef[ctor] ) as any )
                    };

                    // same stuff of previous ctors
                    ctorCbs[idx] = callback;

                    return hoistedMatchCtors(
                        struct as any,
                        sDef,
                        ctorCbs as any
                    );

                }
            );

            return defineReadOnlyProperty(
                result,
                "_",
                (result as any)[matcher]
            );
        }

        const remainingCtorsObj = {};

        // here add all the missing ctors contiunuations
        missingCtors.forEach( ctor => {

            const idx = indexOfCtor( ctor );

            defineReadOnlyProperty(
                remainingCtorsObj,
                "on" + capitalize( ctor ),
                ( cb: ( instance: StructInstance<StructCtorDef> ) => Term<PType> ) => {
                    ctorCbs[idx] = ( fieldsList ) => cb( getStructInstance( fieldsList, sDef[ctor] ) );

                    return permutations( missingCtors.filter( c => c !== ctor ) )
                }
            ); 
        });

        return defineReadOnlyProperty(
            remainingCtorsObj,
            "_",
            ( cb: ( _: Term<PList<PData>> ) => Term<PType> ) => {

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
                
                return _old_plet(
                    plam( list(data), returnT )( cb )
                ).in( othCtorsContinuation => {

                    for( let i = 0; i < ctorCbs.length; i++ )
                    {
                        if( typeof ctorCbs[i] !== "function" )
                        {
                            ctorCbs[i] = othCtorsContinuation as any;
                        }
                    }

                    const res = hoistedMatchCtors(
                        /*
                         Argument of type 'Term<PStruct<SDef>>' is not assignable to parameter of type 'Term<PStruct<StructDefinition>>'.
                            Type 'PStruct<SDef>' is not assignable to type 'PStruct<StructDefinition>'.
                        */
                        struct as any,
                        sDef,
                        ctorCbs
                    );

                    return res;
                })
            }
        );
    }

    return permutations( ctors ) as any;
}