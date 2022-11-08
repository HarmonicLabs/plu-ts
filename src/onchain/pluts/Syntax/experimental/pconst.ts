import CborString from "../../../../cbor/CborString";
import Data from "../../../../types/Data";
import ByteString from "../../../../types/HexString/ByteString";
import Integer from "../../../../types/ints/Integer";
import Pair from "../../../../types/structs/Pair";
import { DefaultNever, DefaultUndefined } from "../../../../utils/ts";
import ConstType, { constT } from "../../../UPLC/UPLCTerms/UPLCConst/ConstType";
import ConstValue from "../../../UPLC/UPLCTerms/UPLCConst/ConstValue";
import PType from "../../PType";
import PBool from "../../PTypes/PBool";
import PByteString from "../../PTypes/PByteString";
import PData from "../../PTypes/PData/PData";
import PInt from "../../PTypes/PInt";
import PList from "../../PTypes/PList";
import PPair from "../../PTypes/PPair";
import PString from "../../PTypes/PString";
import PUnit from "../../PTypes/PUnit";
import Term, { UnTerm } from "../../Term";

/**
 * **EXPERIMENTAL**
 */
function getReprConstType( jsValue: ConstValue | bigint | number | Buffer ): ConstType | undefined
{
    switch( typeof jsValue )
    {
        case "object":
            if( jsValue instanceof Integer ) return constT.int;
            if( jsValue instanceof Pair )
            {
                const fstConstT = getReprConstType( jsValue.fst );
                if( fstConstT === undefined ) return undefined; 
                
                const sndConstT = getReprConstType( jsValue.snd );
                if( sndConstT === undefined ) return undefined;
                
                return constT.pairOf( fstConstT, sndConstT );
            }
            if( Buffer.isBuffer( jsValue ) || ByteString.isStrictInstance( jsValue )  ) return constT.byteStr;
            if( CborString.isStrictInstance( jsValue ) ) return constT.data;
            if( Array.isArray( jsValue ) )
            {
                if( jsValue.length <= 0 ) return undefined; 
                
                const elemT = getReprConstType( jsValue[0] );
                if( elemT === undefined ) return undefined;

                return constT.listOf( elemT );
            }
            return constT.data;
        case "bigint":
        case "number":
            return constT.int;
        case "boolean":
            return constT.bool;
        case "string":
            return constT.str;

        case "symbol":
        case "function":
        case "undefined":
        default:
            return undefined;
    }
}

/**
 * **EXPERIMENTAL**
 */
type InputToPTerm< Input extends any > =
    Input extends boolean ? Term<PBool> :
    Input extends Integer | bigint | number ? Term<PInt> :
    Input extends undefined ? Term<PUnit> :
    Input extends string ? Term<PString> :
    Input extends Buffer | ByteString ? Term<PByteString> :
    Input extends Data ? Term<PData> :
    Input extends (infer T)[] ?
        T extends never ? undefined :
        T extends (infer PA extends PType) | (infer PB extends PType) ? undefined : 
        Term<PList<
            DefaultNever< 
                UnTerm<
                    DefaultUndefined<
                        InputToPTerm< T >,
                        Term<PUnit> 
                    >
                >,
                PUnit
            >
        >> :
    Input extends Pair<infer PA, infer PB> ?
        Term<
            PPair< 
                UnTerm< 
                    DefaultUndefined< InputToPTerm< PA >, Term<PUnit> >
                >, 
                UnTerm< 
                    DefaultUndefined< InputToPTerm< PB >, Term<PUnit> >
                > 
            >
        > :
    Input extends Term<infer PT extends PType> ? Term<PT> :
    undefined

/**
 * **EXPERIMENTAL**
 // * /
export function pconst<InputT extends any>(
    jsValue: InputT | InputToPTerm<InputT> ,
    disambiguateTypeArg?:
        ConstType |
        [ ConstType ] | 
        [ ConstType, ConstType ]
): InputToPTerm<InputT>
{
    if( jsValue instanceof Term ) return jsValue as any;

    const defaultDisambiguate: [ ConstType, ConstType ] = [ constT.unit , constT.unit ]
    let tyArgs: [ ConstType, ConstType ];

    if( disambiguateTypeArg === undefined )
    {
        tyArgs = defaultDisambiguate;
    }
    else if( !Array.isArray( disambiguateTypeArg )  )
    {
        tyArgs = defaultDisambiguate
    }
    else if( isWellFormedConstType( disambiguateTypeArg ) )
    {
        tyArgs = [ disambiguateTypeArg, defaultDisambiguate[1] ];
    }
    else if( disambiguateTypeArg.length === 1 )
    {
        tyArgs = [ disambiguateTypeArg[0], defaultDisambiguate[1] ];
    }
    else
    {
        tyArgs = disambiguateTypeArg
    }

    switch( typeof jsValue )
    {
        case "boolean":
            return new Term<PBool>(
                Type.Bool,
                _dbn => UPLCConst.bool( jsValue )
            ) as any;
        case "bigint":
        case "number":
            return new Term<PInt>(
                Type.Int,
                _dbn => UPLCConst.int( jsValue )
            ) as any;
        case "undefined":
            return new Term<PUnit>(
                Type.Unit,
                _dbn => UPLCConst.unit
            ) as any;
        case "string":
            return new Term<PString>(
                Type.Str,
                _dbn => UPLCConst.str( jsValue )
            ) as any;
        case "object":

            if( jsValue === null ) return undefined as any;
            
            if( isData( jsValue ) )
                return new Term<PData>(
                    _dbn => UPLCConst.data( jsValue ),
                    new PData
                ) as any;

            if( (jsValue as any) instanceof Integer )
                return new Term<PInt>(
                    _dbn => UPLCConst.int( jsValue as Integer ),
                    new PInt
                ) as any;
            
            if( Buffer.isBuffer(jsValue as any) || ByteString.isStrictInstance( jsValue ) )
            {
                return new Term<PByteString>(
                    _dbn => UPLCConst.byteString( jsValue instanceof ByteString ? jsValue : new ByteString( jsValue as Buffer ) ),
                    new PByteString
                ) as any;
            }

            if( (jsValue as any) instanceof Pair )
            {
                const jsValuePair: Pair<any, any> = jsValue as Pair<any,any>;

                let fstConstT = getReprConstType( jsValuePair.fst );
                if( fstConstT === undefined ) fstConstT = tyArgs[0]; 
                
                let sndConstT = getReprConstType( jsValuePair.snd );
                if( sndConstT === undefined ) sndConstT = tyArgs[1];
                
                return new Term(
                    _dbn => UPLCConst.pairOf( fstConstT as ConstType, sndConstT as ConstType )
                        ( jsValuePair.fst, jsValuePair.snd ),
                    new PPair
                ) as any;
            }

            if( Array.isArray( jsValue ) && isConstValue( jsValue as any ) )
            {
                let listTyArg: ConstType | undefined = undefined;

                if( jsValue.length === 0 )
                    listTyArg = tyArgs[0];
                else
                    listTyArg = getReprConstType( jsValue[ 0 ] );

                if( listTyArg === undefined ) listTyArg = tyArgs[0];

                return new Term(
                    _dbn => UPLCConst.listOf( listTyArg as ConstType )( jsValue ),
                    new PList
                ) as any;
            }
        default:
            return undefined as any;
    }
}
// */