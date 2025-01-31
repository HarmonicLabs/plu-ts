import { iterTree } from "../toUPLC/_internal/iterTree";
import { IRVar } from "./IRVar";
import { positiveIntAsBytes } from "../utils/positiveIntAsBytes";
import { IRMetadata } from "../interfaces/IRMetadata";
import { Cloneable } from "@harmoniclabs/cbor/dist/utils/Cloneable";
import { freezeAll, defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { BasePlutsError } from "../../utils/BasePlutsError";
import { ToJson } from "../../utils/ToJson";
import { IRTerm } from "../IRTerm";
import { IHash, IIRParent } from "../interfaces";
import { concatUint8Arr } from "../utils/concatUint8Arr";
import { isIRTerm } from "../utils/isIRTerm";
import { IRApp } from "./IRApp";
import { IRDelayed } from "./IRDelayed";
import { IRForced } from "./IRForced";
import { IRFunc } from "./IRFunc";
import { IRHoisted } from "./IRHoisted";
import { prettyIR, prettyIRJsonStr } from "../utils";
import { IRParentTerm, isIRParentTerm } from "../utils/isIRParentTerm";
import { _modifyChildFromTo } from "../toUPLC/_internal/_modifyChildFromTo";
import { BaseIRMetadata } from "./BaseIRMetadata";
import { _getMinUnboundDbn } from "../toUPLC/subRoutines/handleLetted/groupByScope";
import { IRConstr } from "./IRConstr";
import { IRCase } from "./IRCase";
import { equalIrHash, hashIrData, IRHash, irHashToHex, isIRHash } from "../IRHash";
import { shallowEqualIRTermHash } from "../utils/equalIRTerm";
import { IRNodeKind } from "../IRNodeKind";
import { IRRecursive } from "./IRRecursive";
import { IRSelfCall } from "./IRSelfCall";
import { fromHex } from "@harmoniclabs/uint8array-utils";


export type LettedSetEntry = {
    letted: IRLetted,
    nReferences: number
};

export function jsonLettedSetEntry( entry: LettedSetEntry )
{
    return {
        letted: irHashToHex(entry.letted.hash),
        nReferences: entry.nReferences
    }

}

export function expandedJsonLettedSetEntry( entry: LettedSetEntry )
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

let n_hash_access = 0;

export class IRLetted
    implements Cloneable<IRLetted>, IHash, IIRParent, ToJson, IRLettedMetadata
{
    private _hash: IRHash | undefined;
    get hash(): IRHash
    {
        if(!isIRHash( this._hash ))
        {
            /*
            NOTE TO SELF:

            NEVER
            NEVER
            NEVER

            NEVER GET THE HASH BASED ON THE METADATA

            NEVER
            */
            const normalized = getNormalizedLettedArgs( this.dbn, this._value );
            if( normalized === undefined )
            {
                // `_value` doesn't includes any `IRVar`
                // aka. there is nothing to normalize
                // just use the value regardless of the
                // `IRLetted` dbn instantiation
                this._hash = hashIrData(
                    concatUint8Arr(
                        IRLetted.tag,
                        this._value.hash
                    )
                );
            }
            else
            {
                this._hash = hashIrData(
                    concatUint8Arr(
                        IRLetted.tag,
                        positiveIntAsBytes( normalized[0] ),
                        normalized[1].hash
                    )
                );
                /*
                const [ normalized_dbn, normalized_value] = normalized;
                if( toHex( hash ) === "ee84fb036ed2726e01b0415109246927" )
                {
                    const original_value = _value.clone();
                    const minDbn = getMinVarDbn( original_value );
                    const minUnb = _getMinUnboundDbn( original_value );
                    console.log(
                        "_ee84fb036ed2726e01b0415109246927_",
                        "\noriginal value:", prettyIRJsonStr( original_value, 2, { hoisted: false } ),
                        "\nmin dbn:", minDbn,
                        "\nmin unbound:", minUnb,
                        "\nnormalized dbn:", normalized_dbn,
                    );
                }
                //*/
            }
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

    private _dbn: number
    /**
     * we need to keep track of the debruijn at which the `IRLetted` is instantiated
     * 
     * this is because stuff like `new IRLetted( new IRVar(0) )` has different meaning 
     * at different DeBruijn levels
     * 
     * knowing the DeBruijn we can differentiate them
     */
    get dbn(): number { return this._dbn; }
    set dbn( newDbn: number )
    {
        if(!(
            Number.isSafeInteger( newDbn ) && newDbn >= 0 
        )) throw new BasePlutsError(
            "invalid index for an `IRLetted` instance"
        );

        if( newDbn === this._dbn ){
            // everything ok
            // avoid calling `markHashAsInvalid` 
            return;
        }

        this.markHashAsInvalid();
        this._dbn = newDbn;
    }

    isClosedAtDbn( dbn: number ): boolean
    {
        if( !Number.isSafeInteger( dbn ) ) throw new Error("unexpected unsafe dbn integer")
        const minUnbound = _getMinUnboundDbn( this._value );
        if( minUnbound === undefined ) return true;
        return minUnbound < dbn;
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

    readonly meta!: IRLettedMeta

    constructor(
        DeBruijn: number | bigint,
        toLet: IRTerm,
        metadata: Partial<IRLettedMeta> = {},
        _unsafeHash: IRHash | undefined = undefined
    )
    {
        DeBruijn = typeof DeBruijn === "bigint" ? Number( DeBruijn ) : DeBruijn; 
        if(!(
            Number.isSafeInteger( DeBruijn ) && DeBruijn >= 0 
        )) throw new BasePlutsError(
            "invalid index for an `IRLetted` instance"
        );

        while(
            toLet instanceof IRLetted ||
            toLet instanceof IRHoisted
        )
        {
            toLet = toLet instanceof IRLetted ? toLet.value : toLet.hoisted;
        }
        if( !isIRTerm( toLet ) )
        throw new BasePlutsError(
            "letted value was not an IRTerm"
        );

        this._dbn = DeBruijn;

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

    static get kind(): IRNodeKind.Letted { return IRNodeKind.Letted; }
    get kind(): IRNodeKind.Letted { return IRLetted.kind; }
    static get tag(): Uint8Array { return new Uint8Array([ IRLetted.kind ]); }

    clone(): IRLetted
    {
        return new IRLetted(
            this.dbn,
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
export function getSortedLettedSet( lettedTerms: LettedSetEntry[] ): LettedSetEntry[]
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
            // if( !hashesSet.includes( hash ) )
            // "includes" uses standard equality (===)
            if( idxInSet < 0 ) // not present
            {
                // add dependencies first
                // dependencies don't have references to the current letted
                // (of course, wouldn't be much of a dependecy otherwhise)
                //
                // don't add dependecies of dependecies since `dependecies` proerty
                // already calls `getSortedLettedSet( getLettedTerms( _value ) )`
                // so repeating it here would count deps twice (exponentially for deps of deps)
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
export function getLettedTerms( irTerm: IRTerm, options?: Partial<GetLettedTermsOptions> ): LettedSetEntry[]
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

        if( t instanceof IRLetted )
        {
            lettedTerms.push({ letted: t, nReferences: 1 });
            if( all )
            {
                stack.push( t.value );
            }
            continue;
        }

        if( t instanceof IRApp )
        {
            stack.push( t.fn, t.arg );
            continue;
        }

        if( t instanceof IRConstr )
        {
            stack.push( ...Array.from( t.fields ) );
            continue;
        }
        if( t instanceof IRCase )
        {
            stack.push( t.constrTerm, ...Array.from( t.continuations ) );
            continue;
        }

        if( t instanceof IRFunc )
        {
            stack.push( t.body );
            continue;
        }

        if( t instanceof IRRecursive )
        {
            stack.push( t.body );
            continue;
        }

        if( t instanceof IRForced )
        {
            stack.push( t.forced );
            continue;
        }

        if( t instanceof IRDelayed )
        {
            stack.push( t.delayed );
            continue;
        }

        if( includeHoisted )
        {
            if( t instanceof IRHoisted )
            {
                stack.push( t.hoisted );
                continue;
            }
        }
    }

    return lettedTerms;
}


export function getNormalizedLettedArgs( lettedDbn: number, value: IRTerm ): [ normalized_dbn: number, noramlized_value: IRTerm ] | undefined
{
    const normalized_value = value.clone();
    const minDbn = getMinVarDbn( normalized_value );
    if( minDbn === undefined ) return undefined;

    if( minDbn !== 0 )
    iterTree( normalized_value,
        (node, relativeDbn) => {
            if( node instanceof IRVar )
            {
                node.dbn -= minDbn
            }
            else if( node instanceof IRSelfCall )
            {
                node.dbn -= minDbn;
            }
            //*
            else if( node instanceof IRLetted )
            {
                const max = getMaxVarDbn( node.value );
                if(
                    // no vars
                    typeof max !== "number" ||
                    // defined outside of letted
                    max >= relativeDbn
                )
                {
                    node.dbn -= minDbn;
                }
                else // if depends on vars in this letted
                {
                    // TODO: fix double checking already inlined values
                    //
                    // this is currently a workaround
                    //
                    // the real problem is that sometimes (when?)
                    // `iterTree` goes back checking some value that was already modified
                    // in the case of `IRApp` as parent, throwing an error
                    // because we don't know which value we should modify
                    if( node.parent instanceof IRApp )
                    {
                        const parent = node.parent;
                        const currentChild = node;
                        if( // parent is actually pointing to child
                            currentChild === parent.arg ||
                            currentChild === parent.fn ||
                            equalIrHash( parent.arg.hash, currentChild.hash ) ||
                            equalIrHash( parent.fn.hash, currentChild.hash )
                        )
                        {
                            // inline
                            _modifyChildFromTo(
                                node.parent,
                                node,
                                node.value
                            );
                            return true; // modified parent
                        }
                        else return false; // modified parent
                    }
                    else {
                        if( node.parent ) // only modify if not root
                        {
                            // inline
                            _modifyChildFromTo(
                                node.parent,
                                node,
                                node.value
                            );
                            return true; // modified parent
                        }
                        else return false;
                    }
                }
            }
            //*/
        },
        // shouldSkipNode ?
        // hoisted terms are not really here
        // will be substituted to variables when the time comes
        // however now are here and we need to skip them
        //
        // !!! WARNING !! removing this causes strange uplc compilation BUGS
        (node, dbn) => node instanceof IRHoisted
    );

    // !!! IMPORTANT !!! _getMinUnboundDbn( value ) MUST be called on the original value; NOT the **modified** `normalized_value`
    return [ lettedDbn - (_getMinUnboundDbn( value ) ??  minDbn), normalized_value ];
}

/**
 * 
 * @param term the ir term to iter to search for vars
 * @returns {number | undefined} 
 * 
 * @example
 * ```ts
 * let minDbn = getMinVarDbn( new IRVar(0) ); // 0
 * minDbn = getMinVarDbn( IRConst.unit ); // undefined
 * minDbn = getMinVarDbn( new IRFunc( 1, new IRVar( 0 ) ) ); // 0
 * ```
 */
export function getMinVarDbn( term: IRTerm ): number | undefined
{
    let min: number | undefined = undefined;
    let foundAny: boolean = false;

    iterTree( term,
        (node) => {
            if(
                node instanceof IRVar ||
                node instanceof IRSelfCall
            )
            {
                if( foundAny )
                {
                    min = Math.min( min as number, node.dbn );
                }
                else
                {
                    foundAny = true;
                    min = node.dbn;
                }
            }
        },
        // shouldSkipNode ?
        // hoisted terms are not really here
        // will be substituted to variables when the time comes
        // however now are here and we need to skip them
        node => node instanceof IRHoisted // skip if hoisted
    );

    return min;
}


/**
 * 
 * @param term the ir term to iter to search for vars
 * @returns {number | undefined} 
 */
function getMaxVarDbn( term: IRTerm ): number | undefined
{
    let max: number | undefined = undefined;
    let foundAny: boolean = false;

    iterTree( term,
        (node) => {
            if(
                node instanceof IRVar ||
                node instanceof IRSelfCall
            )
            {
                if( foundAny )
                {
                    max = Math.max( max as number, node.dbn );
                }
                else
                {
                    foundAny = true;
                    max = node.dbn;
                }
            }
        },
        // shouldSkipNode ?
        // hoisted terms are not really here
        // will be substituted to variables when the time comes
        // however now are here and we need to skip them
        node => node instanceof IRHoisted // skip if hoisted
    );

    return max;
}