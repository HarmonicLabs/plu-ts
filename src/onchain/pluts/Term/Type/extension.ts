import { DataConstructor, DataType, TermType } from ".";
import { isDataType, isTypeNameOfData, isTypeParam, isWellFormedType } from "./kinds";

/**
 * @deprecated use ```typeExtends``` instead
 */
 export function areTypesEquals( a: TermType, b: TermType ): boolean
 {
    if(!(
        isWellFormedType( a ) &&
        isWellFormedType( b )
    )) return false;

    function uncheckedTyEq( _a: TermType, _b: TermType ): boolean
    {
        const aArgs = _a.slice( 1 ) as TermType[];
        return (
            _a[ 0 ] === _b[ 0 ] &&
            _a.length === _b.length &&
            ( b.slice(1) as TermType[] ).every( (bTyArg, idx) => uncheckedTyEq( aArgs[ idx ], bTyArg ) )
        );
    }

    return uncheckedTyEq( a, b )
}


export function dataTypeExtends<ExtendedDataTy extends DataType>( extending: DataType, extended: ExtendedDataTy ): extending is ExtendedDataTy
{
    if(!(
        isDataType( extended  ) &&
        isDataType( extending )
    )) return false;

    function unchecked( a: DataType, b: DataType ): boolean
    {
        if( b[ 0 ] === DataConstructor.Any ) return true;
        if( a[ 0 ] === DataConstructor.Any ) return false;

        const bTyArgs = b.slice( 1 ) as DataType[];
        return (
            a[ 0 ] === b[ 0 ] &&
            a.length === b.length &&
            ( a.slice( 1 ) as DataType[] ).every( (aTyArg, idx) => dataTypeExtends( aTyArg, bTyArgs[ idx ] ) )
        );
    }

    return unchecked( extending, extended );
}

/*
 * equivalent to ```A extends B``` but at plu-ts level
 */
export function typeExtends<ExtendedTy extends TermType>( extending: TermType, extended: ExtendedTy ): extending is ExtendedTy
{
    if(!(
        isWellFormedType( extending ) &&
        isWellFormedType( extended  )
    )) return false;

    type TyPair = {
        tyVar: symbol
        tyArg: TermType
    };

    const subs: TyPair[] = [];

    function findSym( tVar: symbol ): TyPair | undefined
    {
        return subs.find( pair => pair.tyVar === tVar )
    }

    function unchecked( a: TermType, b: TermType ): boolean
    {
        if( isTypeParam( b[0] ) )
        {
            if( b[0] === a[0] ) return true; // same symbol

            const thisTyPair = findSym( b[0] );
            
            // type paramteter never found before
            if( thisTyPair === undefined )
            {
                subs.push({
                    tyVar: b[0],
                    tyArg: a
                });
                return true;
            }

            // type parameter was found and is a parameter
            if( isTypeParam( thisTyPair.tyArg[0] ) )
            {
                // if this value is a parameter (just like the one found before)
                if( isTypeParam( a[0] ) )
                {
                    // make sure is the same paramter since
                    // is corresponding to the same paramter in 'b' (the extended type)
                    return a[0] === thisTyPair.tyArg[0];
                }
                // else should update with more specific one

                // check if previous type is still assignable to new (more specific) argument
                // return false if not, since the previous is too genreic
                if( !unchecked( thisTyPair.tyArg, a ) ) return false;
                
                // update with specific type
                thisTyPair.tyArg = a;
                return true;
            }

            // thisTyPair.tyArg is a fixed type
            return unchecked( a, thisTyPair.tyArg )
        }

        if( isTypeParam( a[0] ) ) return false;

        if( isTypeNameOfData( b[0] ) )
        {
            if( !isTypeNameOfData( a[0] ) ) return false;

            // checks for correct data type construction;
            // actually already checked in the ```isWellFormedType``` call above
            return dataTypeExtends( a as any, b as any );
        }

        const bTyArgs = b.slice(1) as TermType[];
        return (
            a[ 0 ] === b[ 0 ] &&
            // a.length === b.length && // not a check because of possible ```Type.Var()``` as type arguments
            ( a.slice( 1 ) as TermType[] ).every( (aTyArg, idx) => unchecked( aTyArg, bTyArgs[ idx ] ) )
        );
    }

    return unchecked( extending, extended );
}