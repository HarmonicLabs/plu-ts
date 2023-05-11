import { PType } from "../../PType";
import { Term } from "../../Term";
import { LitteralPurpose, isLitteralPurpose } from "../LitteralPurpose";
import { defaultVersion, getValidVersion } from "../getValidVersion";
import { compile } from "../compile";
import { PrimType, data, typeExtends, unit, fn, TermType, asData, ToPType } from "../../type_system";
import { getFnTypes } from "./getFnTypes";
import { makeRedeemerValidator, makeValidator } from "../makeScript";

export class Precompiled<Purp extends LitteralPurpose, T extends TermType>
{
    readonly purpose: Purp

    /**
     * @deprecated use `precompileParametrized` instead
    **/
    constructor(
        purpose: Purp, 
        precompiled: Uint8Array, 
        fullType: T,
        version: [ number, number, number] 
    )
    {
        if( !isLitteralPurpose( purpose ) )
        {
            throw new Error("invalid purpose passed to Precompiled constructor")
        }
        Object.defineProperty(
            this, "purpose", {
                value: purpose,
                writable: false,
                enumerable: true,
                configurable: false
            }
        );

        version = getValidVersion( version );

    }

    // static fromBlueprint( blueprint: object ): P

}

function getCompiledBody( term: Term<PType> ): Uint8Array
{
    // `.subarray(3)` to ignore the version.
    return compile( term, [1,0,0] ).subarray(3)
}

export function precompileParametrized<Purp extends LitteralPurpose, T extends TermType>
(
    purpose: Purp,
    term: Term<ToPType<T>>, 
    version: [number, number, number] = defaultVersion
): Precompiled<Purp, T>
{
    if( !isLitteralPurpose( purpose ) )
    {
        throw new Error("invalid purpose passed to precompileParametrized");
    }

    const type = term.type;

    const tys = getFnTypes( type );

    if( tys.length < 3 ) throw new Error("invalid term to precompile");

    const outT = tys[ tys.length - 1 ];

    if(!(
        outT[0] == PrimType.Bool ||
        outT[0] === PrimType.Unit
    )) throw new Error("invalid return type for typed or untyped validator");

    const primOutT = outT[0]

    if( tys.length === 3 ) // must be redeemer validator without params
    {
        if( purpose === "spend" ) throw new Error("invalid term for spending validator");

        if( primOutT === PrimType.Unit )
        {
            if(!(
                typeExtends( tys[0], data ) &&
                typeExtends( tys[1], data )
            )) throw new Error("untyped non-parametrized contract was typed");

            return new Precompiled(
                purpose,
                getCompiledBody( term ),
                type as any,
                version
            ) as any;
        }

        if( primOutT === PrimType.Bool )
        {
            return new Precompiled(
                purpose,
                getCompiledBody( makeRedeemerValidator( term as any ) ),
                fn([ toDataReprType( tys[0] ), toDataReprType( tys[1] ) ], unit ) as any,
                version
            );
        }
    }

    if( tys.length === 4 ) // either spend validator with no params or single params for rest
    {
        if( purpose === "spend" )
        {
            if( primOutT === PrimType.Unit )
            {
                if(!(
                    typeExtends( tys[0], data ) &&
                    typeExtends( tys[1], data ) &&
                    typeExtends( tys[2], data )
                )) throw new Error("untyped non-parametrized spend contract was typed");

                return new Precompiled(
                    purpose,
                    getCompiledBody( term ),
                    type as any,
                    version
                ) as any;
            }

            if( primOutT === PrimType.Bool )
            {
                return new Precompiled(
                    purpose,
                    getCompiledBody( makeValidator( term as any ) ),
                    fn([ toDataReprType( tys[0] ), toDataReprType( tys[1] ), toDataReprType( tys[2] ) ], unit ) as any,
                    version
                );
            }
        }

        // must be single param redeemer validator
    }

    return new Precompiled(
        purpose,
        getCompiledBody( term ),
        type as any,
        version
    ) as any;
}

function toDataReprType( t: TermType ): TermType
{
    if( typeExtends( t, data ) ) return t;

    if(
        t[0] === PrimType.Lambda ||
        t[0] === PrimType.Delayed
    ) throw new Error("lambda or delayed non representable by data");

    return asData( t );
}