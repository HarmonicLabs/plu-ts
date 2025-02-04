import { defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { DataI } from "@harmoniclabs/plutus-data";
import { _old_plet } from "../plet/old";
import { PrimType, StructCtorDef, StructDefinition, TermType, data, list } from "../../../type_system/types";
import { Term } from "../../Term";
import { PStruct, StructInstance } from "../../PTypes/PStruct";
import { _plet } from "../plet/minimal";
import { _punsafeConvertType } from "../punsafeConvertType/minimal";
import { _fromData } from "../std/data/conversion/fromData_minimal";
import { PMatchOptions, RawStructCtorCallback } from "./PMatchOptions";
import { isStructDefinition } from "../../../type_system/kinds/isWellFormedType";
import { PLam } from "../../PTypes/PFn/PLam";
import { PList } from "../../PTypes/PList";
import { PData } from "../../PTypes/PData/PData";
import { PType } from "../../PType";
import { papp } from "../papp";
import { getFields } from "./matchSingleCtorStruct";
import { IRConst } from "../../../IR/IRNodes/IRConst";
import { plam } from "../plam";
import { matchNCtorsIdxs } from "./matchNCtors";
import { addUtilityForType } from "../std/UtilityTerms/addUtilityForType";
import { getElemAtTerm } from "./getElemAtTerm";
import { termTypeToString } from "../../../type_system/utils";
import { capitalize } from "../../../utils/capitalize";
import { punsafeConvertType } from "../punsafeConvertType";
import { IRVar } from "../../../IR";
import { getCallStackAt } from "../../../utils/getCallStackAt";

function getReturnTypeFromContinuation(
    cont: RawStructCtorCallback,
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
    ctorCbs: (RawStructCtorCallback | Term<PLam<PList<PData>, PType>>)[],
    cbsReturnT: TermType | undefined
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
        const returnT = cbsReturnT ?? getReturnTypeFromContinuation( cont, thisCtorDef );

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
        cbsReturnT ?? (
            cont instanceof Term ?
                cont.type[2] as TermType :
                getReturnTypeFromContinuation( cont, thisCtorDef )
        )
    
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

    return instance;
}

export function pmatchStruct<SDef extends StructDefinition>( struct: Term<PStruct<SDef, {}>> ): PMatchOptions<SDef>
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
    const ctorCbs: RawStructCtorCallback[] = ctors.map( _ => undefined ) as any;

    // console.log("matching", ctors);
    // if( ctors[0] === "PoolStateRef" )
    // {
    //     console.log( getCallStackAt( 4 )?.__line__ );
    // }

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

                    const returnT = cb( getStructInstance(
                        new Term( list( data ), _ => new IRVar(0)),
                        sDef[ctor]
                    ) as any ).type;

                    // same stuff of previous ctors
                    ctorCbs[idx] = callback;

                    return hoistedMatchCtors(
                        struct as any,
                        sDef,
                        ctorCbs as any,
                        returnT
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
                    Math.max(
                        ...ctors
                        .map((ctor, i) =>
                            // only get length if a function was specified
                            typeof ctorCbs[i] === "function" ?
                                Object.keys( sDef[ ctor ] ).length :
                                -1
                        )
                    );
                    // .reduce( (prev, curr, i ) => Math.max( prev, curr ) , 0 );

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
                        ctorCbs,
                        returnT
                    );

                    return punsafeConvertType( res, returnT ) as any;
                })
            }
        );
    }

    return permutations( ctors ) as any;
}