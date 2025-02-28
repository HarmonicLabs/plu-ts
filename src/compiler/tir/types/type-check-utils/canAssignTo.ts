import { TirAliasType } from "../TirAliasType";
import { TirAsDataT, TirBoolT, TirBytesT, TirDataT, TirIntT, TirLinearMapT, TirListT, TirOptT, TirAsSopT, TirStringT, TirVoidT, TirFuncT } from "../TirNativeType";
import { StructFlags, TirStructConstr, TirStructType } from "../TirStructType";
import { TirType } from "../TirType";
import { TirTypeParam } from "../TirTypeParam";
import { canCastToData } from "./canCastTo";

export enum CanAssign { 
    LeftArgIsNotConcrete = -1,
    No = 0,
    Yes = 1,
    // yes, but...
    LiftToOptional,
    RequiresExplicitCast,
    // OnlyAsData,
    // OnlySoP,
}
Object.freeze( CanAssign );

export function canAssignTo( a: TirType, b: TirType ): CanAssign
{
    if( !a.isConcrete() ) return CanAssign.LeftArgIsNotConcrete;
    return uncheckedCanAssignToType( a, b, new Map() );
}

function uncheckedCanAssignToType(
    a: TirType,
    b: TirType,
    symbols: Map<symbol, TirType>
): CanAssign
{
    // remove for tests
    if( a === b ) return CanAssign.Yes; // same object

    // unwrap all aliases
    // aliases are only for custom interface implementations
    // but the data is the same
    while( a instanceof TirAliasType ) a = a.aliased;
    while( b instanceof TirAliasType ) b = b.aliased;

    if( b instanceof TirTypeParam )
    {
        if( symbols.has( b.symbol ) )
        {
            return uncheckedCanAssignToType( a, symbols.get( b.symbol )!, symbols );
        }
        symbols.set( b.symbol, a );
        return CanAssign.Yes;
    }
    if( b instanceof TirVoidT ) {
        if( a instanceof TirVoidT ) return CanAssign.Yes;
        if( a instanceof TirDataT ) return CanAssign.RequiresExplicitCast;
        return CanAssign.No;
    }
    if( b instanceof TirBoolT ) {
        if( a instanceof TirBoolT ) return CanAssign.Yes;
        if( a instanceof TirDataT ) return CanAssign.RequiresExplicitCast;
        return CanAssign.No;
    }
    if( b instanceof TirIntT  ) {
        if( a instanceof TirIntT  ) return CanAssign.Yes;
        if( a instanceof TirDataT ) return CanAssign.RequiresExplicitCast;
        return CanAssign.No;
    }
    if( b instanceof TirBytesT )
    {
        if( a instanceof TirBytesT ) return CanAssign.Yes;
        if( a instanceof TirStringT ) return CanAssign.RequiresExplicitCast;
        if( a instanceof TirDataT ) return CanAssign.RequiresExplicitCast;
        return CanAssign.No;
    }
    if( b instanceof TirStringT )
    {
        if( a instanceof TirStringT ) return CanAssign.Yes;
        if( a instanceof TirBytesT ) return CanAssign.RequiresExplicitCast;
        if( a instanceof TirDataT ) return CanAssign.RequiresExplicitCast;
        return CanAssign.No;
    }

    if( b instanceof TirOptT )
    {
        if( a instanceof TirOptT ) return uncheckedCanAssignToType( a.typeArg, b.typeArg, symbols );
        if( a instanceof TirDataT ) return CanAssign.RequiresExplicitCast;

        const canAssingToDefined = uncheckedCanAssignToType( a, b.typeArg, symbols );
        switch( canAssingToDefined )
        {
            case CanAssign.Yes: // value => Some{ value }
                return CanAssign.LiftToOptional;
            case CanAssign.RequiresExplicitCast:
                // TODO: do we want to allow this?
                // return CanAssign.RequiresExplicitCast;
            case CanAssign.No:
            case CanAssign.LeftArgIsNotConcrete:
            case CanAssign.LiftToOptional: // value is not assignable with single lift
                default:
                return CanAssign.No;
        }

        return CanAssign.No; 
    }
    if( b instanceof TirListT )
    {
        if( a instanceof TirListT ) return uncheckedCanAssignToType( a.typeArg, b.typeArg, symbols );
        if( a instanceof TirDataT ) return CanAssign.RequiresExplicitCast;
        return CanAssign.No;
    }
    if( b instanceof TirLinearMapT )
    {
        if( a instanceof TirLinearMapT )
        {
            return decideCanAssignField(
                uncheckedCanAssignToType( a.keyTypeArg, b.keyTypeArg, symbols ),
                uncheckedCanAssignToType( a.valTypeArg, b.valTypeArg, symbols )
            );
        }
        if( a instanceof TirDataT ) return CanAssign.RequiresExplicitCast;
        return CanAssign.No;
    }

    if( b instanceof TirDataT )
    {
        if( a instanceof TirDataT || a instanceof TirAsDataT ) return CanAssign.Yes;
        if( a instanceof TirStructType )
            return a.allowsDataEncoding() ? CanAssign.RequiresExplicitCast : CanAssign.No;
        // int, bytes, string, bool, even void
        // optionals (part of the standard ledger API) as long as the type argument can too
        // structs that allow data encoding
        // lists and maps of any of the above
        // can all cast to data
        return canCastToData( a ) ? CanAssign.RequiresExplicitCast : CanAssign.No;
    }
    if( b instanceof TirAsDataT )
    {
        if( a instanceof TirAsDataT ) return uncheckedCanAssignToType( a.typeDef, b.typeDef, symbols );
        if( a instanceof TirDataT ) return CanAssign.No;
        if( a instanceof TirStructType )
        {
            if( a.onlySoP() ) return CanAssign.No;
            const canAssignStruct = uncheckedCanAssignToType( a, b.typeDef, symbols );
            if(
                canAssignStruct === CanAssign.Yes ||
                canAssignStruct === CanAssign.RequiresExplicitCast
            ) return CanAssign.RequiresExplicitCast;
            return CanAssign.No;
        }
        return CanAssign.No;
    }
    if( a instanceof TirAsDataT )
    {
        return uncheckedCanAssignToType( a.typeDef, b, symbols );
    }

    if( b instanceof TirAsSopT )
    {
        if( a instanceof TirAsSopT ) return uncheckedCanAssignToType( a.typeDef, b.typeDef, symbols );
        if( a instanceof TirStructType ) {
            if(!a.allowsSoPEncoding()) return CanAssign.No;
            const canAssignDef = canAssignStruct( a, b.typeDef, symbols );
            switch( canAssignDef ) {
                case CanAssign.Yes:
                    return CanAssign.Yes;
                case CanAssign.RequiresExplicitCast:
                    return CanAssign.RequiresExplicitCast;
                // case CanAssign.OnlySoP:
                //     return CanAssign.OnlySoP;
                case CanAssign.No:
                // case CanAssign.OnlyAsData:
                case CanAssign.LeftArgIsNotConcrete:
                default:
                    return CanAssign.No;
            }
        }
        return CanAssign.No;
    }
    if( a instanceof TirAsSopT )
    {
        if(!( b instanceof TirStructType )) return CanAssign.No;

        switch( canAssignStruct( a.typeDef, b, symbols ) ) {
            case CanAssign.Yes:
            // case CanAssign.OnlySoP:
                return CanAssign.Yes;
            case CanAssign.RequiresExplicitCast:
                return CanAssign.RequiresExplicitCast;
            case CanAssign.No:
            // case CanAssign.OnlyAsData:
            case CanAssign.LeftArgIsNotConcrete:
            default:
                return CanAssign.No;
        }
    }

    if( b instanceof TirStructType )
    {
        if( a instanceof TirStructType ) return canAssignStruct( a, b, symbols );
        if( a instanceof TirDataT && b.allowsDataEncoding() ) return CanAssign.RequiresExplicitCast;
        return CanAssign.No;
    }
    if( a instanceof TirStructType ) return CanAssign.No;

    if( b instanceof TirFuncT )
    {
        if(!(
            a instanceof TirFuncT
            && a.argTypes.length === b.argTypes.length
        )) return CanAssign.No;
        let currentDecision = uncheckedCanAssignToType( a.returnType, b.returnType, symbols );
        for( let i = 0; i < a.argTypes.length; i++ )
        {
            currentDecision = decideCanAssignField(
                currentDecision,
                // TODO make one only for functions
                uncheckedCanAssignToType( a.argTypes[i], b.argTypes[i], symbols )
            );
            if( currentDecision <= CanAssign.No ) return currentDecision;
        }
        return currentDecision;
    }

    return CanAssign.No;
}


function canAssignStruct(
    a: TirStructType | TirAliasType<TirStructType>,
    b: TirStructType | TirAliasType<TirStructType>,
    symbols: Map<symbol, TirType>
): CanAssign
{
    while( a instanceof TirAliasType ) a = a.aliased;
    while( b instanceof TirAliasType ) b = b.aliased;

    const aCtors = a.constructors;
    const bCtors = b.constructors;

    if( aCtors.length !== bCtors.length ) return CanAssign.No;

    const len = aCtors.length;

    // check for the same number of fields
    // so we avoid useless checks on types that don't exsist
    for( let i = 0; i < len; i++ )
    {
        const aCtor = aCtors[i];
        const bCtor = bCtors[i];
        if(
            aCtor.fields.length !== bCtor.fields.length
        ) return CanAssign.No;
    }

    for( let i = 0; i < len; i++ )
    {
        if(
            // check for the same fields and the extending types to extend the given struct ones
            !canAssignCtorDef(
                aCtors[i],
                bCtors[i],
                symbols
            )
        ) return CanAssign.No;
    }

    // check if cast is needed even if shape is the same
    for( let i = 0; i < len; i++ )
    {
        const aCtor = aCtors[i];
        const bCtor = bCtors[i];
        if(
            aCtor.fields.length !== bCtor.fields.length
        ) return CanAssign.RequiresExplicitCast;
    }

    if( a.name !== b.name ) return CanAssign.RequiresExplicitCast;

    return CanAssign.Yes;
}

/**
 * 
 * @param a extending ctor
 * @param b extended ctor
 * @returns 
 */
function canAssignCtorDef(
    a: TirStructConstr,
    b: TirStructConstr,
    symbols: Map<symbol, TirType>
): CanAssign
{
    if( a.fields.length !== b.fields.length ) return CanAssign.No;

    const len = a.fields.length;
    let currentDecision = CanAssign.Yes;
    let prevDecision: CanAssign = currentDecision;
    for( let i = 0; i < len; i++ )
    {
        prevDecision = currentDecision;
        currentDecision = decideCanAssignField(
            currentDecision,
            uncheckedCanAssignToType(
                a.fields[i].type,
                b.fields[i].type,
                symbols
            )
        );
        if( currentDecision <= CanAssign.No ) return currentDecision;
        if(
            a.fields[i].name !== b.fields[i].name

        ) currentDecision = decideCanAssignField(
            currentDecision,
            CanAssign.RequiresExplicitCast
        );
    }

    return currentDecision;
}

function decideCanAssignField( currentDecision: CanAssign, fieldDecision: CanAssign ): CanAssign
{
    if(
        currentDecision === CanAssign.No
        || currentDecision === CanAssign.LeftArgIsNotConcrete
    ) return currentDecision;
    switch( fieldDecision )
    {
        // lift to optional only valid for direct types
        case CanAssign.LiftToOptional: return CanAssign.No;
        // no decisions always win
        case CanAssign.No: return CanAssign.No;
        case CanAssign.LeftArgIsNotConcrete: return CanAssign.LeftArgIsNotConcrete;
        // yes decisions by most descriptive (sop and data conflict become nos)
        case CanAssign.Yes: return currentDecision;
        case CanAssign.RequiresExplicitCast: {
            switch( currentDecision )
            {
                case CanAssign.Yes: return CanAssign.RequiresExplicitCast;
                case CanAssign.RequiresExplicitCast: return CanAssign.RequiresExplicitCast;
                // case CanAssign.OnlyAsData: return CanAssign.OnlyAsData;
                // case CanAssign.OnlySoP: return CanAssign.OnlySoP;
                default: return CanAssign.No;
            }
            break;
        }
        // case CanAssign.OnlyAsData: {
        //     switch( currentDecision )
        //     {
        //         case CanAssign.Yes: return CanAssign.OnlyAsData;
        //         case CanAssign.RequiresExplicitCast: return CanAssign.OnlyAsData;
        //         case CanAssign.OnlyAsData: return CanAssign.OnlyAsData;
        //         case CanAssign.OnlySoP: return CanAssign.No; // conflict
        //         default: return CanAssign.No;
        //     }
        //     break;
        // }
        // case CanAssign.OnlySoP: {
        //     switch( currentDecision )
        //     {
        //         case CanAssign.Yes: return CanAssign.OnlySoP;
        //         case CanAssign.RequiresExplicitCast: return CanAssign.OnlySoP;
        //         // case CanAssign.OnlyAsData: return CanAssign.No; // conflict
        //         case CanAssign.OnlySoP: return CanAssign.OnlySoP;
        //         default: return CanAssign.No;
        //     }
        //     break;
        // }
        default:
            // never
            // fieldDecision; 
            return CanAssign.No;
    }
}