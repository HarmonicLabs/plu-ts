import { defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import type { PType } from "../../../../PType";
import type { PLam } from "../../../../PTypes/PFn/PLam";
import type { Term } from "../../../../Term";
import { typeExtends } from "../../../../../type_system/typeExtends";
import { PrimType, type Methods, type TermType } from "../../../../../type_system/types";
import type { FilterMethodsByInput, FilterOutSingleInputMethods, LiftMethods, MethodsAsTerms } from "./methodsTypes";
import { papp } from "../../../papp";
import { getFnTypes } from "../../../../Script/Parametrized/getFnTypes";
import { _plet } from "../../../plet/minimal";
import { addUtilityForType } from "../addUtilityForType";
import { isWellFormedMethods } from "./assertWellFormedMethods";
import { stringify } from "../../../../../utils/stringify";

function getMethodsWithFirstInputOfType( methods: Methods, type: TermType ): Methods
{
    const filtered: Methods = {};

    let method: Term<PLam<PType,PType>>;

    const methodNames = Object.keys( methods );
    
    for( const methodName of methodNames )
    {
        method = methods[methodName];


        if( method.type[0] !== PrimType.Lambda )
        throw new Error("user defined method is expected to be a funciton");

        if( typeExtends( method.type[1], type ) )
        {
            filtered[methodName] = method;
        }
    }

    return Object.freeze( filtered );
}

export function addUserMethods<
    PT extends PType, 
    M extends Methods
>( 
    term: Term<PT>, 
    methods: M 
): Term<PT> & 
    LiftMethods<
        FilterMethodsByInput<M, PT>
    > & 
    MethodsAsTerms<
        FilterOutSingleInputMethods<
            FilterMethodsByInput<M, PT>
        >
    >
{
    if( !isWellFormedMethods( methods ) )
    {
        throw new Error(
            "user-specified methods are not well formed, definition contains methods with ambigous names:  " +
            stringify( Object.keys( methods ), undefined, 2 ) 
        );
    }

    const t = term.type;

    const filtered = getMethodsWithFirstInputOfType( methods, t );

    let method: Term<PLam<PType,PType>>;

    for( const methodName in filtered )
    {
        method = filtered[methodName];

        const fnTypes = getFnTypes( method.type );

        // don't add terms that do not accept `self_t` as first argument as methods
        if( !typeExtends( fnTypes[0], t ) ) continue;

        // -1 (term application)
        // -1 (the output type)
        const missingArgsAfterApplication = fnTypes.length - 2;
        
        const _appliedTerm = papp( method, term );
        const appliedTerm = addUtilityForType( _appliedTerm.type )( _plet( _appliedTerm ) );

        if( missingArgsAfterApplication === 0 )
        {
            defineReadOnlyProperty(
                term, methodName, appliedTerm
            );
            continue;
        }
        
        defineReadOnlyProperty(
            term, "p" + methodName, appliedTerm
        );
        defineReadOnlyProperty(
            term, methodName, ( ...other_terms: any[] /* PappArg<PType>[] */ ) => {
                let result: any = appliedTerm;

                if( other_terms.length < missingArgsAfterApplication )
                throw new Error("not enough arguments for method + '" + methodName + "'");
                
                for( let i = 0 ; i < missingArgsAfterApplication; i++ )
                {
                    result = papp(
                        result,
                        // PappArg<PType>
                        other_terms[i]
                    );
                }

                return result;
            } 
        )
    }

    return term as any;
}