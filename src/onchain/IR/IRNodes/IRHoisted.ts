import { uint8ArrayEq } from "@harmoniclabs/uint8array-utils";
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


export class IRHoisted
    implements Cloneable<IRHoisted>, IHash
{
    readonly hash!: Uint8Array;

    readonly hoisted!: IRTerm

    // `IRHoisted` can have only other `IRHoisted` as deps
    readonly dependencies!: IRHoisted[];

    clone!: () => IRHoisted;

    constructor( hoisted: IRTerm, dependencies?: IRTerm[] )
    {
        // unwrap
        while( hoisted instanceof IRHoisted ) hoisted = hoisted.hoisted;

        if( !isClosedIRTerm( hoisted ) )
        throw new BasePlutsError(
            "only closed terms can be hoisted"
        );

        ObjectUtils.defineReadOnlyProperty(
            this, "hoisted", hoisted
        );

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

        const deps = dependencies?.slice() ?? getSortedHoistedSet( getHoistedTerms( hoisted ) );

        Object.defineProperty(
            this, "dependencies",
            {
                get: () => deps.map( dep => dep.clone() ), // MUST return clones
                set: () => {},
                enumerable: true,
                configurable: false
            }
        )
        
        ObjectUtils.defineProperty(
            this, "clone",
            () => {
                return new IRHoisted(
                    this.hoisted.clone(),
                    deps.slice() // as long as `dependecies` getter returns clones this is fine
                );
            }
        );
        
    }

    static get tag(): Uint8Array { return new Uint8Array([ 0b0000_0110 ]); }
}


/**
 * basically an insertion sort;
 * 
 * @param {IRHoisted[]} hoistedTerms
 * @returns {IRHoisted[]} a **new** array with ```IRHoisted```s with no dependencies first, followed by the dependents
 */
function getSortedHoistedSet( hoistedTerms: IRHoisted[] ): IRHoisted[]
{
    const set: IRHoisted[] = [];
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
    function addToSet( ..._terms: IRHoisted[] ): void
    {
        for( let i = 0; i < _terms.length; i++ )
        {
            const thisHash = _terms[i].hash;

            // if( !hashesSet.includes( compiled ) )
            // "includes" uses standard equality (===)
            if(!hashesSet.some( hash => uint8ArrayEq( hash, thisHash ) ))
            {
                // add dependencies first
                addToSet( ..._terms[ i ].dependencies );

                hashesSet.push( thisHash );
                set.push( _terms[i] );
            }
        }
    }

    addToSet( ...hoistedTerms );

    return set;
}

function getHoistedTerms( irTerm: IRTerm ): IRHoisted[]
{
    const hoisteds: IRHoisted[] = [];

    function searchIn( term: IRTerm ): void
    {
        if( term instanceof IRHoisted )
        {
            hoisteds.push( ...term.dependencies, term );
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