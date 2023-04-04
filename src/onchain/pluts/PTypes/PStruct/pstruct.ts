import JsRuntime from "../../../../utils/JsRuntime";
import ObjectUtils from "../../../../utils/ObjectUtils";

import type { TermFn } from "../PFn";
import { PAsData, PData } from "../PData/PData";
import { PDataRepresentable } from "../../PType/PDataRepresentable";
import { UtilityTermOf, addUtilityForType } from "../../lib/addUtilityForType";

import { structDefToString, termTypeToString } from "../../type_system/utils";
import { Pair } from "../../../../types/structs/Pair";
import { Machine } from "../../../CEK";
import { pList } from "../../lib/std/list/const";
import { Data, DataConstr, isData } from "../../../../types/Data";
import { AliasT, GenericStructCtorDef, GenericStructDefinition, GenericTermType, PrimType, StructCtorDef, StructDefinition, StructT, TermType, alias, asData, data, int, struct, tyVar, unit } from "../../type_system/types";
import { ToPType } from "../../type_system/ts-pluts-conversion";
import { typeExtends, isStructDefinition, isStructType, isTaggedAsAlias } from "../../type_system";
import { Term } from "../../Term";
import { punsafeConvertType } from "../../lib/punsafeConvertType";
import { TermStruct } from "../../lib/std/UtilityTerms/TermStruct";
import { IRApp } from "../../../IR/IRNodes/IRApp";
import { IRConst } from "../../../IR/IRNodes/IRConst";
import { IRHoisted } from "../../../IR/IRNodes/IRHoisted";
import { IRNative } from "../../../IR/IRNodes/IRNative";
import { UPLCConst } from "../../../UPLC/UPLCTerms/UPLCConst";
import { BasePlutsError } from "../../../../errors/BasePlutsError";
import { PType } from "../../PType";

/**
 * intermediate class useful to reconize structs form primitives
 */
class _PStruct extends PData
{
    protected constructor()
    {
        super();
    }
}

export type StructInstance<SCtorDef extends StructCtorDef> = {
    readonly [Field in keyof SCtorDef]: UtilityTermOf<ToPType<SCtorDef[Field]>>
}

export type StructInstanceAsData<SCtorDef extends StructCtorDef> = {
    [Field in keyof SCtorDef]: Term<PAsData<any>> | Term<PStruct<any>> | Term<PData> | Term<undefined & PType>
}

export type PStruct<SDef extends StructDefinition> = {
    new(): _PStruct

    /**
     * @deprecated
     */
    readonly termType: StructT<SDef>;
    readonly type: StructT<SDef>;

    readonly fromDataTerm: TermFn<[PData],PStruct<SDef>>
    fromData: ( data: Term<PData> ) => Term<PStruct<SDef>>;

    readonly toDataTerm: TermFn<[PStruct<SDef>],PData>
    toData: ( data: Term<PStruct<SDef>> ) => Term<PData>;

} & PDataRepresentable & {
    [Ctor in keyof SDef]:
        ( ctorFields: StructInstanceAsData<SDef[Ctor]> ) => TermStruct<SDef>
}

type Includes<As extends any[], Elem extends any> =
    As extends [] ? false :
    As extends [ infer A extends any, ...infer RestAs extends any[] ] ?
    (
        Elem extends A ? true : Includes<RestAs,Elem>
    ): false;

export type RestrictedStructInstance<SCtorDef extends StructCtorDef, Fields extends (keyof SCtorDef)[]> = {
    [Field in keyof SCtorDef]: Includes<Fields, Field> extends true ? UtilityTermOf<ToPType<SCtorDef[Field]>> : never
}

// this needs to be here;
// not sure why it causes circluar dependecies when imported from "./cloneStructDef"
// since the only dependecy needed is `ObjectUtils` and the rest are just types...
function cloneStructCtorDef<CtorDef extends StructCtorDef>( ctorDef: Readonly<CtorDef> ): CtorDef
{
    const clone: CtorDef = {} as any;

    for( const fieldName in ctorDef )
    {
        clone[ fieldName ] = ctorDef[ fieldName ];
    }

    return clone;
}

// this needs to be here;
// not sure why it causes circluar dependecies when imported from "./cloneStructDef"
// since the only dependecy needed is `ObjectUtils` and the rest are just types...
function cloneStructDef<SDef extends StructDefinition>( def: Readonly<SDef> ): SDef
{
    const clone: SDef = {} as SDef;
    const ctors = Object.keys( def );

    for(let i = 0; i < ctors.length; i++ )
    {
        ObjectUtils.defineReadOnlyProperty(
            clone,
            ctors[ i ],
            cloneStructCtorDef( def[ ctors[i] ] )
        );
    }

    return clone;
}

function structCtorEq( a: StructCtorDef, b: StructCtorDef ): boolean
{
    if( a === b ) return true; // shallow eqality;

    const aFieldsNames = Object.keys( a );
    const bFieldsNames = Object.keys( b );

    if( aFieldsNames.length !== bFieldsNames.length ) return false;

    for( let i = 0; i < aFieldsNames.length; i++ )
    {
        if( aFieldsNames[i] !== bFieldsNames[i] ) return false;

        const thisAField = a[ aFieldsNames[i] ];
        const thisBField = b[ bFieldsNames[i] ];

        if(!(
            typeExtends( thisAField, thisBField ) &&
            typeExtends( thisBField, thisAField )
        )) return false;
    }

    return true;
}

export function structDefEq( a: StructDefinition, b: StructDefinition ): boolean
{
    if( a === b ) return true; // shallow eqality;

    const aCtors = Object.keys( a );
    const bCtors = Object.keys( b );

    if( aCtors.length !== bCtors.length ) return false;
    
    for( let i = 0; i < aCtors.length; i++ )
    {
        if( aCtors[i] !== bCtors[i] ) return false;
        
        if( !structCtorEq( a[ aCtors[i] ], b[ bCtors[i] ] ) ) return false;
    }

    return true;
}

function isStructInstanceOfDefinition<SCtorDef extends StructCtorDef>
    ( structInstance: StructInstanceAsData<any>, definition: SCtorDef )
    : structInstance is StructInstanceAsData<SCtorDef>
{
    const jsStructFieldsNames = Object.keys( structInstance );
    const defKeys = Object.keys( definition );
    
    return (
        jsStructFieldsNames.length === defKeys.length &&
        defKeys.every( defFieldName => jsStructFieldsNames.includes( defFieldName ) ) &&
        jsStructFieldsNames.every( fieldKey =>
            definition[fieldKey] !== undefined &&
            // every field's value is a Term
            structInstance[fieldKey] instanceof Term /*thisCtorDef[fieldKey]*/ &&
            typeExtends(
                structInstance[fieldKey].type,
                asData( definition[fieldKey] )
            )
        )
    );
}

const RESERVED_STRUCT_KEYS = Object.freeze([
    "eq",
    "eqTerm",
    "extract",
    "in"
]);

export function pstruct<StructDef extends StructDefinition>( def: StructDef ): PStruct<StructDef>
{
    JsRuntime.assert(
        isStructDefinition( def ),
        "cannot construct 'PStruct' type; struct definition is not constant: " + structDefToString( def ) 
    );

    class PStructExt extends _PStruct
    {
        static _isPType: true = true;
        // private constructors are not a thing at js runtime
        // in any case constructing an instance is useless
        // private allows the typescript LSP to rise errors (not runtime) whet trying to extend the class
        private constructor()
        {
            super();
        }

        static termType: [ PrimType.Struct, StructDef ];
        static type: [ PrimType.Struct, StructDef ];
        static fromData: <Ext extends PStructExt = PStructExt>( data: Term<PData> ) => Term<Ext>
        static toData:   <Ext extends PStructExt>( data: Term<Ext> ) => Term<PData>;
    }

    const thisStructType = struct( def );

    ObjectUtils.defineReadOnlyProperty(
        PStructExt,
        "type",
        thisStructType
    );

    ObjectUtils.defineReadOnlyProperty(
        PStructExt,
        "termType",
        thisStructType
    );

    ObjectUtils.defineReadOnlyProperty(
        PStructExt,
        "fromData",
        ( dataTerm: Term<PData> ): Term<PStructExt> => {

            JsRuntime.assert(
                typeExtends( dataTerm.type, data ),
                "trying to construct a Struct using static method 'fromData'; but the `Data` argument is not a `Data.Constr`"
            );

            // basically only mocking typescript here; still data
            return new Term(
                thisStructType,
                dataTerm.toIR,
                (dataTerm as any).isConstant
            );
        }
    );

    ObjectUtils.defineReadOnlyProperty(
        PStructExt,
        "toData",
        ( struct: Term<PStructExt> ): Term<PData> => {

            JsRuntime.assert(
                typeExtends( struct.type, thisStructType ),
                "trying to conver a struct using the wrong 'toData', perhaps you ment to call the 'toData' method of an other struct?"
            );

            return punsafeConvertType( struct, data )
        }
    );

    const constructors = Object.keys( def );
    JsRuntime.assert(
        constructors.length >= 1,
        "struct definition requires at least 1 constructor"
    );

    // define constructors
    for(let i = 0; i < constructors.length; i++)
    {
        const ctorName = constructors[ i ];

        ObjectUtils.defineReadOnlyProperty(
            PStructExt.prototype,
            ctorName,
            ( jsStruct: StructInstanceAsData<any> ): UtilityTermOf<PStructExt> => {

                JsRuntime.assert(
                    ObjectUtils.isObject( jsStruct ),
                    "cannot build a plu-ts structure if the input is not an object with named fields"
                );

                const thisCtorDef = def[ctorName];
                // const jsStructFieldsNames = Object.keys( jsStruct );
                
                // order of fields in the 'jsStruct' migth be different than the order of the definiton
                // to preserve the order we need to use the keys got form the ctor definition
                const ctorDefFieldsNames = Object.keys( thisCtorDef );

                for( const fieldName of ctorDefFieldsNames )
                {
                    if( RESERVED_STRUCT_KEYS.includes( fieldName ) )
                    {
                        throw new BasePlutsError(
                            `"${fieldName}" is a reserved struct key; it can't be used as custom struct property.`
                        )
                    }
                }

                if( ctorDefFieldsNames.length === 0 )
                {
                    return addUtilityForType(thisStructType)(
                        new Term(
                            thisStructType,
                            _dbn => new IRHoisted(
                                IRConst.data( new DataConstr( i, [] ) )
                            ),
                            true, // isConstant
                        )
                    ) as any;
                }

                // still we must be sure that the jsStruct has at least all the fields
                JsRuntime.assert(
                    isStructInstanceOfDefinition( jsStruct, thisCtorDef ),
                    "the fields passed do not match the struct definition for constructor: " + ctorName
                );

                let dataReprTerm: Term<any>;

                if(
                    ctorDefFieldsNames.every( fieldKey => 
                        (jsStruct[ fieldKey ] as any).isConstant
                    )
                )
                {
                    dataReprTerm = new Term(
                        thisStructType,
                        _dbn => {
                            return IRConst.data(
                                new DataConstr(
                                    i,
                                    ctorDefFieldsNames.map<Data>(
                                        fieldKey => {

                                            const _term = jsStruct[ fieldKey ];
                                            // toData_minimal( thisCtorDef[ fieldKey ] )
                                            // ( jsStruct[ fieldKey ] );
                                            const res = (Machine.evalSimple(
                                                _term
                                            ));

                                            if(!(res instanceof UPLCConst && isData( res.value ) ))
                                            {
                                                console.log("--------------------------------");
                                                console.log( ctorDefFieldsNames );
                                                console.log( fieldKey, termTypeToString( thisCtorDef[ fieldKey ] ) );
                                                console.log( res )
                                                // console.log( showUPLC( _term.toIR( _dbn ) ) )
                                                throw res;
                                            }
                                            
                                            return res.value as Data
                                        }
                                    )
                                )
                            );
                        },
                        true // isConstant
                    )
                }
                else
                {
                    dataReprTerm = new Term(
                        thisStructType,
                        dbn => {
    
                            return new IRApp(
                                new IRApp(
                                    IRNative.constrData,
                                    IRConst.int( i )
                                ),
                                pList( data )(
                                    ctorDefFieldsNames.map<Term<any>>(
                                        fieldKey => {
                                            const res = jsStruct[ fieldKey ];
                                            // toData_minimal( thisCtorDef[ fieldKey ] )( jsStruct[ fieldKey ] );

                                            return res;
                                        }
                                    )
                                ).toIR( dbn )
                            )
                        }
                    )
                }

                return addUtilityForType( thisStructType )( dataReprTerm ) as any;
            }
        );

        ObjectUtils.defineReadOnlyProperty(
            PStructExt,
            ctorName,
            (PStructExt.prototype as any)[ctorName]
        );
    }
    

    /*
    Type 'typeof PStructExt' is not assignable to type 'PStruct<StructDef>'
    
    Why is this?
    */
    return PStructExt as any;
}

function replaceAliasesWith(
    aliases: AliasT<[PrimType.Int]>[],
    replacements: (GenericTermType)[],
    sDef: GenericStructDefinition
): void
{
    const ctors = Object.keys( sDef );

    for( let i = 0; i < ctors.length; i++ )
    {
        const thisCtor = sDef[ ctors[ i ] ] as GenericStructCtorDef;
        const fields = Object.keys( thisCtor );

        for( let j = 0; j < fields.length; j++ )
        {
            const thisField = fields[i];
            const thisType = thisCtor[ thisField ] as TermType;

            if( isStructType( thisType ) )
            {
                const thisTypeSDefClone = cloneStructDef( thisType[1] as GenericStructDefinition );
                replaceAliasesWith(
                    aliases,
                    replacements,
                    thisTypeSDefClone
                );
                thisCtor[ thisField ] = struct( thisTypeSDefClone );
            }
            else if ( isTaggedAsAlias( thisType ) )
            {
                const idx = aliases.findIndex(
                    // object (pointer) equality 
                    alias => thisType === alias
                );
                if( idx < 0 ) continue;
                thisCtor[ thisField ] = replacements[ idx ];
            }
        }
    }
}

export function typeofGenericStruct(
    genStruct: ( ...tyArgs: TermType[] )
        => PStruct<StructDefinition>
): StructT<GenericStructDefinition>
{
    const nArgs = genStruct.length;
    const aliases: AliasT<[PrimType.Int]>[] = Array( nArgs );
    const replacements: [ symbol ][] = Array( nArgs );

    for( let i = 0; i < nArgs; i++ )
    {
        aliases[i] = alias( int );
        replacements[i] = tyVar();
    };

    const PStruct_ = genStruct(
        ...aliases
    );

    const sDef = cloneStructDef(
        PStruct_.type[1]
    );

    replaceAliasesWith(
        aliases,
        replacements,
        sDef
    );

    return struct( sDef ) as any;
}

/**
 * @param getDescriptor 
 * @returns
 * 
 * @deprecated
 * 
 * use a function that reutrns a struct based on the specfied types instead
 */
export function pgenericStruct<ConstStructDef extends StructDefinition, TypeArgs extends [ TermType, ...TermType[] ]>
    (
        getDescriptor: ( ...tyArgs: TypeArgs ) => PStruct<ConstStructDef>
    ): (
        (<TyArgs extends TypeArgs>( ...tyArgs: TyArgs ) => PStruct<ConstStructDef>) &
        { type: [ PrimType.Struct, GenericStructDefinition ] }
    )
{
    console.warn([
        "you are using 'pgenericStruct' to create a paramterized sctruct;",
        "this method is deprecated since v0.2.0 and might behave incorrectly",
        "consider updating your code by defining your parametrized struct as a function that reutrns a determined struct"
    ].join(" "))
    /*
    lambda called immediately

    needed to allow the creation of a **new** cache per each generic struct
    cannot create a cache directly in the ```pgenericStruct``` function because that would be global
    for **every** generic structure;
    */
    return (() => {
        const tyArgsCache: Pair<string, PStruct<ConstStructDef>>[] = []

        return ObjectUtils.defineReadOnlyProperty(
            ( ...tyArgs: TypeArgs ): PStruct<ConstStructDef> => {

                const thisTyArgsKey = tyArgs.map( termTypeToString ).join('|');
                const keys = tyArgsCache.map( pair => pair.fst );

                if( keys.includes( thisTyArgsKey ) )
                {
                    const cachedResult = tyArgsCache.find( pair => pair.fst === thisTyArgsKey );
                    if( cachedResult !== undefined ) return cachedResult.snd;
                }
                
                let result = getDescriptor(
                        /*
                        Argument of type '[TermType, ...TermType[]]' is not assignable to parameter of type 'TypeArgs'.
                            '[TermType, ...TermType[]]' is assignable to the constraint of type 'TypeArgs',
                            but 'TypeArgs' could be instantiated with a different subtype of constraint
                            '[TermType, ...TermType[]]'.ts(2345)
                        */
                        //@ts-ignore
                        tyArgs[0], ...tyArgs.slice(1)
                    );

                if( !( result instanceof PDataRepresentable ) ) result = pstruct(result);

                tyArgsCache.push( new Pair<string, PStruct<ConstStructDef>>( thisTyArgsKey, result ) );

                return result;
            },
            "type",
            typeofGenericStruct( getDescriptor as any )
        ) as any;
    })();
};
