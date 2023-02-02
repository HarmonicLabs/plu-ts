import Cbor from "../../cbor/Cbor";
import CborObj from "../../cbor/CborObj";
import CborArray from "../../cbor/CborObj/CborArray";
import CborBytes from "../../cbor/CborObj/CborBytes";
import CborUInt from "../../cbor/CborObj/CborUInt";
import CborString, { CanBeCborString, forceCborString } from "../../cbor/CborString";
import { ToCbor } from "../../cbor/interfaces/CBORSerializable";
import BasePlutsError from "../../errors/BasePlutsError";
import InvalidCborFormatError from "../../errors/InvalidCborFormatError";
import Data from "../../types/Data";
import DataConstr from "../../types/Data/DataConstr";
import DataI from "../../types/Data/DataI";
import { ToData } from "../../types/Data/toData/interface";
import Cloneable from "../../types/interfaces/Cloneable";
import { CanBeUInteger, canBeUInteger, forceBigUInt } from "../../types/ints/Integer";
import JsRuntime from "../../utils/JsRuntime";
import ObjectUtils from "../../utils/ObjectUtils";
import ToJson from "../../utils/ts/ToJson";
import Hash28 from "../hashes/Hash28/Hash28";
import PaymentCredentials from "./PaymentCredentials";

export class StakeKeyHash extends Hash28 {}

export class StakeValidatorHash extends Hash28 {}

export type StakeCredentialsType = "stakeKey" | "script" | "pointer" ;

export type StakeHash<T extends StakeCredentialsType> =
    T extends "stakeKey" ? StakeKeyHash :
    T extends "script" ? StakeValidatorHash :
    T extends "pointer" ? [ CanBeUInteger, CanBeUInteger, CanBeUInteger ] :
    never;

export default class StakeCredentials<T extends StakeCredentialsType = StakeCredentialsType>
    implements ToCbor, ToData, Cloneable<StakeCredentials<T>>, ToJson
{
    readonly type!: T;
    readonly hash!: StakeHash<T>

    constructor( type: T, hash: StakeHash<T> )
    {
        JsRuntime.assert(
            hash instanceof Hash28,
            "can't construct 'StakeCredentials'; hash must be instance of an 'Hash28'"
        );
        JsRuntime.assert(
            type === "stakeKey" || type ==="script" || type === "pointer",
            "can't construct 'PaymentCredentials'; specified type is nor 'addres' nor 'script'"
        );

        ObjectUtils.defineReadOnlyProperty( this, "type", type );

        if( type === "pointer" )
        {
            if(!(
                Array.isArray( hash ) &&
                hash.length === 3 &&
                hash.every( canBeUInteger )
            ))
            throw new BasePlutsError(
                "invalid argument for stake credentials of type " + type
            );

            ObjectUtils.defineReadOnlyProperty(
                this,
                "hash",
                hash.map( forceBigUInt )
            );
        }
        else
        {
            if( !( hash instanceof Hash28 ) )
            throw new BasePlutsError(
                "invalid argument for stake credentials of type " + type
            );

            ObjectUtils.defineReadOnlyProperty(
                this,
                "hash",
                type === "stakeKey" ? 
                    ( hash instanceof StakeKeyHash ? hash : new StakeKeyHash( hash.asBytes ) ) :
                    ( hash instanceof StakeValidatorHash ? hash : new StakeValidatorHash( hash.asBytes ) )
            );
        }
    }

    clone(): StakeCredentials<T>
    {
        return new StakeCredentials(
            this.type,
            this.hash
        );
    }

    toData(): DataConstr
    {
        if( this.type === "pointer" )
        {
            return new DataConstr(
                1, // PStakingPtr
                ( this.hash as StakeHash<"pointer"> )
                .map( n => new DataI( forceBigUInt( n ) ) )
            )
        }
        return new DataConstr(
            0, // PStakingHash
            [
                new PaymentCredentials(
                    this.type === "stakeKey" ? "pubKey" : "script",
                    (this.hash as StakeHash<"script" | "stakeKey">)
                ).toData()
            ]
        )
    }

    toCbor(): CborString
    {
        return Cbor.encode( this.toCborObj() );
    }

    toCborObj(): CborObj
    {
        return new CborArray([
            new CborUInt( this.type === "stakeKey" ? 0 : 1 ),
            Array.isArray( this.hash ) ?
                new CborArray(
                    this.hash
                    .map( n => new CborUInt( forceBigUInt( n ) ) )
                ) :
                this.hash.toCborObj()
        ])
    }

    static fromCbor( cObj: CanBeCborString ): StakeCredentials
    {
        return StakeCredentials.fromCborObj( Cbor.parse( forceCborString( cObj ) ) )
    }
    static fromCborObj( cObj: CborObj ): StakeCredentials
    {
        if(!( cObj instanceof CborArray ))
        throw new InvalidCborFormatError("Certificate");

        const [ _type, _creds ] = cObj.array;

        if(!( _type instanceof CborUInt ))
        throw new InvalidCborFormatError("Certificate");

        if(!( _creds instanceof CborArray || _creds instanceof CborBytes ))
        throw new InvalidCborFormatError("Certificate");

        if( _creds instanceof CborArray )
        {
            if(!_creds.array.every( n => n instanceof CborUInt ))
            throw new InvalidCborFormatError("Certificate");

            return new StakeCredentials(
                "pointer",
                _creds.array.map( n => (n as CborUInt).num ) as any
            );
        }

        return new StakeCredentials(
            _type.num === BigInt(0) ? "stakeKey" : "script",
            Hash28.fromCborObj( _creds ) 
        );
    }

    toJson()
    {
        switch( this.type )
        {
            case "script":
                return {
                    type: "script",
                    hash: this.hash.toString()
                }
            case "stakeKey":
                return {
                    type: "stakeKey",
                    hash: this.hash.toString()
                }
            case "pointer":
                return {
                    type: "pointer",
                    pointer: (this.hash as [CanBeUInteger, CanBeUInteger, CanBeUInteger])
                        .map( n => forceBigUInt( n ).toString() )
                }
            default:
                throw new BasePlutsError("unknown stake credentials type")
        }
    }
}