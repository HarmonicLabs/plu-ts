import { fromAscii, toHex } from "../../../uint8Array";
import JsRuntime from "../../../utils/JsRuntime";
import ObjectUtils from "../../../utils/ObjectUtils";

import { Hash28 } from "../../hashes/Hash28/Hash28";

export type IValue = (IValuePolicyEntry | IValueAdaEntry)[]

export type IValueAssets = {
    [assetNameAscii: string]: number | bigint,
}

export type IValuePolicyEntry = {
    policy: Hash28,
    assets: IValueAssets
};

export type IValueAdaEntry = {
    policy: "",
    assets: { "": number | bigint }
}

export function cloneIValue( ival: IValue ): IValue
{
    return ival.map( cloneIValueEntry );
}

function policyToString( policy: "" | Hash28 ): string
{
    return policy === "" ? policy : policy.asString;
}

export function IValueToJson( iVal: IValue ): object
{
    const result = {};

    for( const { policy, assets } of iVal )
    {
        const _assets = {};

        for( const k in assets )
        {
            ObjectUtils.defineReadOnlyProperty(
                _assets,
                toHex( fromAscii( k ) ),
                (assets as any)[k].toString()
            )
        }
        
        ObjectUtils.defineReadOnlyProperty(
            result,
            policyToString( policy ),
            _assets
        );     
    }

    return result;
}

function cloneIValueAssets( iValAssets: IValueAssets ): IValueAssets
{
    const ks = Object.keys( iValAssets );
    const res = {};
    for(let i = 0; i < ks.length; i++)
    {
        const _k = ks[i];
        ObjectUtils.defineNormalProperty(
            res, _k, iValAssets[_k]
        );
    }
    return res;
}

export function cloneIValueEntry<Entry extends (IValueAdaEntry | IValuePolicyEntry)>( { policy, assets }: Entry ): Entry
{
    return {
        policy: policy,
        assets: cloneIValueAssets( assets )
    } as any;
}

/**
 * extended ascii
 */
function isAscii( str: string ): boolean
{
    return (
        typeof str === "string" &&
        //char in range (0b0000_0000, 0b1111_1111)
        /^[\x00-\xFF]*$/.test(str)
    )
}

function isAdaEntry( entry: object ): entry is IValueAdaEntry
{
    const assets = (entry as any).assets;
    return (
        ObjectUtils.isObject( entry ) &&
        ObjectUtils.hasOwn( entry, "policy" ) &&
        ObjectUtils.hasOwn( entry, "assets" ) &&
        entry.policy === "" &&
        ObjectUtils.isObject( assets ) &&
        ObjectUtils.hasOwn( assets, "" ) && Object.keys( assets ).length === 1 &&
        (typeof assets[""] === "number" || typeof assets[""] === "bigint") 
    );
}

function isIValueAssets( assets: object ): assets is IValueAssets
{
    return Object.keys( assets ).every( name => {

        const amt = ((assets as any)[name]);

        return (
            isAscii( name ) &&
            (
                typeof amt === "bigint" || 
                (
                    typeof  amt === "number" &&
                    amt === Math.round( amt )
                )
            )
        );
    })
}

export function isIValue( entries: object[] ): entries is IValue
{
    if(!Array.isArray( entries )) return false;

    const policies: string[] = [];
    let hasAdaEntry: boolean = false;

    for( let i = 0; i < entries.length; i++ )
    {
        const entry = entries[i];

        if(!(
            ObjectUtils.isObject( entry ) &&
            ObjectUtils.hasOwn( entry, "policy" ) &&
            ObjectUtils.hasOwn( entry, "assets" )
        ))
        return false;

        if( entry.policy === "" )
        {
            if( hasAdaEntry )
            {
                // duplicate ada entry
                return false;
            }

            if( !isAdaEntry( entry ) ) return false;

            policies.push("");
            hasAdaEntry = true;
            continue;
        }

        if( !(entry.policy instanceof Hash28) ) return false;

        const policyAsStr = entry.policy.asString;

        // duplicate entry
        if( policies.includes( policyAsStr ) ) return false;
        
        policies.push( policyAsStr );

        if( !isIValueAssets( entry.assets ) ) return false;
    }

    return true;
}


export function addIValues( a: IValue, b: IValue ): IValue
{
    const sum: IValue = [];

    const short = (a.length < b.length ? a : b) as IValuePolicyEntry[];
    const long  = (a.length < b.length ? b : a) as IValuePolicyEntry[];

    const { assets: aAdaAssets } = long.find(  entry => (entry.policy as any) === "" ) ?? {};
    const { assets: bAdaAssets } = short.find( entry => (entry.policy as any) === "" ) ?? {};

    const longIndiciesIncluded: number[] = [];

    if( aAdaAssets !== undefined || bAdaAssets !== undefined )
    {
        let aVal: number | bigint = 0;
        let bVal: number | bigint = 0;

        if( aAdaAssets !== undefined )
        {
            aVal = aAdaAssets[""];

            longIndiciesIncluded.push(
                long.findIndex( entry => (entry.policy as any) === "" )
            );

            if( aVal === undefined )
            throw JsRuntime.makeNotSupposedToHappenError(
                "ill formed Value passed to addition"
            );
        }
        if( bAdaAssets !== undefined )
        {
            bVal = bAdaAssets[""];

            if( bVal === undefined )
            throw JsRuntime.makeNotSupposedToHappenError(
                "ill formed Value passed to addition"
            );
        }

        sum.push({
            policy: "",
            assets: { "": BigInt(aVal) + BigInt(bVal) }
        });
    }

    for( let i = 0; i < short.length; i++ )
    {
        const { policy, assets: sassets } = short[i];

        if( (policy as any) === "" ) continue;

        const policyAsStr = policy.asString;
        
        const { assets: lassets } = long.find( (entry, i) => {
            if( entry.policy.asString === policyAsStr )
            {
                longIndiciesIncluded.push( i );
                return true;
            }
            return false;
        }) ?? {};

        sum.push({
            policy,
            assets: lassets === undefined ? sassets : addIValueAssets(
                sassets,
                lassets
            )
        });
    }

    for( let i = 0; i < long.length; i++ )
    {
        if( longIndiciesIncluded.includes( i ) ) continue;

        const toAdd = long[i];
        if( (toAdd.policy as any) !== "" )
            sum.push( toAdd );
    }

    return sum;
}

function addInt( a: number | bigint, b: number | bigint ): bigint
{
    return BigInt( a ) + BigInt( b );
}

function addIValueAssets( a: IValueAssets, b: IValueAssets ): IValueAssets
{
    const sum: IValueAssets = {};

    const aKeys = Object.keys( a );
    const bKeys = Object.keys( b );

    const short = aKeys.length < bKeys.length ? a : b;
    const shortKeys = a === short ? aKeys : bKeys;

    const long = aKeys.length < bKeys.length ? b : a;
    const longKeys = a === long ? aKeys : bKeys;

    const included: string[] = [];

    for( let i = 0; i < shortKeys.length; i++ )
    {
        const name = shortKeys[i];

        included.push( name );

        if( longKeys.includes( name ) )
        {
            ObjectUtils.defineReadOnlyProperty(
                sum, name, addInt( short[name], long[name] )
            );
        }
        else
        {
            ObjectUtils.defineReadOnlyProperty(
                sum, name, short[name]
            );
        }
    }

    for( let i = 0; i < longKeys.length; i++ )
    {
        const name = longKeys[i];
        if( included.includes( name ) ) continue;

        ObjectUtils.defineReadOnlyProperty(
            sum, name, long[name]
        );
    }

    return sum;
}

export function subIValues( a: IValue, b: IValue ): IValue
{
    const result: IValue = [];

    const bIndiciesIncluded: number[] = [];

    const { assets: aAdaAssets } = a.find( entry => (entry.policy as any) === "" ) ?? {};
    const { assets: bAdaAssets } = b.find( (entry, i) => {
        if( (entry.policy as any) === "" )
        {
            bIndiciesIncluded.push( i )
            return true
        }
        return false;
    }) ?? {};

    if( aAdaAssets !== undefined || bAdaAssets !== undefined )
    {
        let aVal: number | bigint = 0;
        let bVal: number | bigint = 0;

        if( aAdaAssets !== undefined )
        {
            aVal = aAdaAssets[""];

            if( aVal === undefined )
            throw JsRuntime.makeNotSupposedToHappenError(
                "ill formed Value passed to addition"
            );
        }
        if( bAdaAssets !== undefined )
        {
            bVal = bAdaAssets[""];

            if( bVal === undefined )
            throw JsRuntime.makeNotSupposedToHappenError(
                "ill formed Value passed to addition"
            );
        }

        const lovelaces = BigInt(aVal) - BigInt(bVal);
        if( lovelaces !== BigInt(0) )
            result.push({
                policy: "",
                assets: { "": lovelaces }
            });
    }

    const _a = a as IValuePolicyEntry[];
    const _b = b as IValuePolicyEntry[];

    for( let i = 0; i < _a.length; i++ )
    {
        const { policy, assets: aAssets } = _a[i];

        if( (policy as any) === "" ) continue;

        const policyAsStr = policy.asString;
        
        const { assets: bAssets } = _b.find( (entry, i) => {
            if( entry.policy.asString === policyAsStr )
            {
                bIndiciesIncluded.push( i );
                return true;
            }
            return false;
        }) ?? {};

        if( bAssets !== undefined )
        {
            const subtractedAssets = subIValueAssets(
                aAssets,
                bAssets
            );

            if( Object.keys( subtractedAssets ).length !== 0 )
            {
                result.push({
                    policy,
                    assets: subtractedAssets
                });
            }
        }
        else
        {
            result.push({
                policy,
                assets: aAssets
            });
        }
    }

    for( let i = 0; i < _b.length; i++ )
    {
        if( bIndiciesIncluded.includes( i ) ) continue;

        const subAssets = {};
        const { policy, assets } = _b[i];
        for(const assetName in assets)
        {
            ObjectUtils.defineNonDeletableNormalProperty(
                subAssets, assetName, -assets[assetName]
            );
        }
        result.push({
            policy: policy.clone(),
            assets: subAssets
        });
    }

    return result;
}

function subInt( a: number | bigint, b: number | bigint ): bigint
{
    return BigInt( a ) - BigInt( b );
}

function subIValueAssets( a: IValueAssets, b: IValueAssets ): IValueAssets
{
    const result: IValueAssets = {};

    const aKeys = Object.keys( a );
    const bKeys = Object.keys( b );

    const includedBKeys: string [] = [];

    for( let i = 0; i < aKeys.length; i++ )
    {
        const name = aKeys[i];

        if( bKeys.includes( name ) )
        {
            includedBKeys.push( name );
            const amt = subInt( a[name], b[name] );

            if( amt !== BigInt(0) )
            {
                ObjectUtils.defineReadOnlyProperty(
                    result, name, amt
                );
            }
        }
        else
        {
            ObjectUtils.defineReadOnlyProperty(
                result, name, a[name]
            );
        }
    }

    for(const bKey of bKeys)
    {
        if( includedBKeys.includes(bKey) ) continue;
        
        ObjectUtils.defineNonDeletableNormalProperty(
            result, bKey, -b[bKey]
        );
    }

    return result;
}