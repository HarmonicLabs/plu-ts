import { typeExtends } from "../../../type_system/typeExtends";
import { StructCtorDef, StructDefinition } from "../../../type_system/types";

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