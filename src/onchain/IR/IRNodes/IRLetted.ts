import { toHex, uint8ArrayEq } from "@harmoniclabs/uint8array-utils";
import { blake2b_224 } from "../../../crypto";
import { Cloneable } from "../../../types/interfaces/Cloneable";
import ObjectUtils from "../../../utils/ObjectUtils";
import { IRTerm } from "../IRTerm";
import { IHash } from "../interfaces/IHash";
import { concatUint8Arr } from "../utils/concatUint8Arr";
import { IRApp } from "./IRApp";
import { IRFunc } from "./IRFunc";
import { IIRParent } from "../interfaces/IIRParent";
import { isIRTerm } from "../utils/isIRTerm";
import { BasePlutsError } from "../../../errors/BasePlutsError";
import { IRForced } from "./IRForced";
import { IRDelayed } from "./IRDelayed";
import { ToJson, logJson } from "../../../utils/ts/ToJson";
import { IllegalIRToUPLC } from "../../../errors/PlutsIRError/IRCompilationError/IllegalIRToUPLC";
import { ToUPLC } from "../../UPLC/interfaces/ToUPLC";
import { UPLCTerm } from "../../UPLC/UPLCTerm";
import { getRoot } from "../tree_utils/getRoot";


export type LettedSetEntry = {
    letted: IRLetted,
    nReferences: number
};

export function jsonLettedSetEntry( entry: LettedSetEntry )
{
    return {
        letted: toHex(entry.letted.hash),
        nReferences: entry.nReferences
    }
}

export class IRLetted
    implements Cloneable<IRLetted>, IHash, IIRParent, ToJson, ToUPLC
{
    readonly hash!: Uint8Array;
    markHashAsInvalid!: () => void;

    value!: IRTerm

    readonly dependencies!: LettedSetEntry[]

    parent: IRTerm | undefined;

    clone!: () => IRLetted

    constructor( toLet: IRTerm )
    {
        if( !isIRTerm( toLet ) )
        throw new BasePlutsError(
            "letted value was not an IRTerm"
        );

        // initialize without calling "set"
        let _value: IRTerm = toLet.clone();
        _value.parent = this;

        // we need the has before setting dependecies
        let hash: Uint8Array | undefined = undefined;
        Object.defineProperty(
            this, "hash", {
                get: () => {
                    if(!( hash instanceof Uint8Array ))
                    {
                        hash = blake2b_224(
                            concatUint8Arr(
                                IRLetted.tag,
                                _value.hash
                            )
                        )
                    }
                    return hash.slice();
                },
                set: () => {},
                enumerable: true,
                configurable: false
            }
        );
        Object.defineProperty(
            this, "markHashAsInvalid",
            {
                value: () => { 
                    hash = undefined;
                    this.parent?.markHashAsInvalid()
                },
                writable: false,
                enumerable:  false,
                configurable: false
            }
        );

        // make sure to use the cloned `_value` and NOT `toLet`
        // since we need the same root ( setted trough `parent` )
        let _deps: LettedSetEntry[] = getSortedLettedSet( getLettedTerms( _value ) );
        
        Object.defineProperty(
            this, "value",
            {
                get: () => _value,
                set: ( newVal: IRTerm ) => {
                    if( !isIRTerm( newVal ) )
                    throw new BasePlutsError(
                        "only closed terms can be hoisted"
                    );
                    this.markHashAsInvalid();
                    _deps = getSortedLettedSet( getLettedTerms( newVal ) );
                    _value = newVal;
                    _value.parent = this
                },
                enumerable: true,
                configurable: false
            }
        );

        Object.defineProperty(
            this, "dependencies",
            {
                get: (): LettedSetEntry[] => _deps.map( dep => {

                    const clone = dep.letted.clone();
                    clone.parent = dep.letted.parent; 
                    return {
                        letted: clone,
                        nReferences: dep.nReferences
                    }
                }), // MUST return clones
                set: () => {},
                enumerable: true,
                configurable: false
            }
        )

        let _parent: IRTerm | undefined = undefined;
        Object.defineProperty(
            this, "parent",
            {
                get: () => _parent,
                set: ( newParent: IRTerm | undefined ) => {

                    if( newParent === undefined || isIRTerm( newParent ) )
                    {
                        _parent = newParent;
                    }

                },
                enumerable: false,
                configurable: false
            }
        );

        ObjectUtils.defineReadOnlyProperty(
            this, "clone",
            () => {
                return new IRLetted(
                    this.value.clone()
                    // doesn't work because dependecies need to be bounded to the cloned value
                    // _deps.slice() // as long as `dependecies` getter returns clones this is fine
                )
            }
        );
    }

    static get tag(): Uint8Array { return new Uint8Array([ 0b0000_0101 ]); }

    toJson(): any 
    {
        return {
            type: "IRLetted",
            hash: toHex( this.hash ),
            value: this.value.toJson()
        }
    }
    
    toUPLC(): UPLCTerm
    {
        throw new IllegalIRToUPLC(
            "Can't convert 'IRLetted' to valid UPLC"
        );
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
    const hashesSet: Uint8Array[] = [];
     
    /**
     * **O((n * m) * d)**
     * 
     * where
     * 
     *      n = length of set
     *      m = number of terms passed
     *      d = number of unique dependencies among the passed terms
     */
    function addToSet( ..._terms: LettedSetEntry[] ): void
    {
        for( let i = 0; i < _terms.length; i++ )
        {
            const thisLettedEntry = _terms[i]; 
            const thisHash = thisLettedEntry.letted.hash;

            const idxInSet = hashesSet.findIndex( hash => uint8ArrayEq( hash, thisHash ) )
            // if( !hashesSet.includes( hash ) )
            // "includes" uses standard equality (===)
            if( idxInSet < 0 ) // not present
            {
                // add dependencies first
                // dependencies don't have references
                // to the current letted
                // (of course, wouldn't be much of a dependecy otherwhise)
                addToSet( ...thisLettedEntry.letted.dependencies );

                hashesSet.push( thisHash );
                set.push({
                    letted: thisLettedEntry.letted,
                    nReferences: thisLettedEntry.nReferences
                });
            }
            else
            {
                set[ idxInSet ].nReferences += thisLettedEntry.nReferences;
            }
        }
    }

    addToSet( ...lettedTerms );

    return set;
}

export function getLettedTerms( irTerm: IRTerm ): LettedSetEntry[]
{
    const lettedTerms: LettedSetEntry[] = [];

    function searchIn( term: IRTerm ): void
    {
        if( term instanceof IRLetted )
        {
            lettedTerms.push({ letted: term, nReferences: 1 });
            return;
        }

        if( term instanceof IRApp )
        {
            searchIn( term.fn );
            searchIn( term.arg );
            return;
        }

        if( term instanceof IRFunc )
        {
            searchIn( term.body );
            return;
        }

        if( term instanceof IRForced )
        {
            searchIn( term.forced );
            return;
        }

        if( term instanceof IRDelayed )
        {
            searchIn( term.delayed );
            return;
        }

        // if( term instanceof IRHoisted ) return; // hoisted terms are closed
        // if( term instanceof IRNative ) return;
        // if( term instanceof IRVar ) return;
        // if( term instanceof IRConst ) return;
        // if( term instanceof IRError ) return;
    }

    searchIn( irTerm );

    return lettedTerms;
}