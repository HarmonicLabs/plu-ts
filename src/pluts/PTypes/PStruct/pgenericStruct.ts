import { defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { Pair } from "@harmoniclabs/pair";
import { PDataRepresentable } from "../../PType/PDataRepresentable";
import { cloneSopDef, cloneStructDef } from "./cloneStructDef";
import { PStruct, pstruct } from "./pstruct";
import { AliasT, GenericStructCtorDef, GenericStructDefinition, GenericTermType, Methods, PrimType, StructDefinition, StructT, TermType, alias, int, struct, tyVar } from "../../../type_system/types";
import { termTypeToString } from "../../../type_system/utils";
import { isStructType } from "../../../type_system/kinds/isWellFormedType";
import { isTaggedAsAlias } from "../../../type_system/kinds/isTaggedAsAlias";


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
        getDescriptor: ( ...tyArgs: TypeArgs ) => PStruct<ConstStructDef, Methods>
    ): (
        (<TyArgs extends TypeArgs>( ...tyArgs: TyArgs ) => PStruct<ConstStructDef, Methods>) &
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
        const tyArgsCache: Pair<string, PStruct<ConstStructDef, Methods>>[] = []

        return defineReadOnlyProperty(
            ( ...tyArgs: TypeArgs ): PStruct<ConstStructDef, Methods> => {

                const thisTyArgsKey = tyArgs.map( t => termTypeToString( t ) ).join('|');
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

                tyArgsCache.push( new Pair<string, PStruct<ConstStructDef, Methods>>( thisTyArgsKey, result ) );

                return result;
            },
            "type",
            typeofGenericStruct( getDescriptor as any )
        ) as any;
    })();
};


export function typeofGenericStruct(
    genStruct: ( ...tyArgs: TermType[] )
        => PStruct<StructDefinition, Methods>
): StructT<GenericStructDefinition, Methods>
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

    const sDef = cloneSopDef(
        PStruct_.type[1]
    );

    replaceAliasesWith(
        aliases,
        replacements,
        sDef
    );

    return struct( sDef ) as any;
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
            else if( isTaggedAsAlias( thisType ) )
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