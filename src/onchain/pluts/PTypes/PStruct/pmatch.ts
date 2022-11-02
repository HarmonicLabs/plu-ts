import { ConstantableStructCtorDef, RestrictedStructInstance, ConstantableStructDefinition, PStruct } from ".";
import BasePlutsError from "../../../../errors/BasePlutsError";
import JsRuntime from "../../../../utils/JsRuntime";
import ObjectUtils from "../../../../utils/ObjectUtils";
import UPLCTerm from "../../../UPLC/UPLCTerm";
import Application from "../../../UPLC/UPLCTerms/Application";
import Builtin from "../../../UPLC/UPLCTerms/Builtin";
import Delay from "../../../UPLC/UPLCTerms/Delay";
import ErrorUPLC from "../../../UPLC/UPLCTerms/ErrorUPLC";
import Force from "../../../UPLC/UPLCTerms/Force";
import HoistedUPLC from "../../../UPLC/UPLCTerms/HoistedUPLC";
import Lambda from "../../../UPLC/UPLCTerms/Lambda";
import UPLCConst from "../../../UPLC/UPLCTerms/UPLCConst";
import UPLCVar from "../../../UPLC/UPLCTerms/UPLCVar";
import { punConstrData, psndPair, ptrace } from "../../Prelude/Builtins";
import { pindexList } from "../../Prelude/List";
import TermList from "../../Prelude/UtilityTerms/TermList";
import PType from "../../PType";
import { pintToStr } from "../../stdlib/pintToStr";
import { plet, papp, punsafeConvertType, phoist, plam, pfn } from "../../Syntax";
import Term from "../../Term";
import { data, fn, int, lam, list, TermType, tyVar } from "../../Term/Type";
import { isConstantableStructDefinition } from "../../Term/Type/kinds";
import { termTypeToString } from "../../Term/Type/utils";
import PData from "../PData";
import { getFromDataForType } from "../PData/conversion";
import PLam from "../PFn/PLam";
import PInt, { pInt } from "../PInt";
import PList from "../PList";
import matchSingleCtorStruct from "./matchSingleCtorStruct";


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
    return plet( getFromDataForType( ctorDef[ allFieldsNames[ idx ] ] )(
        papp( elemAt, pInt( idx ) ) )
    ).in( value => {

        ObjectUtils.defineNormalProperty(
            partialExtracted,
            allFieldsNames[ idx ],
            value
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

            const fieldsIdxs = Object.freeze(
                fields
                .map( f => fieldsNames.findIndex( fName => fName === f ) )
                // ignore fields not present in the definion or duplicates
                .filter( (idx, i, thisArr ) => idx >= 0 && thisArr.indexOf( idx ) === i )
                .sort( ( a,b ) => a < b ? -1 : ( a === b ? 0 : 1 ) )
            );

            return ObjectUtils.defineReadOnlyProperty(
                {},
                "in",
                <PExprResult extends PType>( expr: ( extracted: RestrictedStructInstance<CtorDef,Fields> ) => Term<PExprResult> ): Term<PExprResult> => {

                    if( fieldsIdxs.length === 0 ) return expr({} as any);

                    return plet( pindexList( data ).$( _fieldsList ) ).in( elemAt =>
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

function capitalize<s extends string>( str: s ): Capitalize<s>
{
    return str.length === 0 ? '' : str[0].toUpperCase() + str.slice(1) as any;
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

function hoistedMatchCtors<SDef extends ConstantableStructDefinition>(
    structData: Term<PData>,
    sDef: SDef,
    ctorCbs: (CtorCallback<SDef> | Term<PLam<PList<PData>, PType>>)[]
)
    : Term<PType>
{
    const length = ctorCbs.length;

    if( length <= 0 ) throw new BasePlutsError("trying to match ill formed struct");

    const returnT = tyVar("return type match single ctor");
    const ctors = Object.keys(sDef);

    if( length === 1 )
    {
        const cont = ctorCbs[0];
        return papp(
            papp(
                matchSingleCtorStruct,
                structData
            ),
            cont instanceof Term ?
            cont :
            plam( list(data), returnT )
            ( fieldsListData => 
                cont( 
                    defineExtract( 
                        fieldsListData, 
                        sDef[ ctors[0] ] as SDef[string]
                    ) 
                )
            )
        );
    }
    
    let result = papp(
        matchNCtorsIdxs( ctors.length, returnT ) as any,
        structData
    );

    for( let i = ctors.length - 1; i >= 0 ; i-- )
    {
        const thisCont = ctorCbs[i];
        result = papp(
            result as any,
            thisCont instanceof Term ?
            thisCont : 
            plam( list(data), returnT )
            ( fieldsListData => 
                thisCont( 
                    defineExtract( 
                        fieldsListData, 
                        sDef[ ctors[i] ] as SDef[string]
                    ) 
                )
            ) as any
        );
    }

    return result;
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
                
                return plet(
                    plam( list(data), tyVar("_any_pmatch_cont") )( cb )
                ).in( othCtorsContinuation => {

                    for( let i = 0; i < ctorCbs.length; i++ )
                    {
                        if( ctorCbs[i] === undefined )
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

        return remainingCtorsObj;
    }

    return permutations( ctors ) as any;
}