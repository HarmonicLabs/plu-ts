import { PType } from "../../PType";
import { Term } from "../../Term";
import { LitteralPurpose, isLitteralPurpose } from "../LitteralPurpose";
import { PrimType, TermType, data, fn, isTaggedAsAlias, termTypeFromJson, termTypeToJson, termTypeToString, typeExtends, unwrapAlias } from "../../../type_system";
import { getFnTypes } from "./getFnTypes";
import { Application, Builtin, Delay, ErrorUPLC, Force, Lambda, UPLCConst, UPLCDecoder, UPLCEncoder, UPLCProgram, UPLCTerm, UPLCVar, constTypeEq } from "@harmoniclabs/uplc";
import { CEKConst, Machine } from "@harmoniclabs/plutus-machine";
import { ptoData } from "../../lib/std/data/conversion";
import { cloneTermType } from "../../../type_system/cloneTermType";
import { fromHex, toHex } from "@harmoniclabs/uint8array-utils";
import { isObject } from "@harmoniclabs/obj-utils";
import { blake2b_224 } from "@harmoniclabs/crypto";
import { PlutusScriptType } from "../../../utils/PlutusScriptType";
import { Cbor, CborBytes } from "@harmoniclabs/cbor";

export class Precompiled<Purp extends LitteralPurpose = LitteralPurpose>
{
    readonly purpose: Purp

    readonly apply: ( ...args: Term<PType>[] ) => Uint8Array

    readonly params!: TermType[]

    readonly validatorType!: TermType;

    readonly outputType!: TermType;

    readonly precompiled!: Uint8Array;

    readonly hash!: Uint8Array;

    constructor(
        purpose: Purp, 
        fullType: TermType,
        precompiled: Uint8Array,
        pulutsVersion: PlutusScriptType = "PlutusScriptV2"
    )
    {
        if( !isLitteralPurpose( purpose ) )
        throw new Error("invalid purpose passed to Precompiled constructor")

        const tys = getFnTypes( fullType );

        const outT = tys[ tys.length - 1 ][0];

        if(!(
            outT === PrimType.Bool ||
            outT === PrimType.Unit
        )) throw new Error("invalid return type for typed or untyped validator");

        if( (purpose === "spend" && tys.length < 4) || tys.length < 3 ) throw new Error("invalid term to precompile");

        const paramsTys = purpose === "spend" ? tys.slice( 0, tys.length - 4 ) : tys.slice( 0, tys.length - 3 );

        const validatorArgs = purpose === "spend" ? tys.slice( tys.length - 4, tys.length - 1 ) : tys.slice( tys.length - 3, tys.length - 1 );

        const validatorType = fn( validatorArgs as any, [ outT ]);

        let _hash: Uint8Array | undefined = undefined;
        const _getHash = (): Uint8Array => {
            if( !( _hash instanceof Uint8Array ) )
            _hash = new Uint8Array(
                blake2b_224(
                    new Uint8Array([
                        pulutsVersion === "PlutusScriptV2" ? 0x02 : 0x01,
                        ...Cbor.encode(
                            new CborBytes( precompiled )
                        ).toBuffer()
                    ])
                )
            );

            return Uint8Array.prototype.slice.call( _hash );
        };
        Object.defineProperties(
            this, {
                params: {
                    get: () => paramsTys.map( cloneTermType ),
                    set: () => {},
                    enumerable: true,
                    configurable: false
                },
                validatorType: {
                    get: () => cloneTermType( validatorType ),
                    set: () => {},
                    enumerable: true,
                    configurable: false
                },
                outputType: {
                    get: () => [ outT ],
                    set: () => {},
                    enumerable: true,
                    configurable: false
                },
                precompiled: {
                    get: () => precompiled.slice(),
                    set: () => {},
                    enumerable: true,
                    configurable: false
                },
                purpose: {
                    value: purpose,
                    writable: false,
                    enumerable: true,
                    configurable: false
                },
                hash: {
                    get: _getHash,
                    set: () => {},
                    enumerable: true,
                    configurable: false
                }
            }
        );

        Object.defineProperty(
            this, "apply", {
                value: ( ...args: Term<PType>[] ): Uint8Array =>
                {
                    if( paramsTys.length === 0 ) return precompiled;
            
                    if( args.length < paramsTys.length )
                    throw new Error(
                        `required ${paramsTys.length} arguments in order to instantiate a precompiled script, but only ${args.length} where passed`
                    );
            
                    const wrongTypeIdx = paramsTys.findIndex(( t, i ) => !typeExtends( args[i].type, t ) );
            
                    if( wrongTypeIdx >= 0 )
                    throw new Error(
                        `parameter at position ${wrongTypeIdx} was expected to be of type: "${
                            termTypeToString( paramsTys[ wrongTypeIdx ] )
                        }" but was instead of type "${
                            termTypeToString( args[ wrongTypeIdx ].type )
                        }"`
                    );
            
                    let { version, body } = UPLCDecoder.parse( precompiled );
            
                    for( let i = paramsTys.length - 1; i >= 0; i-- )
                    {
                        const theArg = args[ i ];
                        let theParamT = paramsTys[ i ];
                        while( isTaggedAsAlias( theParamT ) ) theParamT = unwrapAlias( theParamT );
            
                        let uplcArg: UPLCTerm;
                        
                        if(
                            theParamT[0] === PrimType.Lambda  ||
                            theParamT[0] === PrimType.Delayed
                        )
                        {
                            uplcArg = theArg.toUPLC();
                        }
                        else
                        {
                            uplcArg = Machine.evalSimple( theArg );
            
                            if( !( uplcArg instanceof CEKConst ) )
                            throw new Error("applied parameter did not evaluate to a constant");

                            uplcArg = new UPLCConst( uplcArg.type, uplcArg.value as any );
                        }
            
                        body = new Application(
                            body,
                            uplcArg
                        );
                    }
            
                    if( outT === PrimType.Unit ) // already untyped
                    {
                        return UPLCEncoder.compile(
                            new UPLCProgram(
                                version,
                                body
                            )
                        ).toBuffer().buffer;
                    }
                    // else typed validator
            
                    if( purpose === "spend" )
                    {
                        const [ datumType, redeemerType, ctxType ] = tys.slice( tys.length - 4, tys.length - 1 );
            
                        const datumUplc = typeExtends( datumType, data ) ?
                        new UPLCVar( 2 ) :
                        new Application(
                            ptoData( datumType ).toUPLC(),
                            new UPLCVar( 2 )
                        );
            
                        const redeemerUplc = typeExtends( redeemerType, data ) ?
                        new UPLCVar( 1 ) :
                        new Application(
                            ptoData( redeemerType ).toUPLC(),
                            new UPLCVar( 1 )
                        );
            
                        const ctxUplc = typeExtends( ctxType, data ) ?
                        new UPLCVar( 0 ) :
                        new Application(
                            ptoData( ctxType ).toUPLC(),
                            new UPLCVar( 0 )
                        );
            
                        body = 
                        new Lambda( // datum
                            new Lambda( //redeemer
                                new Lambda( // ctx
                                    new Force(
                                        new Application(
                                            new Application(
                                                new Application(
                                                    Builtin.ifThenElse,
                                                    new Application(
                                                        new Application(
                                                            new Application(
                                                                body,
                                                                datumUplc
                                                            ),
                                                            redeemerUplc
                                                        ),
                                                        ctxUplc
                                                    )
                                                ),
                                                new Delay( UPLCConst.unit )
                                            ),
                                            new Delay( new ErrorUPLC )
                                        )
                                    )
                                )
                            )
                        )
            
                        return UPLCEncoder.compile(
                            new UPLCProgram(
                                version,
                                body
                            )
                        ).toBuffer().buffer;
                    }
                    // else redeemer validator
            
                    const [ redeemerType, ctxType ] = tys.slice( tys.length - 3, tys.length - 1 );
            
                    const redeemerUplc = typeExtends( redeemerType, data ) ?
                    new UPLCVar( 1 ) :
                    new Application(
                        ptoData( redeemerType ).toUPLC(),
                        new UPLCVar( 1 )
                    );
            
                    const ctxUplc = typeExtends( ctxType, data ) ?
                    new UPLCVar( 0 ) :
                    new Application(
                        ptoData( ctxType ).toUPLC(),
                        new UPLCVar( 0 )
                    );
            
                    body = 
                    new Lambda( //redeemer
                        new Lambda( // ctx
                            new Force(
                                new Application(
                                    new Application(
                                        new Application(
                                            Builtin.ifThenElse,
                                            new Application(
                                                new Application(
                                                    body,
                                                    redeemerUplc
                                                ),
                                                ctxUplc
                                            )
                                        ),
                                        new Delay( UPLCConst.unit )
                                    ),
                                    new Delay( new ErrorUPLC )
                                )
                            )
                        )
                    )
            
                    return UPLCEncoder.compile(
                        new UPLCProgram(
                            version,
                            body
                        )
                    ).toBuffer().buffer;
                },
                writable: false,
                enumerable: true,
                configurable: false
            }
        )
    }
    toJSON() { return this.toJson(); }
    toJson()
    {
        return {
            purpose: this.purpose,
            params: this.params.map( termTypeToJson ),
            validatorType: termTypeToJson( this.validatorType ),
            precompiledHex: toHex( this.precompiled )
        }
    }

    static fromJson( json: any ): Precompiled
    {
        if( !isObject( json ) ) throw new Error("'Precompiled.formJson' espects an object as argument");
        
        const params = json["params"].map( termTypeFromJson );
        const validatroType = termTypeFromJson( json["validatorType"] );
        
        const validatorTypes = getFnTypes( validatroType );
        const outT = validatorTypes[ validatorTypes.length - 1 ];
        const validatorArgs = validatorTypes.slice( 0, validatorTypes.length - 1 );
        const fullType = fn([
            ...params,
            ...validatorArgs
        ] as any, outT) as TermType;

        return new Precompiled(
            json["purpose"] as LitteralPurpose,
            fullType,
            fromHex( json["precompiledHex"] )
        );
    }

}