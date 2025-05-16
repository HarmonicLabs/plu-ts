import { AstNamedTypeExpr } from "../../../../ast/nodes/types/AstNamedTypeExpr";
import { AstFuncType } from "../../../../ast/nodes/types/AstNativeTypeExpr";
import { AstTypeExpr } from "../../../../ast/nodes/types/AstTypeExpr";
import { StdTypes } from "../../../tir/program/stdScope/StdTypes";
import { TirFuncT } from "../../../tir/types/TirNativeType";
import { TirType } from "../../../tir/types/TirType";
import { AstCompilationCtx } from "../../AstCompilationCtx";
import { Scope } from "../../scope/Scope";
import { TirFuncSigVariantsTree, TirFuncSigVariantsTreeLeaf, TirFuncSigVariantsTreeNode } from "./TirFuncSigVariantsTree";

export function getFuncSignatureTirVariants(
    signature: AstFuncType,
    ctx: AstCompilationCtx
): TirFuncT[]
{
    const astTypes = signature.params.map( param => param.type! );

    let tmpSig = signature;
    while( tmpSig.returnType instanceof AstFuncType ) {
        tmpSig = tmpSig.returnType;
        astTypes.push( ...tmpSig.params.map( p => p.type! ) );
    }
    if( !tmpSig.returnType ) throw new Error( "Function signature has no return type" );

    astTypes.push( tmpSig.returnType );

    const astParamTypes = astTypes.slice( 0, astTypes.length - 1 );
    const astReturnType = astTypes[ astTypes.length - 1 ];

    const returnType = resolveReturnType( astReturnType, ctx );
    if( !returnType ) throw new Error( "Could not resolve return type" );

    let treeBranches: TirFuncSigVariantsTree[] = [
        new TirFuncSigVariantsTreeLeaf(
            returnType
        )
    ];

    for( let i = astParamTypes.length - 1; i >= 0; i-- ) {
        const paramType = astParamTypes[ i ];
        const paramTirTypes = resolveParamType( paramType, ctx );
        if( !paramTirTypes ) throw new Error( "Could not resolve parameter type" );

        treeBranches = paramTirTypes.map( paramTirType =>
            new TirFuncSigVariantsTreeNode(
                paramTirType,
                treeBranches
            )
        );
    }
    
    const variants = new TirFuncSigVariantsTreeNode(
        ctx.program.stdTypes.void, // mock
        treeBranches
    )
    .toArrays();

    for( const variant of variants ) void variant.shift(); // remove fisrt stdTypes.void

    return variants.map( variant => {
        const paramTypes = variant.slice( 0, variant.length - 1 );
        const returnType = variant[ variant.length - 1 ];

        return new TirFuncT(
            paramTypes,
            returnType
        );
    });
}

function resolveReturnType(
    astType: AstTypeExpr,
    ctx: AstCompilationCtx
): TirType | undefined
{
    const possibleTypes = ctx.scope.resolveType( astType.toAstName() );
    if( !possibleTypes ) return undefined;

    // if there is a choice
    // we ALWAYS return the SoP friendly one
    // if we then happen to need the data encoded,
    // the overhead introduced by returning SoP instead of data directly
    // is negligible (~ 2 uplc nodes) 
    return ctx.program.types.get( possibleTypes.sopTirName );
}

function resolveParamType(
    astType: AstTypeExpr,
    ctx: AstCompilationCtx
): TirType[] | undefined
{
    const possibleTypes = ctx.scope.resolveType( astType.toAstName() );
    if( !possibleTypes ) return undefined;

    return [ ...possibleTypes.allTirNames ]
        .map( tirName => ctx.program.types.get( tirName ) )
        .filter( t => !!t );
}