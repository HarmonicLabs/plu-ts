import BasePlutsError from "../../../../errors/BasePlutsError";
import Pair from "../../../../types/structs/Pair";
import JsRuntime from "../../../../utils/JsRuntime";
import ObjectUtils from "../../../../utils/ObjectUtils";
import { pConstrToData, pfstPair, pif, psndPair, punConstrData } from "../../Prelude/Builtins";
import PType, { PDataRepresentable } from "../../PType";
import { perror, plet, punsafeConvertType } from "../../Syntax";
import Term from "../../Term";
import Type, { anyStruct, bool, bs, ConstantableStructType, ConstantableTermType, GenericStructType, int, list, pair, str, struct, structType, StructType, TermType, ToPType, tyVar, unit } from "../../Term/Type";
import { typeExtends } from "../../Term/Type/extension";
import { isConstantableStructType, isConstantableTermType, isDataType, isStructType, isTypeParam, isWellFormedType } from "../../Term/Type/kinds";
import { termTypeToString } from "../../Term/Type/utils";
import PBool from "../PBool";
import PByteString from "../PByteString";
import PData from "../PData";
import PInt, { pInt } from "../PInt";
import PList, { pList } from "../PList";
import PPair from "../PPair";
import PString from "../PString";
import PUnit from "../PUnit";

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

export const isConstantableStructDefiniton = getIsStructDefWithTermTypeCheck<ConstantableStructDefinition>(
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

function getToDataForType<T extends ConstantableTermType | StructType>( t: T )
    :( term: Term<ToPType<T>> ) => Term<PData>
{
    const a = tyVar("a");
    const b = tyVar("b");

    if( typeExtends( t, int ) )     return PInt.toData as any;
    if( typeExtends( t, bs  ) )     return PByteString.toData as any;
    if( typeExtends( t, str ) )     return PString.toData as any;
    if( typeExtends( t, unit ) )    return PUnit.toData as any;
    if( typeExtends( t, bool ) )    return PBool.toData as any;
    if(
        typeExtends( t, list( a ) ) &&
        isDataType( t[1] )
    )                               return PList.toData as any;
    if(
        typeExtends( t, pair(a,b) ) &&
        isDataType( t[1] ) &&
        isDataType( t[2] )
    )                               return PPair.toData as any;
    if(
        typeExtends( t, struct( anyStruct ) ) &&
        t[1] !== anyStruct
    ) return ( ( structTerm: Term<PStruct<any>> ) => punsafeConvertType( structTerm, Type.Data.Any ) ) as any;

    /**
     * @todo add proper error
     */
    throw new BasePlutsError(
        "'getToDataForType'; type '" + termTypeToString( t ) + "' cannot be converted to data"
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

type RawFields<CtorDef extends ConstantableStructCtorDef, PExprResult extends PType> = {
    extract: ( ...fields: (keyof CtorDef)[] ) => {
        in: ( extracted: Partial<StructInstance<CtorDef>> ) => Term<PExprResult>
    }
}

function toRawFields( fieldsList: Term<PList<PData>>, allFields: string[] ): RawFields<any, any>
{
    return ObjectUtils.defineReadOnlyProperty(
        {},
        "extract",
        ( ...fields: string[] ) => {

        }
    ) as any;
}

type PMatchContinuation<SDef extends ConstantableStructDefinition> = {
    [Ctor in keyof SDef as `on${Capitalize<string & Ctor>}`]:
        <PExprResult extends PType>( rawFields: RawFields<SDef[Ctor], PExprResult> ) => Term<PExprResult>
}

function capitalize<s extends string>( str: s ): Capitalize<s>
{
    return str.length === 0 ? '' : str[0].toUpperCase() + str.slice(1) as any;
}

function getFinalPMatchExpr( callbacks: (( rawFields: object ) => Term<PType>)[], fieldsOfCtorN: string[][], ctorIdx: Term<PInt>, rawDataFields: Term<PList<PData>> )
{
    const last = callbacks.length - 1;

    let res = pif( Type.Any ).$( pInt( last ).eq( ctorIdx ) )
        .then( callbacks[last]( toRawFields( rawDataFields, fieldsOfCtorN[ last ] ) ) )
        .else( perror( Type.Any ) );

    for( let i = callbacks.length - 2; i >= 0; i-- )
    {
        res = pif( Type.Any ).$( pInt( i ).eq( ctorIdx ) )
        .then( callbacks[ i ]( fieldsOfCtorN[ i ] ) )
        .else( res )
    }

    return res;
}

export type PMatchOptions<SDef extends ConstantableStructDefinition> = {
    [Ctor in keyof SDef as `on${Capitalize<string & Ctor>}`]
        : ( cb: ( rawFields: any ) => Term<PType> )
            =>  Omit<SDef,Ctor> extends { [x: string | number | symbol ]: never } ?
                Term<PType> :
                PMatchOptions<Omit<SDef,Ctor>>
}

function definePMatchPermutations<SDef extends ConstantableStructDefinition>(
    obj: object,
    def: SDef,
    struct: Term<PStruct<ConstantableStructDefinition>>
): PMatchOptions<SDef>
{
    const ctors = Object.keys( def );
    const callbacks: (( rawFields: object ) => Term<PType>)[] = Array( ctors.length );

    const data = Type.Data.Any;

    function indexOfCtor( ctor: string ): number
    {
        const res = ctors.findIndex( c => c === ctor )
        if( res < 0 )
        {
            throw JsRuntime.makeNotSupposedToHappenError(
                "internal function 'indexOfCtor' in 'definePMatchPermutations' couldn't find the constructor \"" + ctor + "\" between " + ctors.toString()
            );
        }
        return res;
    }

    function loop( partialObj: object, missingCtors: string[] )
    {
        if( missingCtors.length <= 0 ) return obj;
        if( missingCtors.length === 1 )
        {
            const ctor = missingCtors[0];

            return ObjectUtils.defineReadOnlyProperty(
                partialObj,
                "on" + capitalize( ctor ),
                ( cb: ( rawFields: object ) => Term<PType> ) => {
                    const idx = indexOfCtor( ctor );
                    callbacks[idx] = cb;

                    return plet( punConstrData.$( struct as any ) ).in( constrPair =>
                        plet( pfstPair( int, list( data ) ).$( constrPair ) ).in( constrIdx =>
                        plet( psndPair( int, list( data ) ).$( constrPair ) ).in( rawDataFields =>

                            getFinalPMatchExpr(
                                callbacks,
                                ctors.map( ctorName => Object.keys( def[ ctorName ] ) ),
                                constrIdx,
                                rawDataFields
                            )

                        )));
                }
            );
        }

        missingCtors.forEach( ctor => {

            ObjectUtils.defineReadOnlyProperty(
                partialObj,
                "on" + capitalize( ctor ),
                ( cb: ( rawFields: object ) => Term<PType> ) => {
                    const idx = indexOfCtor( ctor );
                    callbacks[idx] = cb;

                    return loop( {},  missingCtors.filter( c => c !== ctor ) )
                }
            );
            
        });

        return obj;
    }

    return loop( obj, ctors ) as any;
}

export function pmatch<SDef extends ConstantableStructDefinition>( struct: Term<PStruct<SDef>> ): PMatchOptions<SDef>
{
    const sDef = struct.type[1] as ConstantableStructDefinition;
    if( !isConstantableStructDefiniton( sDef ) )
    {
        /**
         * @todo add proper error
         */
        throw new BasePlutsError("unexpected struct type while running 'pmatch'; " +
            "\ntype expected to be 'ConstantableStructDefiniton' was: " + termTypeToString( sDef )
        );
    }

    return definePMatchPermutations( {}, sDef, struct as any ) as any;
}
