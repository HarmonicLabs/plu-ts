import { CanBeUInteger } from "../../types/ints/Integer";

export interface IpPoolRelay {
    port: CanBeUInteger | null,
    ipv4: Buffer | null,
    ipv6: Buffer | null
}

export interface DnsPoolRelay {
    port: CanBeUInteger | null,
    dnsName: string
}

export interface MultiHostPoolRelay {
    dnsName: string
}

export type PoolRelay = IpPoolRelay | DnsPoolRelay | MultiHostPoolRelay;

export default PoolRelay;