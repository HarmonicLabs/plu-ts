import { uint8ArrayEq } from "@harmoniclabs/uint8array-utils";
import { blake2b_224 } from "../../../crypto";
import { Cloneable } from "../../../types/interfaces/Cloneable";
import ObjectUtils from "../../../utils/ObjectUtils";
import { IRTerm } from "../IRTerm";
import { IHash } from "../interfaces/IHash";
import { concatUint8Arr } from "../utils/concatUint8Arr";
import { IRApp } from "./IRApp";
import { IRFunc } from "./IRFunc";

export class IRLetted
    implements Cloneable<IRLetted>, IHash
{
    readonly hash!: Uint8Array;

    readonly value!: IRTerm

    readonly dependencies!: IRLetted[]

    clone!: () => IRLetted

    constructor( value: IRTerm, dependencies: IRLetted[] = [] )
    {
        ObjectUtils.defineReadOnlyProperty(
            this, "value", value
        );

        let hash: Uint8Array | undefined = undefined;
        Object.defineProperty(
            this, "hash", {
                get: () => {
                    if(!( hash instanceof Uint8Array ))
                    {
                        hash = blake2b_224(
                            concatUint8Arr(
                                IRLetted.tag,
                                value.hash
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

        const deps = dependencies?.slice() ?? getSortedLettedSet( getLettedTerms( value ) );

        Object.defineProperty(
            this, "dependencies",
            {
                get: () => deps.map( dep => dep.clone() ), // MUST return clones
                set: () => {},
                enumerable: true,
                configurable: false
            }
        )
        ObjectUtils.defineReadOnlyProperty(
            this, "clone",
            () => {
                return new IRLetted(
                    this.value.clone(), 
                    deps.slice() // as long as `dependecies` getter returns clones this is fine
                )
            }
        )
    }

    static get tag(): Uint8Array { return new Uint8Array([ 0b0000_0101 ]); }

}


/**
 * basically an insertion sort;
 * 
 * @param {IRLetted[]} hoistedTerms
 * @returns {IRLetted[]} a **new** array with ```IRLetted```s with no dependencies first, followed by the dependents
 */
function getSortedLettedSet( hoistedTerms: IRLetted[] ): IRLetted[]
{
    const set: IRLetted[] = [];
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
    function addToSet( ..._terms: IRLetted[] ): void
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

function getLettedTerms( irTerm: IRTerm ): IRLetted[]
{
    const hoisteds: IRLetted[] = [];

    function searchIn( term: IRTerm ): void
    {
        if( term instanceof IRLetted )
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

        // if( term instanceof IRHoisted ) return; // hoisted terms are closed
        // if( term instanceof IRNative ) return;
        // if( term instanceof IRVar ) return;
        // if( term instanceof IRConst ) return;
        // if( term instanceof IRError ) return;
    }

    searchIn( irTerm );

    return hoisteds;
}