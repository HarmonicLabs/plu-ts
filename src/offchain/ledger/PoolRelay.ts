import Cbor from "../../cbor/Cbor";
import CborObj from "../../cbor/CborObj";
import CborArray from "../../cbor/CborObj/CborArray";
import CborBytes from "../../cbor/CborObj/CborBytes";
import CborSimple from "../../cbor/CborObj/CborSimple";
import CborText from "../../cbor/CborObj/CborText";
import CborUInt from "../../cbor/CborObj/CborUInt";
import { canBeUInteger, CanBeUInteger, forceUInteger } from "../../types/ints/Integer";
import JsRuntime from "../../utils/JsRuntime";
import ObjectUtils from "../../utils/ObjectUtils";

export type IpPoolRelay = ({
    ipv4: Buffer
} | {
    ipv6: Buffer
} | {
    ipv4: Buffer
    ipv6: Buffer
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

export default PoolRelay;

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
            (ObjectUtils.hasOwn( something, "ipv4" ) && Buffer.isBuffer( ipv4 )) || 
            (ObjectUtils.hasOwn( something, "ipv6" ) && Buffer.isBuffer( ipv6 )) 
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