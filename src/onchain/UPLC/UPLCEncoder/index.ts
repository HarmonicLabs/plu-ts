import JsRuntime from "../../../utils/JsRuntime";
import UPLCFlatUtils from "../../../utils/UPLCFlatUtils";

import { ConstType, ConstTyTag, isWellFormedConstType } from "../UPLCTerms/UPLCConst/ConstType";
import { ConstValue, isConstValue, isConstValueList } from "../UPLCTerms/UPLCConst/ConstValue";
import { getNRequiredForces, isUPLCBuiltinTag } from "../UPLCTerms/Builtin/UPLCBuiltinTag";
import { Integer, UInteger } from "../../../types/ints/Integer";
import { UPLCTerm, getHoistedTerms, isPureUPLCTerm, PureUPLCTerm, showUPLC } from "../UPLCTerm";
import { HoistedUPLC, getSortedHoistedSet } from "../UPLCTerms/HoistedUPLC";
import { BinaryString } from "../../../types/bits/BinaryString";
import { BitStream } from "../../../types/bits/BitStream";
import { ByteString } from "../../../types/HexString/ByteString";
import { Pair } from "../../../types/structs/Pair";
import { Data, isData } from "../../../types/Data/Data";
import { UPLCProgram } from "../UPLCProgram";
import { UPLCVersion } from "../UPLCProgram/UPLCVersion";
import { Application } from "../UPLCTerms/Application";
import { Builtin } from "../UPLCTerms/Builtin";
import { UPLCConst } from "../UPLCTerms/UPLCConst";
import { Delay } from "../UPLCTerms/Delay";
import { ErrorUPLC } from "../UPLCTerms/ErrorUPLC";
import { Force } from "../UPLCTerms/Force";
import { Lambda } from "../UPLCTerms/Lambda";
import { UPLCVar } from "../UPLCTerms/UPLCVar";
import { UPLCSerializationContex } from "./UPLCSerializationContext";
import { CborString } from "../../../cbor/CborString";
import { dataFromCbor } from "../../../types/Data/fromCbor";
import { dataToCbor } from "../../../types/Data/toCbor";
import { genHoistedSourceUID } from "../UPLCTerms/HoistedUPLC/HoistedSourceUID/genHoistedSourceUID";
import { BasePlutsError } from "../../../errors/BasePlutsError";

/*
 * --------------------------- [encode vs serialize methods] ---------------------------
 *
 *  in the ```UPLCEncoder``` class are present various methods of which name starts with "encode" or "serialize"
 *  directly followed by the type of the expected argument.
 *
 *  all the "serialize" functions are **PURE**; meaning given the expected input those will return the output without executing side-effects;
 *
 *  all the "encode" methods have the side effect to update the context before and always return the equivalent of the "serialize" counterpart;
 *
 *  for this reason, when it is common the pattern
 *  ```ts
 *  encode( uplcObj: UPLC ): BitStream
 *  {
 *      const serialized = serilize( uplcObj );
 *      this._ctx.incrementLengthBy( serialized.length );
 *      return serialized;
 *  }
 *  ```
*/

function serializeUInt( uint: UInteger | bigint ): BitStream
{
    return UPLCFlatUtils.encodeBigIntAsVariableLengthBitStream( typeof uint === "bigint" ? uint : uint.asBigInt );
}

function serializeInt( int: Integer ): BitStream
{
    JsRuntime.assert(
        Integer.isStrictInstance( int ),
        "'serializeInt' only works for Signed Integer; " +
        "try using int.toSigned() if you are using a derived class; inpout was: " + int
    )

    return serializeUInt(
        new UInteger(
            UPLCFlatUtils.zigzagBigint(
                int.asBigInt
            )
        )
    );
}

function serializeVersion( version: UPLCVersion ): BitStream
{
    const result = serializeUInt( version.major );
    result.append( serializeUInt( version.minor ) );
    result.append( serializeUInt( version.patch ) );
    return result;
}

function serializeUPLCVar( uplcVar: UPLCVar ): BitStream
{
    const result = UPLCVar.UPLCTag;
    result.append(
        serializeUInt(
            // no idea why deBruijn indicies start form 1...s
            // can dev do something?
            uplcVar.deBruijn.asBigInt + BigInt( 1 )
        )
    );
    return result;
}

function serializeConstType( type: ConstType ): BitStream
{
    JsRuntime.assert(
        isWellFormedConstType( type ),
        "cannot serialize an UPLC constant type if it is not well formed"
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
    function _serializeConstTyTagToUPLCBinaryString( typeTag: ConstTyTag ): string
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
                "1" + typeTag.toString(2).padStart( 4, '0' )
            ); 
        }
    }

    return BitStream.fromBinStr(
        new BinaryString(
            type.map( _serializeConstTyTagToUPLCBinaryString ).join('') + "0"
        )
    );
}

/**
 * exported for testing purposes
 */
export function serializeBuiltin( bn: Builtin ): BitStream
{
    JsRuntime.assert(
        isUPLCBuiltinTag( bn.tag ),
        "while serializing a Builtin 'bn.tag' is not a valid builtin tag: bn.tag: " + bn.tag
    );

    const result = BitStream.fromBinStr(
        "0101".repeat( getNRequiredForces( bn.tag ) ) // "force" tag repeated as necessary
    );

    result.append(
        Builtin.UPLCTag
    );
    
    result.append(
        BitStream.fromBinStr(
            new BinaryString(
                bn.tag.toString(2).padStart( 7 , '0' ) // builtin tag takes 7 bits
            )
        )
    );

    return result;
} 



// ------------------------------------------------------------------------------------------------------------------- //
// --------------------------------------------------- UPLCEncoder --------------------------------------------------- //
// ------------------------------------------------------------------------------------------------------------------- //

function properlyCloneUPLC( uplc: UPLCTerm ): UPLCTerm
{
    if( uplc instanceof UPLCVar ) return new UPLCVar( uplc.deBruijn );
    if( uplc instanceof Delay ) return new Delay( properlyCloneUPLC( uplc.delayedTerm ) );
    if( uplc instanceof Lambda ) return new Lambda( properlyCloneUPLC( uplc.body ) );
    if( uplc instanceof Application )
        return new Application(
            properlyCloneUPLC( uplc.funcTerm ),
            properlyCloneUPLC( uplc.argTerm )
        );
    if( uplc instanceof UPLCConst ) return new UPLCConst( uplc.type, uplc.value as any);
    if( uplc instanceof Force ) return new Force( properlyCloneUPLC( uplc.termToForce ) );
    if( uplc instanceof ErrorUPLC ) return new ErrorUPLC( uplc.msg, uplc.addInfos );
    if( uplc instanceof Builtin ) return new Builtin( uplc.tag );
    if( uplc instanceof HoistedUPLC ) return new HoistedUPLC( uplc.UPLC, undefined );

    throw new BasePlutsError(
        "unknown UPLC in 'properlyCloneUPLC'"
    );
}

/**
 * ### !! Important !!
 * 
 * **_SIDE-EFFECT_**: modifies the input; in particular replaces
 * ```HoistedTerm```s with ```UPLCVar```s that are free in the term
 * 
 * @param uplc **after this call is not guaranteed the term passed is closed**
 * 
 * @returns {PureUPLCTerm} a term without HoistedUPLC, closed if the input was closed
 * 
 * exported for only for testing
 */
export function replaceHoistedTermsInplace( uplc: UPLCTerm ): PureUPLCTerm
{
    /**
     * reference to the outermost term
    */
    let program = uplc;

    const sortedHoistedSet = getSortedHoistedSet( getHoistedTerms( uplc ) );

    // adds the actual terms
    for( let i = sortedHoistedSet.length - 1; i >= 0; i-- )
    {
        program = new Application(
            new Lambda( program ),
            sortedHoistedSet[i].UPLC
        );
    }

    /*
     * TODO:
     */
    /*
    const shouldBeReplaced: boolean[] = new Array( sortedHoistedSet.length ).fill( true );

    function inlineSingleRefs( term: UPLCTerm ): void
    {

    }
    //*/

    /*
    IMPORTANT

    THIS NEEDS TO BE MODIFIED ONCE THE ABOVE IS IMPLEMENTED
    SINCE INLINING MAY IMPLY CHANGING THE DEBRUJN LEVEL OF OTHER HOISTED TERMS
    */
    function getUPLCVarForHoistedAtLevel( _hoisted: HoistedUPLC, level: number ): UPLCVar
    {
        const levelOfTerm = sortedHoistedSet.findIndex( sortedH => BitStream.eq( sortedH.compiled, _hoisted.compiled ) );
        return new UPLCVar( level - (levelOfTerm + 1) );
    }

    /**
     * replaces HoistedUPLC instances with UPLCVar
     * (HoistedTerms with dependecies included)
     */ 
    function replaceWithUPLCVar( t: UPLCTerm, dbnLevel: number ): void
    {
        if( t instanceof UPLCVar ) return;
        if( t instanceof Delay )
        {
            if( t.delayedTerm instanceof HoistedUPLC )
                t.delayedTerm = getUPLCVarForHoistedAtLevel( t.delayedTerm, dbnLevel );
            else replaceWithUPLCVar( t.delayedTerm, dbnLevel );
            return;
        }
        if( t instanceof Lambda )
        {
            if( t.body instanceof HoistedUPLC )
                t.body = getUPLCVarForHoistedAtLevel( t.body, dbnLevel + 1 );
            else replaceWithUPLCVar( t.body , dbnLevel + 1 )
            return;
        }
        if( t instanceof Application )
        {
            if( t.argTerm instanceof HoistedUPLC )
                t.argTerm = getUPLCVarForHoistedAtLevel( t.argTerm, dbnLevel );
            else replaceWithUPLCVar( t.argTerm, dbnLevel );
            
            if( t.funcTerm instanceof HoistedUPLC )
                t.funcTerm = getUPLCVarForHoistedAtLevel( t.funcTerm, dbnLevel );
            else replaceWithUPLCVar( t.funcTerm, dbnLevel );

            return;
        }
        if( t instanceof UPLCConst ) return;
        if( t instanceof Force )
        {
            if( t.termToForce instanceof HoistedUPLC )
                t.termToForce = getUPLCVarForHoistedAtLevel( t.termToForce, dbnLevel );
            else replaceWithUPLCVar( t.termToForce, dbnLevel );

            return;
        }
        if( t instanceof ErrorUPLC ) return;
        if( t instanceof Builtin )   return;
        if( t instanceof HoistedUPLC )
        {
            throw JsRuntime.makeNotSupposedToHappenError(
                "'replaceWithUPLCVar', local funciton in 'replaceHoistedTermsInplace';" +
                "encountered an 'HoistedUPLC'; this was supposed to be replaced in the parent term case."
            );
        }

        throw JsRuntime.makeNotSupposedToHappenError(
            "'replaceWithUPLCVar', local funciton in 'replaceHoistedTermsInplace'; did not match any 'UPLCTerm' constructor"
        )
    }

    replaceWithUPLCVar( program, 0 );

    return program;
}

export class UPLCEncoder
{
    private _ctx: UPLCSerializationContex

    constructor()
    {
        this._ctx = new UPLCSerializationContex({
            currLength: 0
        });
    }

    compile( program: UPLCProgram ): BitStream
    {
        const v = program.version
        const result = this.encodeVersion( v );
        this._ctx.updateVersion( v );

        const uplc = program.body;
        
        const progrTerm = replaceHoistedTermsInplace(
            // HoistedUPLC relies on this clone
            // if this ever changes make sure that `HositeUPLC` is safe
            uplc.clone()
        );
        if( !isPureUPLCTerm( progrTerm ) )
        {
            throw JsRuntime.makeNotSupposedToHappenError(
                "'replaceHoisteTerm' did not returned a 'PureUPLCTerm'"
            );
        }

        result.append(
            this.encodeTerm(
                progrTerm
            )
        );
        
        UPLCFlatUtils.padToByte( result );

        return result;
    }
    
    static get compile(): ( program: UPLCProgram ) => BitStream
    {
        return ( program: UPLCProgram ) => {
            return (new UPLCEncoder()).compile( program )
        };
    }

    encodeVersion( version: UPLCVersion ): BitStream
    {
        const serialized = serializeVersion( version );
        this._ctx.incrementLengthBy( serialized.length );
        return serialized;
    }

    encodeTerm( term: PureUPLCTerm ): BitStream
    {
        if( term instanceof UPLCVar )       return this.encodeUPLCVar( term );
        if( term instanceof Delay )         return this.encodeDelayTerm( term );
        if( term instanceof Lambda )        return this.encodeLambdaTerm( term );
        if( term instanceof Application )   return this.encodeApplicationTerm( term );
        if( term instanceof UPLCConst )     return this.encodeConstTerm( term );
        if( term instanceof Force )         return this.encodeForceTerm( term );
        if( term instanceof ErrorUPLC )     return this.encodeUPLCError( term );
        if( term instanceof Builtin )       return this.encodeBuiltin( term );

        throw JsRuntime.makeNotSupposedToHappenError(
            "'UPLCEncoder.encodeTerm' did not match any 'PureUPLCTerm'"
        );
    }

    encodeUPLCVar( uplcVar: UPLCVar ): BitStream
    {
        const serialized = serializeUPLCVar( uplcVar );
        this._ctx.incrementLengthBy( serialized.length );
        return serialized;
    }

    encodeDelayTerm( delayed: Delay ): BitStream
    {
        const result = Delay.UPLCTag;
        this._ctx.incrementLengthBy( result.length );

        result.append(
            this.encodeTerm( delayed.delayedTerm )
        );

        return result;
    }

    encodeLambdaTerm( lam: Lambda ): BitStream
    {
        const result = Lambda.UPLCTag;
        this._ctx.incrementLengthBy( result.length );

        /*
        only the body of the lambda is encoded since the new variable is implicit
        this is not referencied in any current specification but it is present in the `plutus` source code:

        Here is where they called encode with the binder while encoding a Lambda Term

        https://github.com/input-output-hk/plutus/blob/c8d4364d0e639fef4d5b93f7d6c0912d992b54f9/plutus-core/untyped-plutus-core/src/UntypedPlutusCore/Core/Instance/Flat.hs#L110


        Here is where binder is defined

        https://github.com/input-output-hk/plutus/blob/c8d4364d0e639fef4d5b93f7d6c0912d992b54f9/plutus-core/plutus-core/src/PlutusCore/Core/Type.hs#L228


        And (most importantly) where flat encoding for binder is derived

        https://github.com/input-output-hk/plutus/blob/c8d4364d0e639fef4d5b93f7d6c0912d992b54f9/plutus-core/plutus-core/src/PlutusCore/Flat.hs#L354
        */
        result.append(
            this.encodeTerm(
                lam.body
            )
        );

        return result;
    }
    
    encodeApplicationTerm( app: Application ): BitStream
    {
        const result = Application.UPLCTag;
        this._ctx.incrementLengthBy( result.length );

        result.append(
            this.encodeTerm( app.funcTerm ) 
        );
    
        result.append(
            this.encodeTerm( app.argTerm )
        );
    
        return result;
    }

    encodeConstTerm( uplcConst: UPLCConst ): BitStream
    {
        const result = UPLCConst.UPLCTag
        
        result.append(
            serializeConstType(
                uplcConst.type
            )
        );

        // tag and type where both context indipendent
        this._ctx.incrementLengthBy( result.length );

        result.append(
            this.encodeConstValue(
                uplcConst.value
            )
        );

        return result;
    }

    encodeConstValue( value: ConstValue ): BitStream
    {
        JsRuntime.assert(
            isConstValue( value ),
            "a 'ConstValue' instance was expected; got" + value
        );
    
        if( value === undefined ) return new BitStream();
        if( value instanceof Integer ) 
        {
            const _i = serializeInt( value );
            // ints are always serialized in chunks of 8 bits
            // this should be irrelevant but still good to have
            this._ctx.incrementLengthBy( _i.length );
            return _i;
        }
        if( value instanceof ByteString &&
            (
                ByteString.isStrictInstance( value )
            )
        )
        {
            // padding is added based on context
            return this.encodeConstValueByteString( value )
        }
        if( typeof value === "string" )
        {
            /*
            Section D.2.6 Strings (page 28)
    
            We have defined values of the string type to be sequences of Unicode characters. As mentioned earlier
            we do not specify any particular internal representation of Unicode characters, but for serialisation we use
            the UTF-8 representation to convert between strings and bytestrings
            
            **and then use the bytestring encoder and decoder**:
            */
            return this.encodeConstValue(
                new ByteString(
                    Buffer.from( value, "utf8" )
                )
            );
        }
        if( typeof value === "boolean" )
        {
            const _b = BitStream.fromBinStr( value === true ? "1" : "0" );
            this._ctx.incrementLengthBy( _b.length );
            return _b;
        }
        if( isConstValueList( value ) )
        {
            const result: BitStream = new BitStream();
            
            /*
            operations on bigints (BitStream underlying type) are O(n)
            appending first to this BitStream and then to the effective result
            should give us some performace improvements
            */
            let listElem: BitStream;
    
            for( let i = 0; i < value.length; i++ )
            {
                // cons
                listElem = BitStream.fromBinStr("1");
                this._ctx.incrementLengthBy( 1 );

                // set list element
                listElem.append(
                    this.encodeConstValue(
                        value[i]
                    )
                );
                
                // append element
                // length already updated since using an "encode" function
                result.append( listElem );
            }

            // nil
            result.append(
                BitStream.fromBinStr("0")
            );
            this._ctx.incrementLengthBy( 1 );
    
            return result;
        }
        if( value instanceof Pair )
        {
            const result: BitStream = this.encodeConstValue( value.fst );
    
            result.append(
                this.encodeConstValue(
                    value.snd
                )
            );
    
            return result;
        }

        if( value instanceof CborString )
        {
            value = dataFromCbor( value );
        }
        if( isData( value ) )
        {
            return this.encodeConstValueData( value );
        }
    
        throw JsRuntime.makeNotSupposedToHappenError(
            "'this.encodeConstValue' did not matched any 'ConstValue' possible type; input was: " + value
        );
    }

    /**
     * ### Section D.3.5
     * The ```data``` type
     * 
     * The 𝚍𝚊𝚝𝚊 type is encoded by converting to a bytestring using the CBOR encoding described in Note 1 of
     * Appendix B.2 and then using 𝖤 𝕌 ∗ . The decoding process is the opposite of this: a bytestring is obtained
     * using 𝖣 𝕌 ∗ and this is then decoded from CBOR to obtain a 𝚍𝚊𝚝𝚊 object.
     * 
     * ### Section B.2
     * 
     * **Note 1.** Serialising 𝚍𝚊𝚝𝚊 objects. The ```serialiseData``` function takes a 𝚍𝚊𝚝𝚊 object and converts it
     * into a CBOR (Bormann and Hoffman [2020]) object. The encoding is based on the Haskell Data type
     * described in Section A.1. A detailed description of the encoding will appear here at a later date, but for
     * the time being see the Haskell code in 
     * [plutus-core/plutus-core/src/PlutusCore/Data.hs](https://github.com/input-output-hk/plutus/blob/master/plutus-core/plutus-core/src/PlutusCore/Data.hs) 
     * ([```encodeData``` line](https://github.com/input-output-hk/plutus/blob/9ef6a65067893b4f9099215ff7947da00c5cd7ac/plutus-core/plutus-core/src/PlutusCore/Data.hs#L139))
     * in the Plutus GitHub repository IOHK [2019] for a definitive implementation.
     */
    encodeConstValueData( data: Data ): BitStream
    {
        const cborBytes = dataToCbor( data ).asBytes;

        if( cborBytes.length < 64 ) return this.encodeConstValueByteString( new ByteString( cborBytes ) );

        const head = cborBytes.at(0);
        if( head === undefined )
        throw JsRuntime.makeNotSupposedToHappenError(
            "encoded Data was empty"
        );

        const lengthAddInfo = (head & 0b000_11111);

        let nLenBytes = 0;
        if( lengthAddInfo === 27 ) nLenBytes = 8;
        if( lengthAddInfo === 26 ) nLenBytes = 4;
        if( lengthAddInfo === 25 ) nLenBytes = 2;
        if( lengthAddInfo === 24 ) nLenBytes = 1;

        let ptr = nLenBytes + 1 + 1 ;

        let largeCborData = "5f";

        while( ptr < cborBytes.length )
        {
            const chunkSize = Math.min( 62, cborBytes.length );
            const chunkEnd = ptr + chunkSize;

            let header = "";
            if( chunkSize < 24 ) header = (0b010_00000 & chunkSize).toString(16);
            else header = "58" + chunkSize.toString(16);

            largeCborData = largeCborData +
                header +
                cborBytes.subarray( ptr, chunkEnd ).toString("hex");
            
            ptr = chunkEnd;
        }

        return this.encodeConstValueByteString( new ByteString( Buffer.from( largeCborData + "ff", "hex" ) ) );
    }

    /**
     * latest specification (**_section D.2.5 Bytestrings; page 27_**)
     * specifies how bytestrings are byte-alligned before and the first byte indicates the length
     * 
     * **this function takes care of the length AND padding**
     * 
     */
    
    encodeConstValueByteString( bs: ByteString ): BitStream
    {
        let missingBytes = bs.asString;
        const isBadOne = missingBytes === "d87982d87981582066f225ce3f1acd5e9b133a09b571af99ea4f0742741d008e482d3d33a7329da300";

        const hexChunks: string[] = [];

        while( (missingBytes.length / 2) > 0b1111_1111 )
        {
            hexChunks.push( "ff" + missingBytes.slice( 0, 255 * 2 ) );
            missingBytes = missingBytes.slice( 255 * 2 );
        }

        if( missingBytes.length !== 0 )
        {
            hexChunks.push(
                (missingBytes.length / 2).toString(16).padStart( 2, '0' ) +
                missingBytes
            );
        }
        
        // end chunk
        hexChunks.push( "00" );

        const nPadBits = 8 - (this._ctx.currLength % 8);

        // add initial padding as needed by context
        const result = BitStream.fromBinStr(
            "1".padStart( nPadBits , '0' )
        );

        // append chunks
        result.append(
            new BitStream(
                Buffer.from(
                    hexChunks.join(''),
                    "hex"
                ),
                0
            )
        );

        this._ctx.incrementLengthBy( result.length );

        return result; 
    }

    encodeForceTerm( force: Force ): BitStream
    {
        if( force.termToForce instanceof Delay )
        {
            // cancels direct delays
            return this.encodeTerm( force.termToForce.delayedTerm );
        }

        const result = Force.UPLCTag;
        this._ctx.incrementLengthBy( result.length );

        result.append(
            this.encodeTerm(
                force.termToForce
            )
        )

        return result;
    }

    encodeUPLCError( _term: ErrorUPLC ): BitStream
    {
        const errTag = ErrorUPLC.UPLCTag
        this._ctx.incrementLengthBy( errTag.length );
        return errTag.clone();
    }

    encodeBuiltin( bn: Builtin ): BitStream
    {
        const result = serializeBuiltin( bn );
        this._ctx.incrementLengthBy( result.length );
        return result;
    }
}