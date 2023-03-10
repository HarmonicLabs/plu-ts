import JsRuntime from "../../utils/JsRuntime";
import ObjectUtils from "../../utils/ObjectUtils";

import { CborObj } from "../../cbor/CborObj";
import { CborArray } from "../../cbor/CborObj/CborArray";
import { CborBytes } from "../../cbor/CborObj/CborBytes";
import { CborSimple } from "../../cbor/CborObj/CborSimple";
import { CborText } from "../../cbor/CborObj/CborText";
import { CborUInt } from "../../cbor/CborObj/CborUInt";
import { BasePlutsError } from "../../errors/BasePlutsError";
import { InvalidCborFormatError } from "../../errors/InvalidCborFormatError";
import { canBeUInteger, CanBeUInteger, forceBigUInt, forceUInteger } from "../../types/ints/Integer";
import { isUint8Array, readUInt16BE, readUInt8 } from "@harmoniclabs/uint8array-utils";

export type IpPoolRelay = ({
    ipv4: Uint8Array
} | {
    ipv6: Uint8Array
} | {
    ipv4: Uint8Array
    ipv6: Uint8Array
}) & {
    type: "ip",
    port?: CanBeUInteger
}

export interface DnsPoolRelay {
    type: "dns",
    port?: CanBeUInteger,
    dnsName: string
}

export interface MultiHostPoolRelay {
    type: "multi-host"
    dnsName: string
}

export type PoolRelay = IpPoolRelay | DnsPoolRelay | MultiHostPoolRelay;

export function poolRelayToJson( relay: PoolRelay )
{
    const type = relay.type;

    switch( type )
    {
        case "ip":
            const ipv4: Uint8Array | undefined = (relay as any).ipv4 === undefined ? undefined : (relay as any).ipv4;
            const ipv6: Uint8Array | undefined = (relay as any).ipv6 === undefined ? undefined : (relay as any).ipv6;
            return {
                type: "ip",
                port: relay.port === undefined ? undefined : Number( forceBigUInt( relay.port ) ),
                ipv4: ipv4 === undefined ? undefined : `${readUInt8( ipv4, 0 )}.${readUInt8( ipv4, 1 )}.${readUInt8( ipv4, 2 )}.${readUInt8( ipv4, 3 )}`,
                ipv6: ipv6 === undefined ? undefined :
                    [
                        readUInt16BE( ipv6, 0   ).toString(16),
                        readUInt16BE( ipv6, 2   ).toString(16),
                        readUInt16BE( ipv6, 4   ).toString(16),
                        readUInt16BE( ipv6, 6   ).toString(16),
                        readUInt16BE( ipv6, 8   ).toString(16),
                        readUInt16BE( ipv6, 10  ).toString(16)
                    ].join(':')
            }
        case "dns":
            return {
                type: "dns",
                port: relay.port === undefined ? undefined : Number( forceBigUInt( relay.port ) ),
                dnsName: relay.dnsName
            }
        case "multi-host":
            return {
                type: "multi-host",
                dnsName: relay.dnsName
            }
        default: 
            throw new BasePlutsError("unknown pool realy type")    
    }
}

function minimumPoolRelayCheck( something: any ): boolean
{
    return (
        ObjectUtils.isObject( something ) &&
        ObjectUtils.hasOwn( something, "type" )
    );
}

function portCheck( something: any ): boolean
{
    return (
        something.port === undefined ||
        canBeUInteger( something.port )
    );
}

export function isIpPoolRelay<T extends object>( something: T ): something is (T & IpPoolRelay)
{
    const {
        ipv4,
        ipv6
    } = something as any;

    return (
        minimumPoolRelayCheck( something ) &&
        (something as any).type === "ip" &&
        (
            (ObjectUtils.hasOwn( something, "ipv4" ) && isUint8Array( ipv4 )) || 
            (ObjectUtils.hasOwn( something, "ipv6" ) && isUint8Array( ipv6 )) 
        ) &&
        ( ipv4 === undefined || ipv4.length === 4 ) &&
        ( ipv6 === undefined || ipv6.length === 16 ) &&
        portCheck( something )
    );
}

export function isDnsPoolRelay<T extends object>( something: T ): something is (T & DnsPoolRelay)
{
    return (
        minimumPoolRelayCheck( something ) &&
        (something as any).type === "dns" &&
        ObjectUtils.hasOwn( something, "dnsName" ) &&
        typeof something.dnsName === "string" && something.dnsName.length <= 64 &&
        portCheck( something ) 
    );
}

export function isMultiHostPoolRelay<T extends object>( something: T ): something is (T & MultiHostPoolRelay)
{
    return (
        minimumPoolRelayCheck( something ) &&
        (something as any).type === "multi-host" &&
        ObjectUtils.hasOwn( something, "dnsName" ) &&
        typeof something.dnsName === "string" && something.dnsName.length <= 64
    );
}

export function isPoolRelay<T extends object>( something: T ): something is (T & PoolRelay)
{
    return (
        isIpPoolRelay( something )        ||
        isDnsPoolRelay( something )       ||
        isMultiHostPoolRelay( something )
    );
}

export function poolRelayToCborObj( poolRelay: PoolRelay ): CborObj
{
    JsRuntime.assert(
        isPoolRelay( poolRelay ),
        "can't convert ot CborObj using 'poolRelayToCborObj' if the input is not a 'PoolRelay'"
    );

    const type = poolRelay.type;

    if( type === "ip" )
    {
        const {
            ipv4,
            ipv6
        } = poolRelay as any;

        return new CborArray([
            new CborUInt(0),
            poolRelay.port === undefined ?
                new CborSimple( null ) :
                new CborUInt( forceUInteger( poolRelay.port ).asBigInt ),
            ipv4 === undefined ?
                new CborSimple( null ) :
                new CborBytes( ipv4 ),
            ipv6 === undefined ?
                new CborSimple( null ) :
                new CborBytes( ipv6 ),
        ]);
    }

    if( type === "dns" )
    {
        return new CborArray([
            new CborUInt(1),
            poolRelay.port === undefined ?
                new CborSimple( null ) :
                new CborUInt( forceUInteger( poolRelay.port ).asBigInt ),
            new CborText( poolRelay.dnsName )
        ]);
    }

    if( type === "multi-host" )
    {
        return new CborArray([
            new CborUInt(2),
            new CborText( poolRelay.dnsName )
        ]);
    }

    throw JsRuntime.makeNotSupposedToHappenError(
        "can't match 'PoolRelay' type"
    )
}


export function poolRelayFromCborObj( cObj: CborObj ): PoolRelay
{
    if(!( cObj instanceof CborArray ))
    throw new InvalidCborFormatError("PoolRelay");

    const [
        _type,
        _1,
        _2,
        _3
    ] = cObj.array;

    if(!( _type instanceof CborUInt ))
    throw new InvalidCborFormatError("PoolRelay");

    const n = Number( _type.num );

    if( n === 0 )
    {
        return {
            type: "ip",
            port: _1 instanceof CborUInt ? _1.num : undefined,
            ipv4: _2 instanceof CborBytes ? _2.buffer : undefined as any,
            ipv6: _3 instanceof CborBytes ? _3.buffer : undefined as any,
        }
    }
    if( n === 1 )
    {
        return {
            type: "dns",
            port: _1 instanceof CborUInt ? _1.num : undefined,
            dnsName: _2 instanceof CborText ? _2.text : undefined as any,
        }
    }
    if( n === 2 )
    {
        if(!( _1 instanceof CborText ))
        throw new InvalidCborFormatError("PoolRelay");

        return {
            type: "multi-host",
            dnsName: _1.text,
        }
    }
    
    throw JsRuntime.makeNotSupposedToHappenError(
        "can't match 'PoolRelay' type"
    )
}