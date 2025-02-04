import type { PType } from "../../PType";
import type { TermType } from "../../../type_system/types";
import type { ToPType } from "../../../type_system/ts-pluts-conversion";
import { type UtilityTermOf, addUtilityForType } from "../std/UtilityTerms/addUtilityForType";
import { isWellFormedType } from "../../../type_system/kinds/isWellFormedType";
import { Term } from "../../Term";


export function punsafeConvertType<ToTermType extends TermType>
( psome: Term<PType>, toType: ToTermType ): UtilityTermOf<ToPType<ToTermType>>
{
    if( !isWellFormedType( toType ) )
    {
        throw new Error("`punsafeConvertType` called with invalid type");
    }

    const converted = new Term(
        toType,
        psome.toIR,
        Boolean((psome as any).isConstant) // isConstant
    ) as any;

    Object.keys( psome ).forEach( k => {

        // do not overwrite `type` and `toUPLC` properties
        if(
            k === "type" || 
            k === "toUPLC" || 
            k === "toIR"
        ) return;
        
        Object.defineProperty(
            converted,
            k,
            Object.getOwnPropertyDescriptor(
                psome,
                k
            ) ?? {}
        )

    });

    return addUtilityForType( toType )( converted ) as any;
}

export function term_as<ToTermType extends TermType>( this: Term<PType>, toType: ToTermType ): UtilityTermOf<ToPType<ToTermType>>
{
    return punsafeConvertType( this, toType );
}