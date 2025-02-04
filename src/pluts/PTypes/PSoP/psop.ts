import { PDataRepresentable } from "../../PType/PDataRepresentable";
import { UtilityTermOf, addUtilityForType } from "../../lib/std/UtilityTerms/addUtilityForType";

import { structDefToString } from "../../../type_system/utils";
import { Methods, PrimType, SopCtorDef, SopDefinition, SopT, sop } from "../../../type_system/types";
import { ToPType } from "../../../type_system/ts-pluts-conversion";
import { typeExtends, isSopDefinition } from "../../../type_system";
import { Term } from "../../Term";
import { PType } from "../../PType";
import { defineReadOnlyProperty, isObject } from "@harmoniclabs/obj-utils";
import { assert } from "../../../utils/assert";
import { IRHoisted } from "../../../IR/IRNodes/IRHoisted";
import { IRConstr } from "../../../IR/IRNodes/IRConstr";

/**
 * intermediate class useful to reconise structs form primitives
 */
class _PSop extends PType
{
    protected _sop: never;
    protected constructor()
    {
        super();
    }
}

export type SopInstance<SCtorDef extends SopCtorDef> = {
    readonly [Field in keyof SCtorDef]: UtilityTermOf<ToPType<SCtorDef[Field]>>
}

export type AnySopInstance<SCtorDef extends SopCtorDef> = {
    [Field in keyof SCtorDef]: Term<ToPType<SCtorDef[Field]>>
}

export type PSop<SDef extends SopDefinition, SMethods extends Methods> = {
    new(): _PSop

    /**
     * @deprecated
     */
    readonly termType: SopT<SDef,SMethods>;
    // remember to specify methods...
    readonly type: SopT<SDef,SMethods>;

    // needed for any extension of `PSop` to be assignable
    // just typescript stuff here
    [ prop: string ]: any
} & PDataRepresentable & {
    [Ctor in keyof SDef]:
        ( ctorFields: AnySopInstance<SDef[Ctor]> ) => Term<PSop<SDef, SMethods>>
}

function isSopInstanceOfDefinition<SCtorDef extends SopCtorDef>
    ( structInstance: AnySopInstance<any>, definition: SCtorDef )
    : structInstance is AnySopInstance<SCtorDef>
{
    const jsSopFieldsNames = Object.keys( structInstance );
    const defKeys = Object.keys( definition );
    
    return (
        jsSopFieldsNames.length === defKeys.length &&
        defKeys.every( defFieldName => jsSopFieldsNames.includes( defFieldName ) ) &&
        jsSopFieldsNames.every( fieldKey => {
            
            return definition[fieldKey] !== undefined &&
            // every field's value is a Term
            structInstance[fieldKey] instanceof Term /*thisCtorDef[fieldKey]*/ &&
            typeExtends(
                structInstance[fieldKey].type,
                definition[fieldKey]
            );
        })
    );
}

const RESERVED_STRUCT_KEYS = Object.freeze([
    "eq",
    "peq",
    "extract",
    "in",
    "raw"
]);

/**
 * 
 * @param {SopDef} def data-type definition of the sop
 * 
 *  each property of the object is a possible constructor for the sop;
 * 
 *  each constructor is defined by specifiying the fields that constructor expects and relative types
 * 
 * @example
 * ```ts
 * const Shape = pstruct({
 *      Circle: {
 *          radius: int
 *      },
 *      Rectangle: {
 *          fstSide: int,
 *          sndSide: int
 *      }
 * });
 * ```
 * 
 * @param {( self_t: SopT<SopDef,{}> ) => Methods} getMethods (optional) function to implement arbitrary methods on a given sop.
 * 
 * the function takes as first argument the type of this same sop and expects an object with various methods to be implemented on a sop instance
 * 
 * @example
 * ```ts
 * const Shape = pstruct({
 *      Circle: {
 *          radius: int
 *      },
 *      Rectangle: {
 *          fstSide: int,
 *          sndSide: int
 *      }
 * }, ( self_t ) => {
 * 
 *      return {
 *          largestSide: pfn([ self_t ], int )
 *              ( self => 
 *                  pmatch( self )
 *                  .onCircle(({ radius }) => radius )
 *                  .onRectangle({ fstSide, sndSide } =>
 *                      pif( int ).$( fstSide.gt( sndSide ) )
 *                      .then( fstSide )
 *                      .else( sndSide ) 
 *                  )
 *              )
 *      };
 * });
 * 
 * const isLargeShape = pfn([ Shape.type ], int )
 * ( shape => shape.largestSide.gtEq( 100 ) )
 * ```
 */
export function psop<
    SopDef extends SopDefinition, 
    SMethods extends Methods
>( 
    def: SopDef, 
    getMethods?: ( self_t: SopT<SopDef, {}> ) => SMethods
): PSop<SopDef, SMethods>
{
    assert(
        isSopDefinition( def ),
        "cannot construct 'PSop' type; sop definition is not constant: " + structDefToString( def ) 
    );

    getMethods = typeof getMethods === "function" ? getMethods : _self_t => { return {} as SMethods; };

    class PSopExt extends _PSop
    {
        static _isPType: true = true;
        // private constructors are not a thing at js runtime
        // in any case constructing an instance is useless
        // private allows the typescript LSP to rise errors (not runtime) whet trying to extend the class
        private constructor()
        {
            super();
        }

        static termType: [ PrimType.Sop, SopDef, SMethods ];
        static type: [ PrimType.Sop, SopDef, SMethods ];
    }

    const noMethodsType = sop( def );

    const methods = getMethods( noMethodsType );

    const thisSopType = sop( def, methods );

    defineReadOnlyProperty(
        PSopExt,
        "type",
        thisSopType
    );

    defineReadOnlyProperty(
        PSopExt,
        "termType",
        thisSopType
    );

    const constructors = Object.keys( def );
    assert(
        constructors.length >= 1,
        "sop definition requires at least 1 constructor"
    );

    // define constructors
    for(let i = 0; i < constructors.length; i++)
    {
        const ctorName = constructors[ i ];

        defineReadOnlyProperty(
            PSopExt.prototype,
            ctorName,
            ( jsSop: AnySopInstance<any> ): UtilityTermOf<PSopExt> => {

                assert(
                    isObject( jsSop ),
                    "cannot build a plu-ts structure if the input is not an object with named fields"
                );

                const thisCtorDef = def[ctorName];
                // const jsSopFieldsNames = Object.keys( jsSop );
                
                // order of fields in the 'jsSop' migth be different than the order of the definiton
                // to preserve the order we need to use the keys got form the ctor definition
                const ctorDefFieldsNames = Object.keys( thisCtorDef );

                for( const fieldName of ctorDefFieldsNames )
                {
                    if( RESERVED_STRUCT_KEYS.includes( fieldName ) )
                    {
                        throw new Error(
                            `"${fieldName}" is a reserved sop key; it can't be used as custom sop property.`
                        )
                    }
                }

                if( ctorDefFieldsNames.length === 0 )
                {
                    return addUtilityForType(thisSopType)(
                        new Term(
                            thisSopType,
                            _dbn => new IRConstr( 0, [] )
                        )
                    ) as any;
                }

                // still we must be sure that the jsSop has at least all the fields
                assert(
                    isSopInstanceOfDefinition( jsSop, thisCtorDef ),
                    "the fields passed do not match the sop definition for constructor: " + ctorName
                );

                return addUtilityForType( thisSopType )(
                    new Term(
                        thisSopType,
                        (cfg, dbn) => new IRConstr(
                            i,
                            ctorDefFieldsNames.map( fieldKey => jsSop[ fieldKey ].toIR( cfg, dbn ) )
                        )
                    )
                ) as any;
            }
        );

        defineReadOnlyProperty(
            PSopExt,
            ctorName,
            (PSopExt.prototype as any)[ctorName]
        );
    }

    /*
    Type 'typeof PSopExt' is not assignable to type 'PSop<SopDef>'
    
    Why is this?
    */
    return PSopExt as any;
}