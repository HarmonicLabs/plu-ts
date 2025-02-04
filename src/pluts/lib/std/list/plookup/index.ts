import { PList, PPair, TermFn } from "../../../../PTypes";
import { TermType, ToPType, asData, bool, data, lam, list, pair, termTypeToString, typeExtends } from "../../../../../type_system";
import { unwrapAsData } from "../../../../../type_system/tyArgs";
import { getDirectFstT } from "../../../../../type_system/tyArgs/getDirectFstT";
import { getDirectSndT } from "../../../../../type_system/tyArgs/getDirectSndT";
import { pif } from "../../../builtins/bool";
import { peqData } from "../../../builtins/data";
import { pfstPairNoUnwrap, psndPairNoUnwrap } from "../../../builtins/pair/noUnwrap";
import { papp } from "../../../papp";
import { pdelay } from "../../../pdelay";
import { pfn } from "../../../pfn";
import { phoist } from "../../../phoist";
import { plet } from "../../../plet";
import { punsafeConvertType } from "../../../punsafeConvertType";
import { PMaybe, PMaybeT } from "../../PMaybe";
import { toData } from "../../data";
import { precursiveList } from "../precursiveList";

export function plookup<
    KT extends TermType,
    VT extends TermType
>(
    kT: KT,
    vT: VT
): TermFn<[
    ToPType<KT>,
    PList<PPair<ToPType<KT>,ToPType<VT>>>
],  PMaybeT<ToPType<VT>>>
{
    kT = unwrapAsData( kT );
    vT = unwrapAsData( vT );

    const PMaybeVal = PMaybe( vT );

    const elems_t = pair( kT, vT );

    // pair call ususally adds `asData`
    // taking args from pair type in case it ever changes
    const fstT = getDirectFstT( elems_t );
    const sndT = getDirectSndT( elems_t );

    const pfst = pfstPairNoUnwrap( fstT, sndT );
    const psnd = psndPairNoUnwrap( fstT, sndT );

    const pvalueToData = toData( sndT );

    const hoistedBody = phoist(
        pfn([
            asData( kT ),
        ], lam( list( elems_t ) ,PMaybeVal.type))
        ( searchElem => 
            plet(
                peqData.$( searchElem )
            ).in( isKey =>
                precursiveList( PMaybeVal.type, elems_t )
                .$( _self => pdelay( PMaybeVal.Nothing({}) ) )
                .$(( self, el: any , rest ) => 
                    pif( PMaybeVal.type )
                    .$( isKey.$( pfst.$( el ) as any ) )
                    .then(
                        PMaybeVal.Just({
                            val: pvalueToData( psnd.$( el ) as any ) 
                        })
                    )
                    .else( self.$( rest ) )
                )
            ),
            "plookup"
        )
    );

    if( typeExtends( kT, data ) )
    {
        return hoistedBody as any;
    }
    
    return phoist(
        pfn([
            kT
        ],  lam( list( elems_t ) ,PMaybeVal.type) )
        (( searchElem ) =>
            hoistedBody.$( toData( kT )( searchElem ) ),
            "plookup::" + termTypeToString(kT)
        )
    ) as any;

}