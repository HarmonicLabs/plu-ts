import JsRuntime from "../../../../utils/JsRuntime";

import { BasePlutsError } from "../../../../errors/BasePlutsError";
import { BitStream } from "../../../../types/bits/BitStream";
import { Cloneable } from "../../../../types/interfaces/Cloneable";
import { UPLCEncoder } from "../../UPLCEncoder";
import { UPLCProgram } from "../../UPLCProgram";
import { UPLCVersion } from "../../UPLCProgram/UPLCVersion";
import { UPLCTerm, getHoistedTerms, isClosedTerm, showConstType, showUPLC } from "../../UPLCTerm";
import { HoistedSourceUID } from "./HoistedSourceUID";
import { get, registerUID } from "./HoistedSourceUID/HoistedCache";
import ObjectUtils from "../../../../utils/ObjectUtils";

/**
 * basically an insertion sort;
 * 
 * @param {HoistedUPLC[]} hoistedTerms
 * @returns {HoistedUPLC[]} a **new** array with ```HoistedUPLC```s with no dependecies first, followed by the dependents
 */
export function getSortedHoistedSet( hoistedTerms: HoistedUPLC[] ): HoistedUPLC[]
{
    const set: HoistedUPLC[] = [];
    const compiledSet: BitStream[] = [];
     
    /**
     * **O((n * m) * d)**
     * 
     * where
     * 
     *      n = length of set
     *      m = number of terms passed
     *      d = number of unique dependecies among the passed terms
     */
    function addToSet( ..._terms: HoistedUPLC[] ): void
    {
        for( let i = 0; i < _terms.length; i++ )
        {
            const compiled = _terms[i].compiled;

            // if( !compiledSet.includes( compiled ) )
            // "includes" uses standard equality (===)
            if(!compiledSet.some( bitStream => BitStream.eq( bitStream, compiled ) ))
            {
                // add dependecies first
                addToSet( ..._terms[ i ].dependencies );

                compiledSet.push( compiled );
                set.push( _terms[i] );
            }
        }
    }

    addToSet( ...hoistedTerms );

    return set;
}

export function isSortedHoistedSet( hoistedTerms: HoistedUPLC[] ): boolean
{
    let hasToHaveNDeps: number = hoistedTerms[ 0 ] === undefined ? 0 : hoistedTerms[ 0 ].nDeps ;

    /**
     * withNDeps[0] returns all HoistedTerms with 0 dependecies
     * 
     * withNDeps[1] returns all HoistedTerms with 1 dependecies
     * 
     * withNDeps[2] returns all HoistedTerms with 2 dependecies
     * 
     * etc...
     */
    const withNDeps: HoistedUPLC[][] = new Array(hasToHaveNDeps + 1).fill([]);

    for( let hTerm of hoistedTerms )
    {
        if( hTerm.nDeps === hasToHaveNDeps || hTerm.nDeps === hasToHaveNDeps + 1 )
        {
            if( hTerm.nDeps === hasToHaveNDeps + 1 ) {
                hasToHaveNDeps++;
                withNDeps.push( [] );
            }

            withNDeps[ hasToHaveNDeps ].push( hTerm );

            for( let j = 0; j < hTerm.nDeps; j++ )
            {
                const termDep = hTerm.dependencies[ j ];
                if( !withNDeps[ termDep.nDeps ].includes( termDep ) ) return false;
            }
        }
        else return false;
    }

    return true;
}

export class HoistedUPLC
    implements Cloneable<HoistedUPLC>
{
    readonly compiled!: BitStream
    readonly dependencies!: HoistedUPLC[]

    readonly nDeps!: number

    readonly UPLC: UPLCTerm;

    constructor( UPLC_: UPLCTerm, source_uid: HoistedSourceUID | undefined, deps?: HoistedUPLC[], compiled?: BitStream )
    {
        if( source_uid !== undefined )
        {
            let fromCache = get( source_uid );
            if( fromCache !== undefined ) return fromCache;
        }

        // unwrap nested hoisted
        while( UPLC_ instanceof HoistedUPLC ) UPLC_ = UPLC_.UPLC;

        const UPLC = UPLC_;

        JsRuntime.assert(
            isClosedTerm( UPLC ),
            /**
             * @fixme add proper error
             */
            new BasePlutsError(
                "trying to hoist an UPLCTerm with free variables in it;"
            )
        );

        if( source_uid !== undefined )
        {
            registerUID( source_uid, this );
            Object.defineProperty(
                this, "uid", 
                {
                    value: source_uid,
                    writable: false,
                    configurable: false,
                    enumerable: false
                }
            );
        }

        const _deps = Array.isArray( deps ) ? deps : getSortedHoistedSet( getHoistedTerms( UPLC ) );

        this.UPLC = UPLC
        // encodes as default version term (1.0.0)
        const _compiled = compiled ?? UPLCEncoder.compile(
            new UPLCProgram( 
                new UPLCVersion( 1, 0 ,0 ),
                /**!!! IMPORTANT !!!
                 * `UPLCEncoder.compile` modifies the UPLC
                 * `clone` here is essential
                **/
                UPLC
            )
        );

        Object.defineProperty(
            this, "compiled",
            {
                get: () => _compiled.clone(),
                set: () => {},
                enumerable: true,
                configurable: false
            } 
        );

        Object.defineProperty(
            this, "dependencies",
            {
                get: () => _deps.map( dep => new HoistedUPLC( dep.UPLC.clone(), undefined ) ),
                set: () => {},
                enumerable: true,
                configurable: false
            }
        );

        Object.defineProperty(
            this, "nDeps",
            {
                get: () => _deps.length,
                set: () => {},
                enumerable: true,
                configurable: false
            }
        );

        ObjectUtils.defineReadOnlyProperty(
            this, "clone",
            () => new HoistedUPLC( 
                this.UPLC.clone(),
                undefined, // no uid
                _deps, // no deps clone
                this.compiled
            )
        );

        ObjectUtils.defineReadOnlyProperty(
            this, "clone",
            () => new HoistedUPLC( 
                this.UPLC.clone(),
                undefined, // no uid
                _deps, // no deps clone
                this.compiled
            )
        )
    }

    clone!: () =>  HoistedUPLC

}