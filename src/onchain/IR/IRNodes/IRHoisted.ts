import { toHex, uint8ArrayEq } from "@harmoniclabs/uint8array-utils";
import { blake2b_224 } from "../../../crypto";
import { Cloneable } from "../../../types/interfaces/Cloneable";
import ObjectUtils from "../../../utils/ObjectUtils";
import { IRTerm } from "../IRTerm";
import { IHash } from "../interfaces/IHash";
import { concatUint8Arr } from "../utils/concatUint8Arr";
import { isClosedIRTerm } from "../utils/isClosedIRTerm";
import { BasePlutsError } from "../../../errors/BasePlutsError";
import { IRApp } from "./IRApp";
import { IRFunc } from "./IRFunc";
import { IRLetted } from "./IRLetted";
import { IIRParent } from "../interfaces/IIRParent";
import { isIRTerm } from "../utils/isIRTerm";
import { ToJson } from "../../../utils/ts/ToJson";
import { IllegalIRToUPLC } from "../../../errors/PlutsIRError/IRCompilationError/IllegalIRToUPLC";
import { ToUPLC } from "../../UPLC/interfaces/ToUPLC";
import { UPLCTerm } from "../../UPLC/UPLCTerm";


type HoistedSetEntry = {
    hoisted: IRHoisted,
    nReferences: number
}

export class IRHoisted
    implements Cloneable<IRHoisted>, IHash, IIRParent, ToJson, ToUPLC
{
    readonly hash!: Uint8Array;
    markHashAsInvalid!: () => void;

    hoisted!: IRTerm

    // `IRHoisted` can have only other `IRHoisted` as deps
    readonly dependencies!: HoistedSetEntry[];

    parent: IRTerm | undefined;

    clone!: () => IRHoisted;

    constructor( hoisted: IRTerm, dependencies?: HoistedSetEntry[] )
    {
        // unwrap
        // !!! IMPORTANT !!!
        while( hoisted instanceof IRHoisted ) hoisted = hoisted.hoisted;

        if( !isClosedIRTerm( hoisted ) )
        throw new BasePlutsError(
            "only closed terms can be hoisted"
        );
        
        // initialize without calling "set"
        let _hoisted: IRTerm = hoisted;
        _hoisted.parent = this;
        let _deps: HoistedSetEntry[] = dependencies?.slice() ?? getSortedHoistedSet( getHoistedTerms( hoisted ) );

        let hash: Uint8Array | undefined = undefined;
        Object.defineProperty(
            this, "hash", {
                get: () => {
                    if(!( hash instanceof Uint8Array ))
                    {
                        hash = blake2b_224(
                            concatUint8Arr(
                                IRHoisted.tag,
                                hoisted.hash
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

        Object.defineProperty(
            this, "hoisted",
            {
                get: () => _hoisted,
                set: ( newHoisted: IRTerm ) => {
                    if( !isClosedIRTerm( hoisted ) )
                    throw new BasePlutsError(
                        "only closed terms can be hoisted"
                    );
                    this.markHashAsInvalid();
                    _deps = getSortedHoistedSet( getHoistedTerms( newHoisted ) );
                    _hoisted = newHoisted;
                    _hoisted.parent = this
                }
            }
        );

        Object.defineProperty(
            this, "dependencies",
            {
                get: (): HoistedSetEntry[] => _deps.map( dep => ({
                    hoisted: dep.hoisted.clone(),
                    nReferences: dep.nReferences
                })), // MUST return clones
                set: () => {},
                enumerable: true,
                configurable: false
            }
        );

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
                enumerable: true,
                configurable: false
            }
        );
        
        ObjectUtils.defineProperty(
            this, "clone",
            () => {
                return new IRHoisted(
                    this.hoisted.clone(),
                    _deps.slice() // as long as `dependecies` getter returns clones this is fine
                );
            }
        );
        
    }

    static get tag(): Uint8Array { return new Uint8Array([ 0b0000_0110 ]); }

    toJson(): any
    {
        return {
            type: "IRHoisted",
            hash: toHex( this.hash ),
            hoisted: this.hoisted.toJson()
        }
    }

    toUPLC(): UPLCTerm
    {
        throw new IllegalIRToUPLC(
            "Can't convert 'IRHoisted' to valid UPLC"
        );
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
    function addToSet( ..._terms: HoistedSetEntry[] ): void
    {
        for( let i = 0; i < _terms.length; i++ )
        {
            const thisHoistedEntry = _terms[i]; 
            const thisHash = thisHoistedEntry.hoisted.hash;

            const idxInSet = hashesSet.findIndex( hash => uint8ArrayEq( hash, thisHash ) )

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
                set[ idxInSet ].nReferences += thisHoistedEntry.nReferences
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
            hoisteds.push( ...term.dependencies, {hoisted: term, nReferences: 1 });
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
        if( term instanceof IRLetted )
        {
            // useless
            // term.dependencies.forEach( searchIn )
            // dependecies are still in the body anyway

            searchIn( term.value );
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