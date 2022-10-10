import Pair from "../../../../types/structs/Pair";
import JsRuntime from "../../../../utils/JsRuntime";
import ObjectUtils from "../../../../utils/ObjectUtils";
import { pConstrToData } from "../../Prelude/Builtins";
import { PDataRepresentable } from "../../PType";
import Term from "../../Term";
import Type, { ConstantableStructType, ConstantableTermType, GenericStructType, struct, structType, StructType, TermType, ToPType } from "../../Term/Type";
import { typeExtends } from "../../Term/Type/extension";
import { isConstantableTermType, isWellFormedType } from "../../Term/Type/kinds";
import { termTypeToString } from "../../Term/Type/utils";
import PData from "../PData";
import { getToDataForType } from "../PData/conversion";
import { pInt } from "../PInt";
import { pList } from "../PList";

/**
 * intermediate class useful to reconize structs form primitives
 */
class _PStruct extends PDataRepresentable
{
    protected constructor()
    {
        super();
    }
}

export type ConstantableStructCtorDef = {
    [field: string | number]: ConstantableTermType | ConstantableStructType
}

export type GenericStructCtorDef = {
    [field: string | number]: ConstantableTermType | StructType | [ symbol ]
}

export type StructCtorDef = ConstantableStructCtorDef | GenericStructCtorDef;

export type StructInstance<SCtorDef extends StructCtorDef> = {
    [Field in keyof SCtorDef]: Term<ToPType<SCtorDef[Field]>>
}

type Includes<As extends any[], Elem extends any> =
    As extends [] ? false :
    As extends [ infer A extends any, ...infer RestAs extends any[] ] ?
    (
        Elem extends A ? true : Includes<RestAs,Elem>
    ): false;

export type RestrictedStructInstance<SCtorDef extends StructCtorDef, Fields extends (keyof SCtorDef)[]> = {
    [Field in keyof SCtorDef]: Includes<Fields, Field> extends true ? Term<ToPType<SCtorDef[Field]>> : never
}

export type ConstantableStructDefinition = {
    [constructor: string]: ConstantableStructCtorDef
}

export type GenericStructDefinition = {
    [constructor: string]: GenericStructCtorDef
}

export type StructDefinition = GenericStructDefinition;

function cloneStructCtorDef<CtorDef extends StructCtorDef>( ctorDef: Readonly<CtorDef> ): CtorDef
{
    const clone: CtorDef = {} as any;

    for( const fieldName in ctorDef )
    {
        clone[ fieldName ] = ctorDef[ fieldName ];
    }

    return clone;
}

export function cloneStructDef<SDef extends StructDefinition>( def: Readonly<SDef> ): SDef
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

function getIsStructDefWithTermTypeCheck<SDef extends StructDefinition>( termTypeCheck: ( t: TermType ) => boolean )
    : ( def: object ) => def is SDef
{
    return ( def: object ): def is SDef => {

        if( !ObjectUtils.isObject( def ) ) return false;
    
        const ctorsNames = Object.keys( def );
    
        // required at least one constructor
        if( ctorsNames.length <= 0 ) return false;
        
        if( !ctorsNames.every(
                // all constructor names
                ctorName =>
                    // cannot be enpty
                    ctorName.length > 0 &&
                    // cannot start with a number
                    Number.isNaN( parseFloat( ctorName[0] ) )
            )
        ) return false;
    
        for( let i = 0; i < ctorsNames.length; i++ )
        {
            const thisCtorFields = ( def as any)[ ctorsNames[i] ] as StructCtorDef;
            const thisCtorFieldsNames = Object.keys( thisCtorFields );
    
            if(
                !thisCtorFieldsNames.every( field => termTypeCheck( thisCtorFields[ field ] ) )
            ) return false;
        }
    
        return true;

    }
}

export const isStructDefinition = getIsStructDefWithTermTypeCheck(
    isWellFormedType
);

export const isConstantableStructDefinition = getIsStructDefWithTermTypeCheck<ConstantableStructDefinition>(
    isConstantableTermType
);

export type PStruct<SDef extends ConstantableStructDefinition> = {
    new(): _PStruct

    termType: TermType;
    fromData: ( data: Term<PData> ) => Term<PStruct<SDef>>;
    toData: ( data: Term<PStruct<SDef>> ) => Term<PData>;

} & PDataRepresentable & {
    [Ctor in keyof SDef]:
        //@ts-ignore Type 'StructDefinition[Ctor]' does not satisfy the constraint 'StructCtorDef'.
        ( ctorFields: StructInstance<SDef[Ctor]> ) => Term<PStruct<SDef>>
}

function isStructInstanceOfDefinition<SCtorDef extends StructCtorDef>
    ( structInstance: StructInstance<any>, definition: SCtorDef )
    : structInstance is StructInstance<SCtorDef>
{
    const jsStructFieldsNames = Object.keys( structInstance );
    
    return (
        jsStructFieldsNames.length === Object.keys( definition ).length &&
        jsStructFieldsNames.every( fieldKey =>
            definition[fieldKey] !== undefined &&
            // every field's value is a Term
            structInstance[fieldKey] instanceof Term /*thisCtorDef[fieldKey]*/ &&
            typeExtends(
                structInstance[fieldKey].type,
                definition[fieldKey]
            )
        )
    );
}



export default function pstruct<StructDef extends ConstantableStructDefinition>( def: StructDef ): PStruct<StructDef>
{
    JsRuntime.assert(
        isStructDefinition( def ),
        "cannot construct 'PStruct' type; invalid struct definition"
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

        static termType: TermType;
        static fromData: <Ext extends PStructExt = PStructExt>( data: Term<PData> ) => Term<Ext>
        static toData:   <Ext extends PStructExt>( data: Term<Ext> ) => Term<PData>;

    }

    const thisStructType = Type.Struct( def );

    ObjectUtils.defineReadOnlyProperty(
        PStructExt.prototype,
        "termType",
        thisStructType
    );

    ObjectUtils.defineReadOnlyProperty(
        PStructExt.prototype,
        "fromData",
        ( data: Term<PData> ): Term<PStructExt> => {

            JsRuntime.assert(
                typeExtends( data.type, Type.Data.Constr ),
                "trying to construct a Struct using static method 'fromData'; but the `Data` argument is not a `Data.Constr`"
            );

            return ObjectUtils.defineReadOnlyHiddenProperty(
                // basically only mocking typescript here; still data
                new Term(
                    thisStructType,
                    data.toUPLC
                ),
                "_pIsConstantStruct",
                false
            );
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
            ( jsStruct: StructInstance<any> ): Term<PStructExt> => {
                
                JsRuntime.assert(
                    ObjectUtils.isObject( jsStruct ),
                    "cannot build a plu-ts structure if the input is not an object with named fields"
                );

                const thisCtorDef = def[ctorName];
                const jsStructFieldsNames = Object.keys( jsStruct );

                JsRuntime.assert(
                    isStructInstanceOfDefinition( jsStruct, thisCtorDef ),
                    "the fields passed do not match the struct definition for constructor: " + ctorName
                );
                
                const dataReprTerm =
                    pConstrToData
                        .$( pInt( i ) )
                        .$( pList( Type.Data.Any )( jsStructFieldsNames.map<Term<any>>(
                                fieldKey => {
                                    return getToDataForType( thisCtorDef[ fieldKey ] )( jsStruct[ fieldKey ] )
                                })
                            )
                        );
                    
                return ObjectUtils.defineReadOnlyHiddenProperty(
                    new Term(
                        // just mock ts return type
                        thisStructType,
                        dataReprTerm.toUPLC
                    ),
                    "_pIsConstantStruct",
                    true
                );
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

function typeofGenericStruct(
    genStruct: ( ...tyArgs: [ ConstantableTermType, ...ConstantableTermType[] ] )
        => ConstantableStructDefinition
): GenericStructType
{
    const nArgs = genStruct.length;
    const tyArgs: [symbol][] = Array( nArgs );

    for( let i = 0; i < nArgs; i++ )
    {
        tyArgs[i] = Type.Var();
    };

    //@ts-ignore
    return struct( genStruct( ...tyArgs ) );
}

/**
 * @param getDescriptor 
 * @returns 
 */
export function pgenericStruct<ConstStructDef extends ConstantableStructDefinition, TypeArgs extends [ ConstantableTermType, ...ConstantableTermType[] ]>
    (
        getDescriptor: ( ...tyArgs: TypeArgs ) => ConstStructDef
    ): (
        (<TyArgs extends TypeArgs>( ...tyArgs: TyArgs ) => PStruct<ConstStructDef>) &
        { type: [ typeof structType, GenericStructDefinition ] }
    )
{
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

                const thisTyArgsKey = tyArgs.map( termTypeToString ).join();
                const keys = tyArgsCache.map( pair => pair.fst );

                if( keys.includes( thisTyArgsKey ) )
                {
                    const cachedResult = tyArgsCache.find( pair => pair.fst === thisTyArgsKey );
                    if( cachedResult !== undefined ) return cachedResult.snd;
                }
                
                const result = pstruct<ConstStructDef>(
                    getDescriptor(
                        /*
                        Argument of type '[ConstantableTermType, ...ConstantableTermType[]]' is not assignable to parameter of type 'TypeArgs'.
                            '[ConstantableTermType, ...ConstantableTermType[]]' is assignable to the constraint of type 'TypeArgs',
                            but 'TypeArgs' could be instantiated with a different subtype of constraint
                            '[ConstantableTermType, ...ConstantableTermType[]]'.ts(2345)
                        */
                        //@ts-ignore
                        tyArgs[0], ...tyArgs.slice(1)
                    )
                );
                tyArgsCache.push( new Pair<string, PStruct<ConstStructDef>>( thisTyArgsKey, result ) );

                return result;
            },
            "type",
            typeofGenericStruct( getDescriptor as any )
        ) as any;
    })();
};
