import { iterTree } from "../toUPLC/_internal/iterTree";
import { IRVar } from "./IRVar";
import { positiveIntAsBytes } from "../utils/positiveIntAsBytes";
import { IRMetadata } from "../interfaces/IRMetadata";
import { Cloneable } from "@harmoniclabs/cbor/dist/utils/Cloneable";
import { freezeAll, defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { BasePlutsError } from "../../utils/BasePlutsError";
import { ToJson } from "../../utils/ToJson";
import { IIRTerm, IRTerm } from "../IRTerm";
import { IHash, IIRParent } from "../interfaces";
import { concatUint8Arr } from "../utils/concatUint8Arr";
import { isIRTerm } from "../utils/isIRTerm";
import { IRApp } from "./IRApp";
import { IRDelayed } from "./IRDelayed";
import { IRForced } from "./IRForced";
import { IRFunc } from "./IRFunc";
import { IRHoisted } from "./IRHoisted";
import { IRParentTerm, isIRParentTerm } from "../utils/isIRParentTerm";
import { _modifyChildFromTo } from "../toUPLC/_internal/_modifyChildFromTo";
import { BaseIRMetadata } from "./BaseIRMetadata";
import { _getMinUnboundDbn } from "../toUPLC/subRoutines/handleLetted/groupByScope";
import { IRConstr } from "./IRConstr";
import { IRCase } from "./IRCase";
import { equalIrHash, hashIrData, IRHash, irHashToBytes, irHashToHex, isIRHash } from "../IRHash";
import { shallowEqualIRTermHash } from "../utils/equalIRTerm";
import { IRNodeKind } from "../IRNodeKind";
import { IRRecursive } from "./IRRecursive";
import { IRSelfCall } from "./IRSelfCall";
import { prettyIR, prettyIRInline } from "../utils/showIR";
import { toHex } from "@harmoniclabs/uint8array-utils";


export type LettedSetEntry = {
    letted: IRLetted,
    nReferences: number
};

function jsonLettedSetEntry( entry: LettedSetEntry )
{
    return {
        letted: irHashToHex(entry.letted.hash),
        nReferences: entry.nReferences
    }

}

function expandedJsonLettedSetEntry( entry: LettedSetEntry )
{
    return {
        letted: irHashToHex( entry.letted.hash ),
        letted_value: prettyIR( entry.letted.value ).text.split("\n"),
        nReferences: entry.nReferences
    }
}

export interface IRLettedMeta extends BaseIRMetadata {
    /**
     * force hoisting even if only a single reference is found
     * 
     * useful to hoist letted terms used once in recursive expressions
    **/
    forceHoist: boolean,
    __src__?: string | undefined,
    isClosed: boolean
}

export interface IRLettedMetadata extends IRMetadata {
    meta: IRLettedMeta
}

const defaultLettedMeta: IRLettedMeta = freezeAll({
    forceHoist: false,
    __src__: undefined,
    isClosed: false
});

export class IRLetted
    implements IIRTerm, Cloneable<IRLetted>, IHash, IIRParent, ToJson, IRLettedMetadata
{
    readonly name: string;
    readonly meta!: IRLettedMeta

    constructor(
        name: string,
        toLet: IRTerm,
        metadata: Partial<IRLettedMeta> = {},
        _unsafeHash: IRHash | undefined = undefined
    )
    {

        if(!(
            typeof name === "string"
            && name.length > 0
        )) throw new BasePlutsError("invalid name for IRVar");
        this.name = name;

        while(
            toLet instanceof IRLetted
            || toLet instanceof IRHoisted
        ) toLet = toLet instanceof IRLetted ? toLet.value : toLet.hoisted;

        if( !isIRTerm( toLet ) )
        throw new BasePlutsError(
            "letted value was not an IRTerm"
        );

        this._value = toLet;
        this._value.parent = this;

        // we need the has before setting dependecies
        this._hash = isIRHash( _unsafeHash ) ? _unsafeHash : undefined;
        
        this._deps = undefined;

        this._parent = undefined;

        this.meta = {
            ...defaultLettedMeta,
            ...metadata,
            // isClosed: metadata.isClosed || this.isClosedAtDbn( 0 )
        };
    }

    private _hash: IRHash | undefined;
    get hash(): IRHash
    {
        if(!isIRHash( this._hash )) {
            this._hash = hashIrData(
                concatUint8Arr(
                    IRLetted.tag,
                    irHashToBytes( this._value.hash )
                )
            );
        }

        return this._hash;
    }
    markHashAsInvalid()
    {
        this._hash = undefined;
        this._deps = undefined;
        this.parent?.markHashAsInvalid();
    }
    isHashPresent(): boolean { return isIRHash( this._hash ); }

    private _value!: IRTerm
    get value(): IRTerm { return this._value; }
    set value( newVal: IRTerm )
    {
        while(
            newVal instanceof IRLetted
            || newVal instanceof IRHoisted
        ) newVal = newVal instanceof IRLetted ? newVal.value : newVal.hoisted;

        if( !isIRTerm( newVal ) )
        throw new BasePlutsError("letted term was not IRTerm");
    
        if(!shallowEqualIRTermHash(this._value, newVal))
        this.markHashAsInvalid();
        
        // remove deps even if the value is the same
        // newValue might be a clone of the current value
        // and so have different (new) objects
        this._deps = undefined;

        // keep the parent reference in the old child, useful for compilation
        // _value.parent = undefined;
        this._value = newVal;
        this._value.parent = this
    }

    private _deps: LettedSetEntry[] | undefined;
    get dependencies(): LettedSetEntry[]
    {
        if( this._deps === undefined )
        this._deps = getSortedLettedSet( getLettedTerms( this._value ) );
        return this._deps;
    }

    private _parent: IRParentTerm | undefined;
    get parent(): IRParentTerm | undefined { return this._parent; }
    set parent( newParent: IRParentTerm | undefined )
    {
        if(!( // assert
            // new parent value is different than current
            this._parent !== newParent && (
                // and the new parent value is valid
                newParent === undefined || 
                isIRParentTerm( newParent )
            )
        )) return;

        this._parent = newParent;
    }

    children(): IRTerm[] {
        return [ this._value ];
    }

    static get kind(): IRNodeKind.Letted { return IRNodeKind.Letted; }
    get kind(): IRNodeKind.Letted { return IRLetted.kind; }
    static get tag(): Uint8Array { return new Uint8Array([ IRLetted.kind ]); }

    clone(): IRLetted
    {
        return new IRLetted(
            this.name,
            this.value.clone(),
            { ...this.meta },
            this.isHashPresent() ? this.hash : undefined
        )
    }
    toJSON() { return this.toJson(); }
    toJson(): any 
    {
        return {
            type: "IRLetted",
            hash: irHashToHex( this.hash ),
            value: this.value.toJson()
        };
    }
}

/**
 * basically an insertion sort;
 * 
 * @param {LettedSetEntry[]} lettedTerms
 * @returns {LettedSetEntry[]} a **new** array with ```IRLetted```s with no dependencies first, followed by the dependents
 */
function getSortedLettedSet( lettedTerms: LettedSetEntry[] ): LettedSetEntry[]
{
    const set: LettedSetEntry[] = [];
    const hashesSet: IRHash[] = [];
     
    /**
     * **O((n * m) * d)**
     * 
     * where
     * 
     *      n = length of set
     *      m = number of terms passed
     *      d = number of unique dependencies among the passed terms
     */
    function addToSet( _terms: LettedSetEntry[] ): void
    {
        for( let i = 0; i < _terms.length; i++ )
        {
            const thisLettedEntry = _terms[i]; 
            const thisHash = thisLettedEntry.letted.hash;

            const idxInSet = hashesSet.findIndex( hash => equalIrHash( hash, thisHash ) )
            if( idxInSet < 0 ) // not present
            {
                // add dependencies first
                // dependencies don't have references to the current letted
                addToSet( getLettedTerms( thisLettedEntry.letted.value ) );

                hashesSet.push( thisHash );
                set.push({
                    letted: thisLettedEntry.letted,
                    nReferences: thisLettedEntry.nReferences
                });
            }
            else
            {
                const entry = set[ idxInSet ]; 
                entry.nReferences += thisLettedEntry.nReferences;
                entry.letted.meta.forceHoist = 
                    entry.letted.meta.forceHoist || 
                    thisLettedEntry.letted.meta.forceHoist;
            }
        }
    }

    addToSet( lettedTerms );

    return set;
}

export interface GetLettedTermsOptions {
    /**
     * looks for letted terms inside other letted terms
     * 
     * (unnecessary if called only to later pass the result to `getSortedLettedSet`)
     */
    all: boolean,
    /**
     * look for letted terms inside hoisted terms (always closed)
     */
    includeHoisted: boolean
}

export const default_getLettedTermsOptions: GetLettedTermsOptions = {
    all: false,
    includeHoisted: false
}
/**
 * 
 * @param {IRTerm} irTerm term to search in
 * @returns direct letted terms (no possible dependencies)
 */
function getLettedTerms( irTerm: IRTerm, options?: Partial<GetLettedTermsOptions> ): LettedSetEntry[]
{
    const {
        all,
        includeHoisted
    } = {
        ...default_getLettedTermsOptions,
        ...options
    };

    const lettedTerms: LettedSetEntry[] = [];

    const stack: IRTerm[] = [ irTerm ];

    while( stack.length > 0 )
    {
        const t = stack.pop() as IRTerm;

        if( t instanceof IRHoisted )
        {
            if( includeHoisted ) stack.push( t.hoisted );
            continue;
        }

        if( t instanceof IRLetted )
        {
            lettedTerms.push({ letted: t, nReferences: 1 });
            if( all ) stack.push( t.value );
            continue;
        }

        stack.push( ...t.children() );
    }

    return lettedTerms;
}