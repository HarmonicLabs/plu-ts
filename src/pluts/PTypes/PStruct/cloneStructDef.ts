import { defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { GenericStructDefinition, SopCtorDef, SopDefinition, StructCtorDef, StructDefinition } from "../../../type_system";


export function cloneSopCtorDef<CtorDef extends SopCtorDef>( ctorDef: Readonly<CtorDef> ): CtorDef
{
    const clone: CtorDef = {} as any;

    for( const fieldName in ctorDef )
    {
        clone[ fieldName ] = ctorDef[ fieldName ];
    }

    return clone;
}

export const cloneStructCtorDef = cloneSopCtorDef as <CtorDef extends StructCtorDef>( ctorDef: Readonly<CtorDef> ) => CtorDef

export function cloneSopDef<SDef extends SopDefinition>( def: Readonly<SDef> ): SDef
{
    const clone: SDef = {} as SDef;
    const ctors = Object.keys( def );

    for(let i = 0; i < ctors.length; i++ )
    {
        defineReadOnlyProperty(
            clone,
            ctors[ i ],
            cloneSopCtorDef( def[ ctors[i] ] )
        );
    }

    return clone;
}

export const cloneStructDef = cloneSopDef as <SDef extends GenericStructDefinition>( def: Readonly<SDef> ) => SDef