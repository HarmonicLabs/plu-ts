import BasePlutsError from "../../../errors/BasePlutsError";
import BitStream from "../../../types/bits/BitStream";
import Debug from "../../../utils/Debug";
import JsRuntime from "../../../utils/JsRuntime";
import UPLCEncoder from "../UPLCEncoder";
import UPLCProgram from "../UPLCProgram";
import UPLCVersion from "../UPLCProgram/UPLCVersion";
import UPLCTerm, { getHoistedTerms, isClosedTerm } from "../UPLCTerm";

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

export default class HoistedUPLC
{
    private readonly _compiled: BitStream;
    get compiled(): BitStream { return this._compiled.clone() }

    private readonly _deps: HoistedUPLC[];
    /**
     * @fixme ```HoistedUPLC``` should implement a clone
     *      and a (unsafe) way to construct directly from encoded UPLC and dependecies
     * 
     * ```get dependecies()``` should retun a copy of an array of clones
     * to preserve this instance ```_deps``` form being modified
     */
    get dependencies(): HoistedUPLC[] { return this._deps; }

    get nDeps(): number { return this._deps.length };

    readonly UPLC: UPLCTerm;

    constructor( UPLC: UPLCTerm )
    {
        JsRuntime.assert(
            isClosedTerm( UPLC ),
            /**
             * @fixme add proper error
             */
            new BasePlutsError(
                "trying to hoist an UPLCTerm with free variables in it; "
            )
        );

        this._deps = getSortedHoistedSet( getHoistedTerms( UPLC ) );

        this.UPLC = UPLC;
        // encodes as default version term (1.0.0)
        this._compiled = UPLCEncoder.compile( new UPLCProgram( new UPLCVersion( 1, 0 ,0 ), UPLC ));
    }

}