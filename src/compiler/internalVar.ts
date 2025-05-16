import { isObject } from "@harmoniclabs/obj-utils";
import { toHex, toBase64 } from "@harmoniclabs/uint8array-utils";

/** invalid char for normal js identifiers */
export const PEBBLE_INTERNAL_IDENTIFIER_PREFIX = "§";
/** invalid char for normal js identifiers */
export const PEBBLE_INTERNAL_IDENTIFIER_SEPARATOR = "#";

// Keep getRandomBytes outside the class as requested
let getRandomBytes = (bytes: Uint8Array) => {
    for (let i = 0; i < bytes.length; i++)
        bytes[i] = ((Math.random() * 0x100) >>> 0);
    return bytes;
}

try {
    if (
        typeof globalThis !== "undefined"
        && typeof globalThis.crypto !== "undefined"
        && isObject(globalThis.crypto)
        && typeof globalThis.crypto.getRandomValues === "function"
    ) getRandomBytes = globalThis.crypto.getRandomValues.bind(globalThis.crypto);
} catch {}

/**
 * Creates and tracks unique internal variable names for the Pebble compiler
 */
export class UidGenerator
{
    constructor() {
        this.uids = new Set<string>();
    }

    private readonly uids: Set<string>;

    getUid(): string {
        const bytes = new Uint8Array(Math.max(1, Math.log1p(this.uids.size) >>> 0));
        let uid: string;
        do {
            uid = toHex(getRandomBytes(bytes));
        } while (this.uids.has(uid));
        this.uids.add(uid);
        return uid;
    }

    /**
     * Generates a unique internal variable name
     */
    getUniqueInternalName(name: string): string {
        if (typeof name !== "string" || name.length === 0) name = PEBBLE_INTERNAL_IDENTIFIER_PREFIX;

        name = name.startsWith(PEBBLE_INTERNAL_IDENTIFIER_PREFIX) ? name :
            PEBBLE_INTERNAL_IDENTIFIER_PREFIX + name;

        return name + "_" + this.getUid();
    }

    public unsafe_evil_forgetEverything_explain_use_with_comment(): void {
        this.uids.clear();
    }
}

// Create a default instance for backward compatibility
export const defaultSymbolForge = new UidGenerator();

// Export the original functions for backward compatibility
export const getUniqueInternalName = defaultSymbolForge.getUniqueInternalName.bind(defaultSymbolForge);

export function isInternalName( name: string ): boolean
{
    return name.startsWith( PEBBLE_INTERNAL_IDENTIFIER_PREFIX );
}