import { TirAliasType } from "../TirAliasType";
import { TirDataT, TirVoidT, TirBoolT, TirIntT, TirOptT, TirBytesT, TirStringT, TirListT, TirLinearMapT, TirFuncT } from "../TirNativeType";
import { TirStructType, StructFlags } from "../TirStructType";
import { TirType } from "../TirType";
import { canAssignTo, CanAssign, getCanAssign } from "./canAssignTo";

export function canCastTo( a: TirType, b: TirType ): boolean
{
    if(!(
        a.isConcrete()
        && b.isConcrete()
    )) return false; // both need to be concrete

    while( b instanceof TirAliasType ) b = b.aliased;
    while( a instanceof TirAliasType ) a = a.aliased;
    
    if( b instanceof TirDataT )
    {
        return canCastToData( a );
    }
    if( b instanceof TirStructType )
    {
        switch( getCanAssign( a, b ) ) {
            case CanAssign.Yes:
            // case CanAssign.runtimeModifier:
            // case CanAssign.OnlyAsData:
            case CanAssign.RequiresExplicitCast:
                return true;
            case CanAssign.No:
            case CanAssign.LeftArgIsNotConcrete:
            default:
                return false;
        }
    }
    if( b instanceof TirVoidT )
    {
        return (
            a instanceof TirVoidT
            || a instanceof TirDataT // Constr( 0, [] ) // void is unit
        );
    }
    if( b instanceof TirBoolT )
    {
        return (
            a instanceof TirBoolT
            || a instanceof TirDataT
            || a instanceof TirIntT
            || a instanceof TirOptT
        );
    }
    if( b instanceof TirIntT )
    {
        if( a instanceof TirIntT ) return true;
        if( a instanceof TirDataT ) return true;
        if( a instanceof TirBoolT ) return true; // 0 | 1
        if( a instanceof TirBytesT ) return true; // decode big endian plutus v3 builtin
        return false;
    }
    if( b instanceof TirBytesT )
    {
        if( a instanceof TirBytesT ) return true;
        if( a instanceof TirDataT ) return true;
        if( a instanceof TirStringT ) return true; // string -> bytes // decode utf8
        // how do we handle this?
        // in theory we can encode but only fixed size
        // we have no idea of the size of ints
        // if( a instanceof TirIntT ) return true;
        return false;
    }
    if( b instanceof TirStringT )
    {
        if( a instanceof TirStringT ) return true;
        if( a instanceof TirDataT ) return true;
        if( a instanceof TirBytesT ) return true; // bytes -> string // encode utf8
        return false;
    }
    if( b instanceof TirOptT )
    {
        if( a instanceof TirOptT ) return canCastTo( a.typeArg, b.typeArg );
        if( a instanceof TirDataT ) return true;
        return false;
    }
    if( b instanceof TirListT )
    {
        if( a instanceof TirListT ) return canCastTo( a.typeArg, b.typeArg );
        if( a instanceof TirDataT ) return canCastToData( b.typeArg );
        return false;
    }
    if( b instanceof TirLinearMapT )
    {
        if( a instanceof TirLinearMapT )
        {
            return (
                canCastTo( a.keyTypeArg, b.keyTypeArg )
                && canCastTo( a.valTypeArg, b.valTypeArg )
            );
        }
        if( a instanceof TirDataT ) return (
            canCastToData( b.keyTypeArg )
            && canCastToData( b.valTypeArg )
        );
        return false;
    }

    if( b instanceof TirFuncT )
    {
        if(!( a instanceof TirFuncT )) return false;

        return (
            a.argTypes.length === b.argTypes.length
            && a.argTypes.every( ( arg, i ) =>
                getCanAssign( arg, (b as TirFuncT).argTypes[i] ) === CanAssign.Yes
            )
            && getCanAssign( a.returnType, b.returnType ) === CanAssign.Yes
        );
    }

    // TirTypeParam
    // b;
    return false;
}

/**
 * int, bytes, string, bool, even void
 * lists and maps of any of the above
 * optionals (part of the standard ledger API) as long as the type argument can too
 * can all cast to data
 */
export function canCastToData( a: TirType ): boolean
{
    while(
        a instanceof TirAliasType
        || a instanceof TirOptT
        || a instanceof TirListT
    ) {
        if( a instanceof TirAliasType ) a = a.aliased;
        if( a instanceof TirOptT ) a = a.typeArg;
        if( a instanceof TirListT ) a = a.typeArg;
    }
    if(
        a instanceof TirDataT
        || a instanceof TirVoidT
        || a instanceof TirIntT
        || a instanceof TirBytesT
        || a instanceof TirStringT
        || a instanceof TirBoolT
    ) return true;

    if( a instanceof TirStructType ) return a.allowsDataEncoding() && structCanCastToData( a );
    if( a instanceof TirLinearMapT ) {
        const key = canCastToData( a.keyTypeArg );
        const value = canCastToData( a.valTypeArg );
        return key && value;
    }

    // TirFuncT | TirTypeParam
    // a;

    return false;
}

/**
 * double checks that the definition
 * does containg only types that can cast to data too
 * 
 * _if_ it cannot be cast to data (ie. this function returns false),
 * `onlySoP` is set to true
 */
function structCanCastToData( struct: TirStructType ): boolean
{
    if( !struct.allowsDataEncoding() ) return false;

    for( const ctor of struct.constructors )
    {
        for( const field of ctor.fields )
        {
            if( !canCastToData( field.type ) )
            {
                struct.flags |= StructFlags.onlySoP;
                return false;
            }
        }
    }

    return true;
}