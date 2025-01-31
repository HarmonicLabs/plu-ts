import { IRDelayed } from "./IRDelayed";
import { IRMetadata } from "../interfaces/IRMetadata";
import { prettyIRJsonStr } from "../utils/showIR";
import { Cloneable } from "@harmoniclabs/cbor/dist/utils/Cloneable";
import { freezeAll, defineProperty } from "@harmoniclabs/obj-utils";
import { BasePlutsError } from "../../utils/BasePlutsError";
import { ToJson } from "../../utils/ToJson";
import { IRTerm } from "../IRTerm";
import { IHash, IIRParent } from "../interfaces";
import { concatUint8Arr } from "../utils/concatUint8Arr";
import { isClosedIRTerm } from "../utils/isClosedIRTerm";
import { isIRTerm } from "../utils/isIRTerm";
import { IRApp } from "./IRApp";
import { IRForced } from "./IRForced";
import { IRFunc } from "./IRFunc";
import { IRLetted } from "./IRLetted";
import { IRParentTerm, isIRParentTerm } from "../utils/isIRParentTerm";
import { _modifyChildFromTo } from "../toUPLC/_internal/_modifyChildFromTo";
import { IRConstr } from "./IRConstr";
import { IRCase } from "./IRCase";
import { equalIrHash, hashIrData, IRHash, irHashToHex, isIRHash } from "../IRHash";
import { shallowEqualIRTermHash } from "../utils/equalIRTerm";
import { IRNodeKind } from "../IRNodeKind";
import { IRRecursive } from "./IRRecursive";


export type HoistedSetEntry = {
    hoisted: IRHoisted,
    nReferences: number
}

export interface IRHoistedMeta {
    /**
     * force hoisting even if only a single reference is found
     * 
     * useful to hoist terms used once in recursive expressions
    **/
    forceHoist?: boolean,
    name?: string | undefined
}

export interface IRHoistedMetadata extends IRMetadata {
    meta: IRHoistedMeta
}

const defaultHoistedMeta: IRHoistedMeta = freezeAll({
    forceHoist: false
});

export class IRHoisted
    implements Cloneable<IRHoisted>, IHash, IIRParent, ToJson, IRHoistedMetadata
{
    readonly meta!: IRHoistedMeta

    constructor(
        hoisted: IRTerm, 
        metadata: Partial<IRHoistedMeta> = {},
        _unsafeHash?: IRHash
    )
    {
        // unwrap
        // !!! IMPORTANT !!!
        while( hoisted instanceof IRHoisted ) hoisted = hoisted.hoisted;

        if( !isClosedIRTerm( hoisted ) )
        {
            console.log(
                prettyIRJsonStr(
                    hoisted
                )
            )
            throw new BasePlutsError(
                "only closed terms can be hoisted"
            );
        }
        
        // initialize without calling "set"
        this._hoisted = hoisted;
        this._hoisted.parent = this;
        
        this._deps = undefined;

        this._hash = isIRHash( _unsafeHash ) ? _unsafeHash : undefined;

        this._parent = undefined;

        this.meta = {
            ...defaultHoistedMeta,
            ...metadata,
            name: this._hoisted.meta?.name ?? metadata.name
        };
    }

    static get kind(): IRNodeKind.Hoisted { return IRNodeKind.Hoisted; }
    get kind(): IRNodeKind.Hoisted { return IRHoisted.kind; }
    static get tag(): Uint8Array { return new Uint8Array([ IRHoisted.kind ]); }

    private _hash!: IRHash | undefined;
    get hash(): IRHash
    {
        if(!isIRHash( this._hash ))
        {
            this._hash = hashIrData(
                concatUint8Arr(
                    IRHoisted.tag,
                    this.hoisted.hash
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
    isHashPresent(): boolean
    {
        return isIRHash( this._hash );
    }

    private _hoisted!: IRTerm;
    get hoisted(): IRTerm { return this._hoisted; }
    set hoisted( newHoisted: IRTerm )
    {
        if( !isClosedIRTerm( newHoisted ) )
        throw new BasePlutsError(
            "only closed terms can be hoisted"
        );
        if(!shallowEqualIRTermHash( this._hoisted, newHoisted ))
        this.markHashAsInvalid();
        
        // dependencies need to be updated EVEN if hash is the same
        // since the terms might be the same but maybe cloned
        this._deps = undefined;

        // keep the parent reference in the old child, useful for compilation
        // _hoisted.parent = undefined;
        this._hoisted = newHoisted;
        this._hoisted.parent = this
    }
    
    private _deps: HoistedSetEntry[] | undefined;
    get dependencies(): HoistedSetEntry[]
    {
        if( this._deps === undefined )
        this._deps = getSortedHoistedSet( getHoistedTerms( this._hoisted ) );
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

    clone(): IRHoisted
    {
        return new IRHoisted(
            this.hoisted.clone(),
            { ...this.meta },
            this.isHashPresent() ? this.hash : undefined
        )
    }
    toJSON() { return this.toJson(); }
    toJson(): any
    {
        return {
            type: "IRHoisted",
            hash: irHashToHex( this.hash ),
            hoisted: this.hoisted.toJson()
        }
    }
}


/**
 * basically an insertion sort;
 * 
 * @param {HoistedSetEntry[]} hoistedTerms
 * @returns {HoistedSetEntry[]} a **new** array with ```IRHoisted```s with no dependencies first, followed by the dependents
 */
export function getSortedHoistedSet( hoistedTerms: HoistedSetEntry[] ): HoistedSetEntry[]
{
    const set: HoistedSetEntry[] = [];
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
    function addToSet( ..._terms: HoistedSetEntry[] ): void
    {
        for( let i = 0; i < _terms.length; i++ )
        {
            const thisHoistedEntry = _terms[i]; 
            const thisHash = thisHoistedEntry.hoisted.hash;

            const idxInSet = hashesSet.findIndex( hash => equalIrHash( hash, thisHash ) )

            // if( !hashesSet.includes( compiled ) )
            // "includes" uses standard equality (===)
            if( idxInSet < 0 ) // not present
            {
                // add dependencies first
                addToSet( ..._terms[ i ].hoisted.dependencies );

                hashesSet.push( thisHash );
                set.push( thisHoistedEntry );
            }
            else
            {
                const entry = set[ idxInSet ]; 
                entry.nReferences += thisHoistedEntry.nReferences;
                entry.hoisted.meta.forceHoist = 
                    entry.hoisted.meta.forceHoist || 
                    thisHoistedEntry.hoisted.meta.forceHoist;
            }
        }
    }

    addToSet( ...hoistedTerms );

    return set;
}

export function getHoistedTerms( irTerm: IRTerm ): HoistedSetEntry[]
{
    const hoisteds: HoistedSetEntry[] = [];

    function searchIn( term: IRTerm ): void
    {
        if( term instanceof IRHoisted )
        {
            // only push direct hoisteds
            // dependencies are counted calling `getSortedHoistedSet`
            hoisteds.push({ hoisted: term, nReferences: 1 });
            return;
        }

        if( term instanceof IRApp )
        {
            searchIn( term.fn );
            searchIn( term.arg );
            return;
        }

        if( term instanceof IRConstr )
        {
            for( let i = 0; i < term.fields.length; i++ )
            {
                searchIn( term.fields[i] );
            }
            return;
        }
        if( term instanceof IRCase )
        {
            searchIn( term.constrTerm );
            for( let i = 0; i < term.continuations.length; i++ )
            {
                searchIn( term.continuations[i] );
            }
            return;
        }

        if( term instanceof IRFunc )
        {
            searchIn( term.body );
            return;
        }
        
        if( term instanceof IRRecursive )
        {
            searchIn( term.body );
            return;
        }

        if( term instanceof IRLetted )
        {
            // useless
            // term.dependencies.forEach( searchIn )
            // dependecies are still in the body anyway (hoisted are closed)

            searchIn( term.value );
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

        // if( term instanceof IRNative ) return;
        // if( term instanceof IRVar ) return;
        // if( term instanceof IRConst ) return;
        // if( term instanceof IRError ) return;
    }

    searchIn( irTerm );

    return hoisteds;
}

export function cloneHoistedSetEntry({hoisted, nReferences}: HoistedSetEntry ): HoistedSetEntry
{
    return {
        hoisted: hoisted.clone(),
        nReferences
    };
}