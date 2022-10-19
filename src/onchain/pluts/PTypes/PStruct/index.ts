import Pair from "../../../../types/structs/Pair";
import JsRuntime from "../../../../utils/JsRuntime";
import ObjectUtils from "../../../../utils/ObjectUtils";
import { ReturnT } from "../../../../utils/ts";
import { pConstrToData } from "../../Prelude/Builtins";
import { PDataRepresentable } from "../../PType";
import { punsafeConvertType } from "../../Syntax";
import Term from "../../Term";
import Type, { Alias, aliasType, ConstantableStructType, ConstantableTermType, GenericStructType, int, PrimType, struct, structType, StructType, TermType, ToPType, tyVar } from "../../Term/Type";
import { typeExtends } from "../../Term/Type/extension";
import { isAliasType, isConstantableStructDefinition, isConstantableTermType, isStructType, isWellFormedType } from "../../Term/Type/kinds";
import { cloneTermType, structDefToString, termTypeToString } from "../../Term/Type/utils";
import palias, { PAlias } from "../PAlias";
import PData from "../PData";
import { getToDataForType } from "../PData/conversion/getToDataTermForType";
import { TermFn } from "../PFn/PLam";
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

export type PStruct<SDef extends ConstantableStructDefinition> = {
    new(): _PStruct

    readonly termType: [ typeof structType, SDef ];
    readonly type: [ typeof structType, SDef ];

    readonly fromDataTerm: TermFn<[PData],PStruct<SDef>>
    fromData: ( data: Term<PData> ) => Term<PStruct<SDef>>;

    readonly toDataTerm: TermFn<[PStruct<SDef>],PData>
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
                definition[fieldKey]
            )
        )
    );
}


export default function pstruct<StructDef extends ConstantableStructDefinition>( def: StructDef ): PStruct<StructDef>
{
    JsRuntime.assert(
        isConstantableStructDefinition( def ),
        "cannot construct 'PStruct' type; invalid struct definition: " + structDefToString( def ) 
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

        static termType: [ typeof structType, StructDef ];
        static type: [ typeof structType, StructDef ];
        static fromData: <Ext extends PStructExt = PStructExt>( data: Term<PData> ) => Term<Ext>
        static toData:   <Ext extends PStructExt>( data: Term<Ext> ) => Term<PData>;

    }

    const thisStructType = Type.Struct( def );

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

    ObjectUtils.defineReadOnlyProperty(
        PStructExt,
        "toData",
        ( struct: Term<PStructExt> ): Term<PData> => {

            JsRuntime.assert(
                typeExtends( struct.type, thisStructType ),
                "trying to conver a struct using the wrong 'toData', perhaps you ment to call the 'toData' method of an other struct?"
            );

            return punsafeConvertType( struct, Type.Data.Constr )
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
                // const jsStructFieldsNames = Object.keys( jsStruct );
                
                // order of fields in the 'jsStruct' migth be different than the order of the definiton
                // to preserve the order we need to use the keys got form the ctor definition
                const ctorDefFieldsNames = Object.keys( thisCtorDef );

                // still we must be sure that the jsStruct has at least all the fields
                JsRuntime.assert(
                    isStructInstanceOfDefinition( jsStruct, thisCtorDef ),
                    "the fields passed do not match the struct definition for constructor: " + ctorName
                );
                
                const dataReprTerm =
                    pConstrToData
                        .$( pInt( i ) )
                        .$( pList( Type.Data.Any )(
                            
                            ctorDefFieldsNames.map<Term<any>>(
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

function replaceAliasesWith(
    aliases: Alias<symbol,[PrimType.Int]>[],
    replacements: (ConstantableTermType | StructType | [symbol])[],
    sDef: GenericStructDefinition
): void
{
    const ctors = Object.keys( sDef );

    for( let i = 0; i < ctors.length; i++ )
    {
        const thisCtor = sDef[ ctors[ i ] ];
        const fields = Object.keys( thisCtor );

        for( let j = 0; j < fields.length; j++ )
        {
            const thisField = fields[i];
            const thisType = thisCtor[ thisField ];

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
            else if ( isAliasType( thisType ) )
            {
                const idx = aliases.findIndex( alias => typeExtends( thisType, alias ) );
                if( idx < 0 ) continue;
                thisCtor[ thisField ] = replacements[ idx ];
            }
        }
    }
}

function typeofGenericStruct(
    genStruct: ( ...tyArgs: [ ConstantableTermType, ...ConstantableTermType[] ] )
        => ConstantableStructDefinition
): GenericStructType
{
    const nArgs = genStruct.length;
    const aliases: Alias<symbol,[PrimType.Int]>[] = Array( nArgs );
    const replacements: [ symbol ][] = Array( nArgs );

    for( let i = 0; i < nArgs; i++ )
    {
        aliases[i] = Object.freeze([
            aliasType,
            Object.freeze({
                id: Symbol(),
                type: int
            })
        ]);
        replacements[i] = tyVar();
    };

    
    const sDef = cloneStructDef(
        genStruct(
            //@ts-ignore
            ...aliases
        )
    );

    replaceAliasesWith(
        aliases,
        replacements,
        sDef
    );

    return struct( sDef );
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

                const thisTyArgsKey = tyArgs.map( termTypeToString ).join('|');
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
