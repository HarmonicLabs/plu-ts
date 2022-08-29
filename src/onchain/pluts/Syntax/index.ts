import CborString from "../../../cbor/CborString";
import BasePlutsError from "../../../errors/BasePlutsError";
import Data, { isData } from "../../../types/Data";
import ByteString from "../../../types/HexString/ByteString";
import Integer from "../../../types/ints/Integer";
import Pair from "../../../types/structs/Pair";
import ObjectUtils from "../../../utils/ObjectUtils";
import { DefaultNever, DefaultUndefined, Head, NonEmptyTail, Tail } from "../../../utils/ts";
import { curryFirst } from "../../../utils/ts/combinators";
import { hasMultipleRefsInTerm } from "../../UPLC/UPLCTerm";
import Application from "../../UPLC/UPLCTerms/Application";
import Delay from "../../UPLC/UPLCTerms/Delay";
import Force from "../../UPLC/UPLCTerms/Force";
import Lambda from "../../UPLC/UPLCTerms/Lambda";
import UPLCConst from "../../UPLC/UPLCTerms/UPLCConst";
import ConstType, { constT, isWellFormedConstType } from "../../UPLC/UPLCTerms/UPLCConst/ConstType";
import ConstValue, { isConstValue } from "../../UPLC/UPLCTerms/UPLCConst/ConstValue";
import UPLCVar from "../../UPLC/UPLCTerms/UPLCVar";
import PType, { ToCtors } from "../PType";
import PBool from "../PTypes/PBool";
import PByteString from "../PTypes/PByteString";
import PData from "../PTypes/PData";
import PDelayed from "../PTypes/PDelayed";
import PLam, { TermFn } from "../PTypes/PFn/PLam";
import PInt from "../PTypes/PInt";
import PList from "../PTypes/PList";
import PPair from "../PTypes/PPair";
import PString from "../PTypes/PString";
import PUnit from "../PTypes/PUnit";
import Term, { UnTerm } from "../Term";


export function papp<Input extends PType, Output extends PType >( outCtor: new () => Output )
{
    return ( a: Term<PLam<Input,Output>>, b: Term<Input> ): Term<Output> =>
    {
        return new Term( dbn => {
                return new Application(
                    a.toUPLC( dbn ),
                    b.toUPLC( dbn )
                )
            },
            new outCtor
        );
    }
}

export function plam<A extends PType, B extends PType >( inCtor: new () => A, outCtor: new () => B )
    : ( termFunc : ( input: Term<A> ) => Term<B> ) => TermFn<[A], B>
{
    return ( termFunc: ( input: Term<A> ) => Term<B> ): TermFn<[A],B> =>
    {
        const lambdaTerm  = new Term<PLam<A,B>>( dbn => {
                const thisLambdaPtr = dbn + BigInt( 1 );
                const boundVar = new Term<A>( dbnAccessLevel => new UPLCVar( dbnAccessLevel - thisLambdaPtr ), new inCtor );
                
                // here the debruijn level is incremented
                return new Lambda( termFunc( boundVar ).toUPLC( thisLambdaPtr ) );
            },
            new PLam( new inCtor, new outCtor )
        );
    
        // allows ```lambdaTerm.$( input )``` syntax
        // rather than ```papp( outCtor )( lambdaTerm, input )```
        // preserving Term Type
        return ObjectUtils.defineReadOnlyProperty(
            lambdaTerm,
            "$",
            ( input: Term<A> ) => papp( outCtor )( lambdaTerm, input )
        );
    }   
}

type MapTermOver< PTypes extends PType[] > =
    PTypes extends [] ? []:
    PTypes extends [ infer PInstance extends PType ] ? [ Term< PInstance > ] : 
    PTypes extends [ infer PInstance extends PType , ...infer PInstances extends PType[] ] ? 
        [ Term< PInstance > , ...MapTermOver< PInstances  > ] :
    never;

type Test0 = MapTermOver<[]>
type Test1 = MapTermOver<[ PType ]>
type Test2 = MapTermOver<[ PType, PType ]>
type Test3 = MapTermOver<[ PType, PType, PType ]>

/**
 * @fixme "ts-ignore"
*/
export function pfn< Inputs extends [ PType, ...PType[] ], Output extends PType > ( ...ctors: [ ...ToCtors<Inputs>, new () => Output ] )
{
    return ( termFunc: ( fstInput: Term< Head< Inputs > >, ...ins: MapTermOver< Tail< Inputs > > ) => Term< Output > )
        : TermFn< Inputs, Output > =>
    {
        if( termFunc.length === 0 ) throw new BasePlutsError( "unsupported '(void) => any' type at Pluts level" );
        if( termFunc.length === 1 ) return plam( ctors[0], ctors[1] )( termFunc as any ) as any;

        /*
        Type 'Term<PLam<Head<Inputs>, Output>> & { $: (input: Term<Head<Inputs>>) => Term<Output>; }'
        is not assignable to type 'TermFn<Inputs, Output>'
        
        where TermFn< Inputs, Output > translates to
            Term<PLam<Head<Inptus>, PFn< Tail<Inputs>, Output > > >
            & { $: ( input: Term< Head<Inptus> > ) => TermFn< Tail<Inputs>, Output > }
        */
        // the issue here is in the fact that Typescript
        // doesn't recognizes 'Output' to be 'PFn< Tail<Inputs>, Output >' 
        //@ts-ignore
        return plam( ctors[0] , PLam )(
            //@ts-ignore
            ( input: Term< Head< Inputs > > ) =>
                //@ts-ignore
                pfn( ...ctors.slice(1) )( 
                    curryFirst(
                        /*
                        Argument of type '(fstInput: Term<Head<Inputs>>, ...ins: MapTermOver<Tail<Inputs>>) => Term<Output>'
                        is not assignable to parameter of type '(arg1: any, ...args: any[]) => Term<Output>'.
                            Types of parameters 'ins' and 'args' are incompatible.
                                Type 'any[]' is not assignable to type 'MapTermOver<Tail<Inputs>>'

                        basically typescript desn't recognizes 'MapTermOver<Tail<Inputs>>' to be an array of types (which is)
                        */
                        //@ts-ignore
                        termFunc
                    )( input )
                ) 
        );
    }
}
    

export function pdelay<PInstance extends PType>( ctor: new () => PInstance ): (toDelay: Term<PInstance>) => Term<PDelayed<PInstance>>
{
    return ( toDelay: Term<PInstance> ): Term<PDelayed<PInstance>> =>
    {
        return new Term((dbn) => {
                return new Delay(
                    toDelay.toUPLC( dbn )
                );
            },
            new PDelayed( new ctor() )
        )
    }
}
    

export function pforce<PInstance extends PType>( ctor: new () => PInstance ) 
{
    return ( toForce: Term<PDelayed<PInstance>> ): Term<PInstance> =>
    {
        return new Term( (dbn) => {
    
            const toForceUPLC = toForce.toUPLC( dbn );
    
            // if directly applying to Delay UPLC just remove the delay
            //
            // (force (delay (con int 11))) === (con int 11)
            if( toForceUPLC instanceof Delay )
            {
                return toForceUPLC.delayedTerm;
            }
    
            // any other case that evaluates to Delay
            return new Force(
                toForceUPLC
            );
        },
        new ctor
        )
    }
}

export function plet<PVar extends PType, PExprResult extends PType>( varT: new () => PVar, exprResT: new () => PExprResult )
    : ( varValue: Term<PVar> ) => {
        in: ( expr: (value: Term<PVar>) => Term<PExprResult> ) => Term<PExprResult>
    }
{
    return ( varValue: Term<PVar> ) => {
        return {
            in: ( expr: (value: Term<PVar>) => Term<PExprResult> ): Term<PExprResult> => {

                // const multiRefsCase =
                return new Term(
                    dbn => new Application(
                        new Lambda(
                            expr( new Term(
                                dbnExpr => new UPLCVar( dbn - ( dbnExpr + BigInt(1) ) ), // point to the lambda generated here
                                new varT 
                            )).toUPLC( dbn )
                        ),
                        varValue.toUPLC( dbn )
                    ),
                    new exprResT
                );

                /*
                this causes to compile twice the term at compiletime

                one time here when checking
                and the second one at the actual compilation

                @fixme this should be handled at actual compile time with a similar process done for HoistedUPLC

                return hasMultipleRefsInTerm(
                        BigInt( -1 ), // var introduced in the term itself
                        multiRefsCase.toUPLC( 0 )
                    ) ?
                    multiRefsCase :
                    // inline the value in the variable if not referenced more than once
                    new Term(
                        dbn => expr( varValue ).toUPLC( dbn ),
                        new exprResT
                    );
                */
            }
        };
    }
}

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
 */
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
                _dbn => UPLCConst.bool( jsValue ),
                new PBool
            ) as any;
        case "bigint":
        case "number":
            return new Term<PInt>(
                _dbn => UPLCConst.int( jsValue ),
                new PInt
            ) as any;
        case "undefined":
            return new Term<PUnit>(
                _dbn => UPLCConst.unit,
                new PUnit
            ) as any;
        case "string":
            return new Term<PString>(
                _dbn => UPLCConst.str( jsValue ),
                new PString
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