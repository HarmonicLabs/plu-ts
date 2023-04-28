import { fromAscii, toHex, uint8ArrayEq } from "@harmoniclabs/uint8array-utils";
import JsRuntime from "../../../utils/JsRuntime";
import ObjectUtils from "../../../utils/ObjectUtils";

import { Hash28 } from "../../hashes/Hash28/Hash28";
import { CanBeUInteger, canBeUInteger } from "../../../types/ints/Integer";

export type IValue = (IValuePolicyEntry | IValueAdaEntry)[]

export type IValueAsset = {
    name: Uint8Array,
    quantity: CanBeUInteger
}

export type IValueAssetBI = {
    name: Uint8Array,
    quantity: bigint
}

export type IValueAssets = IValueAsset[];

export type IValuePolicyEntry = {
    policy: Hash28,
    assets: IValueAssets
};

export type IValueAdaEntry = {
    policy: "",
    assets: [ IValueAsset ]
}

export function cloneIValue( ival: IValue ): IValue
{
    return ival.map( cloneIValueEntry );
}

function policyToString( policy: "" | Hash28 ): string
{
    return policy === "" ? policy : policy.toString();
}

export function IValueToJson( iVal: IValue ): object
{
    const result = {};

    for( const { policy, assets } of iVal )
    {
        const _assets = {};

        for( const { name, quantity } of assets )
        {
            ObjectUtils.defineReadOnlyProperty(
                _assets,
                toHex( name ),
                quantity.toString()
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
    return iValAssets.map(({ name, quantity }) => ({ name: name.slice(), quantity }));
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

function isAdaEntry( entry: any ): entry is IValueAdaEntry
{
    const assets = entry?.assets;
    return (
        ObjectUtils.isObject( entry ) &&
        ObjectUtils.hasOwn( entry, "policy" ) &&
        ObjectUtils.hasOwn( entry, "assets" ) &&
        entry.policy === "" &&
        Array.isArray( assets ) && assets.length === 1 &&
        (({ name, quantity }: IValueAsset) => {

            return (
                name instanceof Uint8Array &&
                name.length === 0 && 
                (
                    typeof quantity === "bigint" ||
                    (
                        typeof quantity === "number" &&
                        quantity === Math.round( quantity )
                    )
                )
            );
        })( assets[0] )
    );
}

function isIValueAsset( entry: any ): entry is IValueAsset
{
    return (
        ObjectUtils.isObject( entry ) &&
        ObjectUtils.hasOwn( entry, "name" ) &&
        entry.name instanceof Uint8Array &&
        entry.name.length <= 32 &&
        ObjectUtils.hasOwn( entry, "quantity" ) &&
        (
            typeof entry.quantity === "bigint" ||
            (
                typeof entry.quantity === "number" &&
                entry.quantity === Math.round( entry.quantity )
            )
        )
    );
}

function isIValueAssets( assets: any ): assets is IValueAssets
{
    return (
        Array.isArray( assets ) &&
        assets.every( isIValueAsset )
    );
}

export function isIValue( entries: any[] ): entries is IValue
{
    if(!Array.isArray( entries )) return false;

    const policies: string[] = [];
    let hasAdaEntry: boolean = false;
    const len = entries.length;

    for( let i = 0; i < len; i++ )
    {
        const entry = entries[i];

        if(!(
            ObjectUtils.isObject( entry ) &&
            ObjectUtils.hasOwn( entry, "policy" ) &&
            ObjectUtils.hasOwn( entry, "assets" )
        )) return false;

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

        const policyAsStr = entry.policy.toString();

        // duplicate entry
        if( policies.includes( policyAsStr ) ) return false;
        
        policies.push( policyAsStr );

        if( !isIValueAssets( entry.assets ) ) return false;
    }

    return true;
}

const empty = new Uint8Array([]);

export function getNameQty( assets: IValueAssets | undefined, searchName: Uint8Array ): CanBeUInteger | undefined
{
    if(!(
        Array.isArray( assets )
    )) return undefined;
    return assets.find( ({ name }) => uint8ArrayEq( name, searchName ) )?.quantity;
}

export function getEmptyNameQty( assets: IValueAssets | undefined ): CanBeUInteger | undefined
{
    return getNameQty( assets, empty );
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
        let aVal: number | bigint | undefined = 0;
        let bVal: number | bigint | undefined = 0;

        if( aAdaAssets !== undefined )
        {
            aVal = getEmptyNameQty( aAdaAssets );

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
            bVal = getEmptyNameQty( bAdaAssets );

            if( bVal === undefined )
            throw JsRuntime.makeNotSupposedToHappenError(
                "ill formed Value passed to addition"
            );
        }

        sum.push({
            policy: "",
            assets: [
                {
                    name: empty.slice(),
                    quantity: BigInt( aVal ) + BigInt( bVal )
                }
            ]
        });
    }

    for( let i = 0; i < short.length; i++ )
    {
        const { policy, assets: sassets } = short[i];

        if( (policy as any) === "" ) continue;

        const policyAsStr = policy.toString();
        
        const { assets: lassets } = long.find( (entry, i) => {
            if( entry.policy.toString() === policyAsStr )
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
    const sum: IValueAssets = [];

    const aKeys = a.map( ({ name }) => name );
    const bKeys = b.map( ({ name }) => name );

    const short = aKeys.length < bKeys.length ? a : b;
    const shortKeys = a === short ? aKeys : bKeys;

    const long = aKeys.length < bKeys.length ? b : a;
    const longKeys = a === long ? aKeys : bKeys;

    const included: Uint8Array[] = [];

    for( let i = 0; i < shortKeys.length; i++ )
    {
        const name = shortKeys[i];

        included.push( name );

        const longKeysIdx = longKeys.findIndex( k => uint8ArrayEq( k, name ) );

        if( longKeysIdx >= 0 )
        {
            sum.push({
                name: name.slice(),
                quantity: addInt(
                    short[i].quantity,
                    long[longKeysIdx].quantity
                )
            });
        }
        else
        {
            sum.push({
                name: name.slice(),
                quantity: BigInt( short[i].quantity )
            });
        }
    }

    for( let i = 0; i < longKeys.length; i++ )
    {
        const name = longKeys[i];
        if( included.some( k => uint8ArrayEq( k, name ) ) ) continue;

        sum.push({
            name: name.slice(),
            quantity: BigInt( long[i].quantity )
        });
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
        let aVal: number | bigint | undefined = 0;
        let bVal: number | bigint | undefined = 0;

        if( aAdaAssets !== undefined )
        {
            aVal = getEmptyNameQty( aAdaAssets );

            if( aVal === undefined )
            throw JsRuntime.makeNotSupposedToHappenError(
                "ill formed Value passed to addition"
            );
        }
        if( bAdaAssets !== undefined )
        {
            bVal = getEmptyNameQty( bAdaAssets );

            if( bVal === undefined )
            throw JsRuntime.makeNotSupposedToHappenError(
                "ill formed Value passed to addition"
            );
        }

        const lovelaces = BigInt(aVal) - BigInt(bVal);
        if( lovelaces !== BigInt(0) )
            result.push({
                policy: "",
                assets: [
                    {
                        name: empty.slice(),
                        quantity: lovelaces
                    }
                ]
            });
    }

    const _a = a as IValuePolicyEntry[];
    const _b = b as IValuePolicyEntry[];

    for( let i = 0; i < _a.length; i++ )
    {
        const { policy, assets: aAssets } = _a[i];

        if( (policy as any) === "" ) continue;

        const policyAsStr = policy.toString();
        
        const { assets: bAssets } = _b.find( (entry, i) => {
            if( entry.policy.toString() === policyAsStr )
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

            if( subtractedAssets.length !== 0 )
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

        const subAssets: IValueAssets = [];

        const { policy, assets } = _b[i];
        
        for(const { name, quantity } of assets)
        {
            subAssets.push({
                name: name.slice(),
                quantity: -BigInt( quantity )
            });
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
    const result: IValueAssets = [];

    const aKeys = a.map( ({ name }) => name );
    const bKeys = b.map( ({ name }) => name );

    const includedBKeys: Uint8Array[] = [];

    for( let i = 0; i < aKeys.length; i++ )
    {
        const name = aKeys[i];

        const bKeysIdx = bKeys.findIndex( k => uint8ArrayEq( k, name ) )

        if( bKeysIdx >= 0 )
        {
            const name = bKeys[ bKeysIdx ];

            includedBKeys.push( name );
            
            const amt = subInt( getNameQty( a, name ) ?? 0, getNameQty( b, name ) ?? 0 );

            if( amt !== BigInt(0) )
            {
                result.push({
                    name: name.slice(),
                    quantity: amt
                });
            }
        }
        else
        {
            const amt = getNameQty( a, name );
            if( amt !== undefined )
            {
                result.push({
                    name: name.slice(),
                    quantity: amt
                });
            }
        }
    }

    for(const bKey of bKeys)
    {
        if( includedBKeys.some( k => uint8ArrayEq( bKey, k ) ) ) continue;
        
        const amt = getNameQty( b, bKey );
        if( amt !== undefined )
        {
            result.push({
                name: bKey.slice(),
                quantity: -BigInt( amt )
            });
        }
    }

    return result;
}