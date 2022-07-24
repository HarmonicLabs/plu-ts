import BasePlutsError from "../../../../../../errors/BasePlutsError";
import BinaryString from "../../../../../../types/bits/BinaryString";
import BitStream from "../../../../../../types/bits/BitStream";
import Debug from "../../../../../../utils/Debug";
import JsRuntime from "../../../../../../utils/JsRuntime";

export const enum ConstTyTag {
    int = 0,
    byteStr = 1,
    str = 2,
    unit = 3,
    bool = 4,
    list = 5,
    pair = 6,
    // tyApp = 7, // only used internally for types like list and pair
    data = 8
}

/**
 * defined as:
 * ```ts
 * type ConstType = ConsTyTag[]
 * ```
 * 
 * >**_NOTE:_** the definition used doen't ensures for type correctness
 * > in order to be sure a given ```ConstType``` is valid ```isWellFormedConstType``` (exported in the same module) should still be used
 * 
 * >**_PRO TIP:_** to ensure a ```ConstType``` to be created correctly 
 * > you should use the ```constT``` object and build a ```ConstType``` only using the object fields
 * > for reference here's the ```constT``` object definition:
 * > ```ts
 * > const constT : Readonly<{
 * >     int: ConstType,
 * >     byteStr: ConstType,
 * >     str: ConstType,
 * >     unit: ConstType
 * >     bool: ConstType
 * >     listOf: ( tyArg: ConstType ) => ConstType
 * >     pairOf: ( tyArg1: ConstType, tyArg2: ConstType ) => ConstType
 * >     data: ConstType
 * > }>
 * > ```
 * 
*/
type ConstType = ConstTyTag[];

// maybe this one is to strict?
//    = [ ConstTyTag.int ]
//    | [ ConstTyTag.byteStr ]
//    | [ ConstTyTag.str  ]
//    | [ ConstTyTag.unit ]
//    | [ ConstTyTag.bool ]
//    | [ ConstTyTag.list, ...ConstTyTag[] ]
//    | [ ConstTyTag.pair, ...ConstTyTag[] ]
//    | [ ConstTyTag.data ];

export default ConstType;

export function isWellFormedConstType( type: ConstType | ConstTyTag[] ): boolean
{
    if( !Array.isArray( type ) ) return false;
    if( type.length === 0 ) return false;

    if( !type.every( isConstTypeTag ) ) return false;

    if( 
        type[0] !== ConstTyTag.list && 
        type[0] !== ConstTyTag.pair
    ) return (type.length === 1);


    // keeps track of the missing terms to provide as argument
    // well formed types from this point must start with either 'ConstTyTag.list' of 'ConstTyTag.pair'
    // in any case the stack must count that tag as top level
    const stack : ( 0 | 1 | 2 )[] = [ 1 ];

    if(
        type[0] !== ConstTyTag.list &&
        type[0] !== ConstTyTag.pair
    )
    {
        Debug.warn( constTypeToStirng( type ) );
        // should never get here because of the first check
        Debug.throw("type which doesn'take arguments was passed with arguments")
        // returning false anyway in producton, type has too many arguments, not well-formed
        return false;
    }

    function topStackMinusOne()
    {
        JsRuntime.assert(
            stack.length > 0,
            JsRuntime.makeNotSupposedToHappenError(
                "while calling 'topStackMinusOne' in 'ConstEmptyList._isWellFormedListType'; stack was empty"
            )
        );

        const missingTyArgsToProvide = stack[ stack.length - 1 ] - 1;

        if( missingTyArgsToProvide < 0 )
        {
            throw JsRuntime.makeNotSupposedToHappenError(
                "while checking for type correctness in empty constant list; stack element was less than 0"
            );
        }
        
        stack[ stack.length - 1 ] = missingTyArgsToProvide as ( 0 | 1 );
    }

    for( let i = 0; i < type.length; i++ )
    {
        const ty = type[i];

        if( ty === ConstTyTag.list )
        {
            if(!( (i + 1) < type.length )) return false;

            topStackMinusOne();
            stack.push( 1 ); // add new layer
        }
        else if( ty === ConstTyTag.pair )
        {
            if(!( (i + 2) < type.length )) return false;

            topStackMinusOne();
            stack.push( 2 ); // add new layer for pair
        }
        else
        {
            topStackMinusOne(); // got an argument
        }

        // clear fulfilled layers
        while(
            stack.length > 0 &&
            stack[ stack.length - 1 ] === 0
        )
        {
            stack.pop(); // clear layer
        }

        if(                             // if
            stack.length === 0 &&       // stack is empty
            i !== ( type.length - 1)    // and we are not at the end of the type
        )
        {
            return false; // addtional types provided
        }

        if(                                 // if
            i === ( type.length - 1 ) &&    // we are at the end of the type
            stack.length !== 0              // and the stack expects some more arguments
        )
        {
            return false; // missing some arguments
        }
    }

    return true;
}

export function encodeConstTypeToUPLCBitStream( type: ConstType ): BitStream
{
    JsRuntime.assert(
        isWellFormedConstType( type ),
        "cannot encode an UPLC constant type if it is not well formed"
    );

    /**
     *
     * Source: plutus-core-specification-june2022.pdf; section D.3.3; page 31
     *
     *  We define the encoder and decoder for types by combining 𝖾 𝗍𝗒𝗉𝖾 and 𝖽 𝗍𝗒𝗉𝖾 with 𝖤
     *  and decoder for lists of four-bit integers (see Section D.2).
     * 
     * Section D.2 ( D.2.2 )
     * 
     * Suppose that we have a set 𝑋 for which we have defined an encoder 𝖤 𝑋 and a decoder 𝖣 𝑋 ; we define an
⃖⃗     * 𝑋 which encodes lists of elements of 𝑋 by emitting the encodings of the elements of the list,
     * encoder 𝖤
     * **each preceded by a 𝟷 bit, then emitting a 𝟶 bit to mark the end of the list.**
     * 
     */
    function _encodeConstTyTagToUPLCBinaryString( typeTag: ConstTyTag ): string
    {
        if( typeTag === ConstTyTag.list )
        {
            return (
                "1" + "0111" +              // cons + (7).toString(2).padStart( 4, '0' ) // type application
                "1" + "0101"                // cons + (5).toString(2).padStart( 4, '0' ) // list
                // "0"                        // nil // not needed (well formed) types do expects other tags after list
            );
        }
        else if( typeTag === ConstTyTag.pair )
        {
            return (
                "1" + "0111" + // cons + (7).toString(2).padStart( 4, '0' ) // type application
                "1" + "0111" + // cons + (7).toString(2).padStart( 4, '0' ) // type application
                "1" + "0110"   // cons + (5).toString(2).padStart( 4, '0' ) // pair
                // "0"            // nil // not needed (well formed) types do expects other tags after pairs
            );
        }
        else
        {
            return (
                "1" + typeTag.toString(2).padStart( 4, '0' ) + "0"
            ); 
        }
    }

    return BitStream.fromBinStr(
        new BinaryString(
            type.map( _encodeConstTyTagToUPLCBinaryString ).join('')
        )
    );
}

/**
 * **does NOT require the types to be well-formed**
 * 
 * merly checks to have the same tags at the same place
 */
export function constTypeEq( a: ConstType, b: ConstType ): boolean
{
    if( a.length !== b.length ) return false;

    return a.every( ( tyTag, i ) => tyTag === b[ i ] );
}

/**
 * well formed types
 */
export const constT : Readonly<{
    int: ConstType,
    byteStr: ConstType,
    str: ConstType,
    unit: ConstType
    bool: ConstType
    listOf: ( tyArg: ConstType ) => ConstType
    pairOf: ( tyArg1: ConstType, tyArg2: ConstType ) => ConstType
    data: ConstType
}> = Object.freeze({

    int:        [ ConstTyTag.int ],
    byteStr:    [ ConstTyTag.byteStr ],
    str:        [ ConstTyTag.str ],
    unit:       [ ConstTyTag.unit ],
    bool:       [ ConstTyTag.bool ],
    
    listOf: ( tyArg: ConstType ) : ConstType => {
        JsRuntime.assert(
            isWellFormedConstType( tyArg ),
            "provided argument to 'constT.listOf' should be a well formed type, try using types exposed by  the 'constT' object itself"
        );

        return [ ConstTyTag.list, ...tyArg ];
    },
    
    pairOf: ( tyArg1: ConstType, tyArg2: ConstType ) : ConstType  => {
        JsRuntime.assert(
            isWellFormedConstType( tyArg1 ) && isWellFormedConstType( tyArg2 ),
            "provided argument to 'constT.pairOf' should be a well formed type, try using types exposed by  the 'constT' object itself"
        );

        return [ ConstTyTag.pair, ...tyArg1, ...tyArg2 ];
    },
    
    data:       [ ConstTyTag.data ]

});



export function isConstTypeTag( constTy: Readonly<ConstTyTag> ): boolean
{
    constTy = constTy as unknown as ConstTyTag;

    return (
        constTy === ConstTyTag.int     ||
        constTy === ConstTyTag.byteStr ||
        constTy === ConstTyTag.str     ||
        constTy === ConstTyTag.unit    ||
        constTy === ConstTyTag.bool    ||
        constTy === ConstTyTag.list    ||
        constTy === ConstTyTag.pair    ||
        // (constTyTag as number) === 7   || // uncomment if tyApp should be considered
        constTy === ConstTyTag.data
    );
}

export type ConstTyTagString
    = "integer"
    | "bytestring"
    | "string"
    | "unit"
    | "boolean"
    | "list"
    | "pair"
    | "data"


export function constTypeTagToStirng( ty: Readonly<ConstTyTag> ): ConstTyTagString
{
    switch( ty as unknown as ConstTyTag )
    {
        case ConstTyTag.int: return "integer";
        case ConstTyTag.byteStr: return "bytestring";
        case ConstTyTag.str: return "string";
        case ConstTyTag.unit: return "unit";
        case ConstTyTag.bool: return "boolean";
        case ConstTyTag.list: return "list";
        case ConstTyTag.pair: return "pair";
        case ConstTyTag.data: return "data";

        default:
            Debug.log( ty )
            throw new BasePlutsError("'constTypeTAgToStirng' is supposed to have a member of the 'ConstTy' enum as input but got: " + ty);
    }
}

export function constTypeToStirng( ty: ConstType ): string
{
    return ty.map( constTypeTagToStirng ).join(' ');
}

// -------------------------------------------------- ConstListType Utils -------------------------------------------------- //

function getConstListTypeArgument( listTy: [ ConstTyTag.list, ...ConstType ] ) : ConstType
{
    JsRuntime.assert(
        listTy.length > 0 && listTy[0] === ConstTyTag.list && isWellFormedConstType( listTy ),
        "in 'constListTypeUtils.getTypeArgument', input type was not a valid list type"
    );

    return listTy.slice( 1 );
};

function getNonWellFormedConstListTypeArgument( listTy: [ ConstTyTag.list, ...ConstType ] ) : (ConstType | undefined)
{
    JsRuntime.assert(
        listTy.length > 0 && listTy[0] === ConstTyTag.list,
        "in 'constListTypeUtils.getTypeArgument', input type was not a valid list type"
    );

    const rawArg = listTy.slice( 1 );

    if( rawArg.length === 0 ) return undefined;

    if( isWellFormedConstType( rawArg ) ) return rawArg;

    if( 
        rawArg[0] !== ConstTyTag.list &&
        rawArg[0] !== ConstTyTag.pair
    )
    {
        return [ rawArg[0] ];
    }

    if( rawArg[0] === ConstTyTag.list )
    {
        const tyArgOfList = getNonWellFormedConstListTypeArgument( rawArg as [ ConstTyTag.list, ...ConstType ] );

        if( tyArgOfList === undefined ) return undefined;

        return [ ConstTyTag.list, ...tyArgOfList ];
    }

    if( rawArg[0] === ConstTyTag.pair )
    {
        const firstArg = getNonWellFormedConstPairFirstTypeArgument( rawArg as [ ConstTyTag.pair, ...ConstType ] );

        if( firstArg === undefined )
        {
            return undefined;
        }

        const secondArg = getNonWellFormedConstPairSecondTypeArgument( rawArg as [ ConstTyTag.pair, ...ConstType ] );

        if( secondArg === undefined )
        {
            return undefined;
        }

        return constT.pairOf( firstArg, secondArg );
    }
}

export const constListTypeUtils = Object.freeze({
    getTypeArgument: getConstListTypeArgument,

    nonWellFormed: Object.freeze({
        /**
         * 
         * @param listTy 
         * @returns 
         *      ```undefined``` only if the type argument was not complete
         *      returns the sliced type argument if too many where provided
         *      same of ```constListTypeUtils.getTypeArgument``` if the type argument was well formed
         */
        getNonWellFormedTypeArgument: getNonWellFormedConstListTypeArgument,
    }),
});

// -------------------------------------------------- ConstPairType Utils -------------------------------------------------- //

function getConstPairFirstTypeArgument( pairTy: [ ConstTyTag.pair, ...ConstType ] | ConstType ) : ConstType
{
    JsRuntime.assert(
        pairTy.length > 0 && pairTy[0] === ConstTyTag.pair && isWellFormedConstType( pairTy ),
        "in 'constPairTypeUtils.getFirstTypeArgument', input type was not a valid pair type"
    );

    const rawArg = pairTy.slice(1);

    if( rawArg.length === 0 )
    {
        throw JsRuntime.makeNotSupposedToHappenError(
            "'pairTy' was supposed to be well formed but is missing arguments for 'ConstTyTag.pair'"
        )
    }
    
    if( 
        rawArg[0] !== ConstTyTag.list &&
        rawArg[0] !== ConstTyTag.pair
    )
    {
        // argument takes no more arguments
        return [ pairTy[1] ];
    }

    if( rawArg[0] === ConstTyTag.list )
    {
        // non well formed in order to ignore the second argument
        const listTyArg = getNonWellFormedConstListTypeArgument( rawArg as [ ConstTyTag.list, ...ConstType ] );

        if( listTyArg === undefined )
        {
            throw JsRuntime.makeNotSupposedToHappenError(
                "in 'getConstPairFirstTypeArgument' (exported as 'constPairTypeUtils.getFirstTypeArgument'); " +
                "'listTyArg' was expected to be a well formed type but was missing some arguments to be well formed; " +
                "this case sould have trown while checking for the 'pairTy' to be well formed"
            );
        }

        return [ ConstTyTag.list, ...listTyArg ];
    }

    if( rawArg[0] === ConstTyTag.pair )
    {
        const firstArg = getNonWellFormedConstPairFirstTypeArgument( rawArg as [ ConstTyTag.pair, ...ConstType ] );

        if( firstArg === undefined )
        {
            throw JsRuntime.makeNotSupposedToHappenError(
                "in 'getConstPairFirstTypeArgument'; " +
                "'firstArg' was expected to be a well formed type but was missing some arguments to be well formed; " +
                "this case sould have trown while checking for the 'pairTy' to be well formed"
            );
        }

        const secondArg = getNonWellFormedConstPairSecondTypeArgument( rawArg as [ ConstTyTag.pair, ...ConstType ] );

        if( secondArg === undefined )
        {
            throw JsRuntime.makeNotSupposedToHappenError(
                "in 'getConstPairFirstTypeArgument'; " +
                "'secondArg' was expected to be a well formed type but was missing some arguments to be well formed; " +
                "this case sould have trown while checking for the 'pairTy' to be well formed"
            );
        }

        return constT.pairOf( firstArg, secondArg );
    }

    throw JsRuntime.makeNotSupposedToHappenError(
        "unexpected execution flow; 'getConstPairFirstTypeArgument' did not match any `ConstTyTag` as first argument"
    );
}

function getConstPairSecondTypeArgument( pairTy: [ ConstTyTag.pair, ...ConstType ] | ConstType ) : ConstType
{
    /*
    JsRuntime.assert(
        pairTy.length > 0 && pairTy[0] === ConstTyTag.pair && isWellFormedConstType( pairTy ),
        "in 'constPairTypeUtils.getFirstTypeArgument', input type was not a valid pair type"
    );*/ // made in the 'getConstPairFirstTypeArgument'call

    // if pairTy is not well formed throws
    // if doesn't throw is well formed
    // if it is well formed the sliced part is the well formed type
    return pairTy.slice( 1 + getConstPairFirstTypeArgument( pairTy ).length );
}

function getNonWellFormedConstPairFirstTypeArgument( pairTy: [ ConstTyTag.pair, ...ConstType ] | ConstType ): (ConstType | undefined)
{
    JsRuntime.assert(
        pairTy.length > 0 && pairTy[0] === ConstTyTag.pair,
        "in 'constPairTypeUtils.getFirstTypeArgument', input type was not a valid pair type"
    );

    const rawArg = pairTy.slice(1);

    // at least two tags mus follow in order to be fulfilled
    if( rawArg.length < 2 )
    {
        return undefined;
    }
    
    if( 
        rawArg[0] !== ConstTyTag.list &&
        rawArg[0] !== ConstTyTag.pair
    )
    {
        // argument takes no more arguments
        return [ pairTy[1] ];
    }

    if( rawArg[0] === ConstTyTag.list )
    {
        // non well formed in order to ignore the second argument
        const listTyArg = getNonWellFormedConstListTypeArgument( rawArg as [ ConstTyTag.list, ...ConstType ] );

        if( listTyArg === undefined ) return undefined;

        return [ ConstTyTag.list, ...listTyArg ];
    }

    if( rawArg[0] === ConstTyTag.pair )
    {
        const firstArg = getNonWellFormedConstPairFirstTypeArgument( rawArg as [ ConstTyTag.pair, ...ConstType ] );

        if( firstArg === undefined )
        {
            return undefined;
        }

        const secondArg = getNonWellFormedConstPairSecondTypeArgument( rawArg as [ ConstTyTag.pair, ...ConstType ] );

        if( secondArg === undefined )
        {
            return undefined;
        }

        return constT.pairOf( firstArg, secondArg );
    }

    throw JsRuntime.makeNotSupposedToHappenError(
        "unexpected execution flow; 'getNonWellFormedConstPairFirstTypeArgument' did not match any `ConstTyTag` as first argument"
    );
}

function getNonWellFormedConstPairSecondTypeArgument( pairTy: [ ConstTyTag.pair, ...ConstType ] | ConstType ): (ConstType | undefined)
{
    /*
    JsRuntime.assert(
        pairTy.length > 0 && pairTy[0] === ConstTyTag.pair,
        "in 'constPairTypeUtils.getFirstTypeArgument', input type was not a valid pair type"
    );
    */ // made in the 'getNonWellFormedConstPairFirstTypeArgument' call

    const pairFirstTyArg = getNonWellFormedConstPairFirstTypeArgument( pairTy );

    if( pairFirstTyArg === undefined ) return undefined;

    const rawSecondArg = pairTy.slice( 1 + pairFirstTyArg.length );

    if( rawSecondArg.length === 0 ) return undefined;

    if( 
        rawSecondArg[0] !== ConstTyTag.list &&
        rawSecondArg[0] !== ConstTyTag.pair
    )
    {
        // argument takes no more arguments
        return [ rawSecondArg[0] ];
    }

    if( rawSecondArg[0] === ConstTyTag.list )
    {
        // non well formed in order to ignore the second argument
        const listTyArg = getNonWellFormedConstListTypeArgument( rawSecondArg as [ ConstTyTag.list, ...ConstType ] );

        if( listTyArg === undefined ) return undefined;

        return [ ConstTyTag.list, ...listTyArg ];
    }

    if( rawSecondArg[0] === ConstTyTag.pair )
    {
        const firstArg = getNonWellFormedConstPairFirstTypeArgument( rawSecondArg as [ ConstTyTag.pair, ...ConstType ] );

        if( firstArg === undefined )
        {
            return undefined;
        }

        const secondArg = getNonWellFormedConstPairSecondTypeArgument( rawSecondArg as [ ConstTyTag.pair, ...ConstType ] );

        if( secondArg === undefined )
        {
            return undefined;
        }

        return constT.pairOf( firstArg, secondArg );
    }

    throw JsRuntime.makeNotSupposedToHappenError(
        "unexpected execution flow; 'getNonWellFormedConstPairFirstTypeArgument' did not match any `ConstTyTag` as first argument"
    );
}

export const constPairTypeUtils = Object.freeze({
    getFirstTypeArgument:                   getConstPairFirstTypeArgument,
    getSecondTypeArgument:                  getConstPairSecondTypeArgument,
    nonWellFormed: Object.freeze({
        /**
         * 
         * @param listTy 
         * @returns 
         *      ```undefined``` only if the type argument was not complete
         *      returns the sliced type argument if too many where provided
         *      same of ```constPairTypeUtils.getFirstTypeArgument``` if the type argument was well formed
         */
        getFirstTypeArgument:      getNonWellFormedConstPairFirstTypeArgument,
        /**
         * 
         * @param listTy 
         * @returns 
         *      ```undefined``` only if the type argument was not complete
         *      returns the sliced type argument if too many where provided
         *      same of ```constPairTypeUtils.getSecondTypeArgument``` if the type argument was well formed
         */
        getSecondTypeArgument:     getNonWellFormedConstPairSecondTypeArgument
    }),
});