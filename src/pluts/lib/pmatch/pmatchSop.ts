import { defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { capitalize } from "../../../utils/capitalize";
import { PSop, SopInstance } from "../../PTypes/PSoP/psop";
import { Term } from "../../Term";
import { isSopDefinition } from "../../../type_system/kinds/isWellFormedType";
import { SopCtorDef, SopDefinition, fn } from "../../../type_system/types";
import { PMatchOptions } from "./PMatchOptions";
import { PType } from "../../PType";
import { _old_plet } from "../plet/old";
import { plam } from "../plam";
import { IRCase } from "../../../IR/IRNodes/IRCase";
import { addUtilityForType } from "../std/UtilityTerms/addUtilityForType";
import { makeMockUtilityTerm } from "../std/UtilityTerms/mockUtilityTerms/makeMockUtilityTerm";
import { showUPLC } from "@harmoniclabs/uplc";
import { IRFunc } from "../../../IR/IRNodes/IRFunc";
import { IRVar } from "../../../IR";


export function pmatchSop<SDef extends SopDefinition>( sopTerm: Term<PSop<SDef, {}>> ): PMatchOptions<SDef>
{
    const sDef = sopTerm.type[1] as SopDefinition;
    if( !isSopDefinition( sDef ) )
    {
        console.log( sopTerm, sopTerm.type );
        /**
         * @todo add proper error
         */
        throw new Error("unexpected struct type while running 'pmatch'; " +
            "\ntype expected to be a 'ConstantableStructDefiniton' was: " // + termTypeToString( sopTerm.type )
        );
    }

    const ctors = Object.keys( sDef );
    const continuationTerms: Term<PType>[] = ctors.map( _ctorName => undefined ) as any;

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

            const ctorDef = sDef[ctor];

            const matcher = "on" + capitalize( ctor );
            const result = {};
            defineReadOnlyProperty(
                result,
                matcher,
                ( cb: ( instance: SopInstance<SDef[typeof ctor]> ) => Term<PType> ): Term<PType> => {

                    let returnT = cb( mockSopInstance( ctorDef ) as any ).type;

                    const contTerm = makeConstrContinuationTerm( ctorDef, cb );

                    // same stuff of previous ctors
                    continuationTerms[idx] = contTerm;

                    return new Term<PType>(
                        returnT,
                        (cfg, dbn) => new IRCase(
                            sopTerm.toIR( cfg, dbn ),
                            continuationTerms.map( term => term.toIR( cfg, dbn ) )
                        )
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
                ( cb: ( instance: SopInstance<SopCtorDef> ) => Term<PType> ) => {
                    continuationTerms[idx] = makeConstrContinuationTerm( sDef[ctor], cb )

                    return permutations( missingCtors.filter( c => c !== ctor ) )
                }
            ); 
        });

        return defineReadOnlyProperty(
            remainingCtorsObj,
            "_",
            ( cb: ( _: SopInstance<{}> ) => Term<PType> ) => {

                const returnT = cb( mockSopInstance( sDef[ctors[0]] ) as any ).type;
            
                for( let i = 0; i < continuationTerms.length; i++ )
                {
                    if( typeof continuationTerms[i] === "undefined" )
                    {
                        continuationTerms[i] = makeConstrContinuationTerm( sDef[ctors[i]], cb );
                    }
                }

                return new Term<PType>(
                    returnT,
                    (cfg, dbn) => new IRCase(
                        sopTerm.toIR(cfg, dbn ),
                        continuationTerms.map( term => term.toIR( cfg, dbn ) )
                    )
                );;
            }
        );
    }

    return permutations( ctors ) as any;
}

function mockSopInstance<SCtorDef extends SopCtorDef>( ctorDef: SCtorDef ): SopInstance<SCtorDef>
{
    const fields = Object.keys( ctorDef );
    const result: SopInstance<SCtorDef> = {} as any;

    for( let i = 0; i < fields.length; i++ )
    {
        const field = fields[i];

        Object.defineProperty(
            result, field, {
                value: makeMockUtilityTerm( ctorDef[field] ),
                writable: false,
                enumerable: true,
                configurable: false
            }
        );
    }

    return result;
}

function makeConstrContinuationTerm<SCtorDef extends SopCtorDef>(
    ctorDef: SCtorDef,
    cb: ( sInstance: SopInstance<SCtorDef> ) => Term<PType>
): Term<PType>
{
    let returnT = cb( mockSopInstance( ctorDef ) as any ).type;

    const fields = Object.keys( ctorDef );
    const nFields = fields.length;

    if( nFields === 0 ) return cb({} as any);

    return new Term<PType>(
        fn(
            fields.map( f => ctorDef[f] ) as any,
            returnT
        ),
        (cfg, dbn) => {

            const fstArgLambdaPtr = dbn + BigInt( 1 );

            const sInstance: SopInstance<SCtorDef> = {} as any;

            for( let i = 0; i < nFields; i++ )
            {
                const f = fields[i];
                const t = ctorDef[f];
                Object.defineProperty(
                    sInstance, f, {
                        value: addUtilityForType( t )(
                            new Term<PType>(
                                t,
                                (cfg, dbnAccessLevel) => new IRVar(
                                    dbnAccessLevel - (fstArgLambdaPtr + BigInt( i ))
                                )
                            )
                        ),
                        writable: false,
                        enumerable: true,
                        configurable: false
                    }
                )
            }

            const body = cb( sInstance );

            return new IRFunc( nFields, body.toIR( cfg, dbn + BigInt( nFields ) ) );
        }
    )
}