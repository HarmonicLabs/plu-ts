import type { Term } from "../../Term";

import { punsafeConvertType } from "../../lib/punsafeConvertType";
import { AliasT, Methods, PrimType, TermType, alias, data } from "../../../type_system/types";
import { PDataRepresentable } from "../../PType/PDataRepresentable";
import { PData } from "../PData/PData";
import { FromPType, ToPType } from "../../../type_system/ts-pluts-conversion";
import { isWellFormedType } from "../../../type_system/kinds/isWellFormedType";
import { typeExtends } from "../../../type_system/typeExtends";
import { assert } from "../../../utils/assert";
import { defineReadOnlyProperty } from "@harmoniclabs/obj-utils";
import { PType } from "../../PType";
import { PappArg, pappArgToTerm } from "../../lib/pappArg";
import { TermAlias } from "../../lib/std/UtilityTerms/TermAlias";
import { fromData } from "../../lib/std/data/conversion/fromData";
import { toData } from "../../lib/std/data/conversion/toData";


/**
 * intermediate class useful to reconize structs form primitives
**/
class _PAlias extends PDataRepresentable
{
    public _isPType: true = true;
    public _PTypeUPLCTerm: any;
    constructor()
    {
        super();
    }
}

export type PAlias<PT extends PType, AMethods extends Methods> =
{
    new(): _PAlias

    /**
     * @deprecated
    */
   readonly termType: AliasT<FromPType<PT>, AMethods>;
   readonly type: AliasT<FromPType<PT>, AMethods>;
   readonly fromData: ( data: Term<PData> ) => Term<PAlias<PT, AMethods>>;
   readonly toData: ( data: Term<PAlias<PT, any>> ) => Term<PData>;
   
    readonly from: ( toAlias: PappArg<PT> ) => TermAlias<PT, AMethods>

} & PDataRepresentable

export function palias<
    T extends TermType,
    AMethods extends Methods
>(
    type: T,
    getMethods?: ( self_t: AliasT<T, any> ) => AMethods,
    fromDataConstraint: (( term: Term<ToPType<T>> ) => Term<ToPType<T>>) | undefined = undefined
): PAlias<ToPType<T>, AMethods>
{
    assert(
        isWellFormedType( type ),
        "cannot construct 'PAlias' type; the type cannot be converted to an UPLC constant"
    );

    getMethods = typeof getMethods === "function" ? getMethods : _self_t => { return {} as AMethods };

    type ThisAliasT = AliasT<T>;
    type PT = ToPType<T>;
    type ThisAliasTerm = Term<PAlias<PT, AMethods>>;

    //@ts-ignore
    class PAliasExtension extends _PAlias
    {
        static _isPType: true = true;
        // private constructors are not a thing at js runtime
        // in any case constructing an instance is useless
        // private allows the typescript LSP to rise errors (not runtime) whet trying to extend the class
        private constructor()
        {
            super();
        }

        static termType: ThisAliasT;
        static type: ThisAliasT;
        static fromData: ( data: Term<PData> ) => ThisAliasTerm;
        static toData: ( data: ThisAliasTerm ) => Term<PData>;

        static from: ( toAlias: Term<PT> ) => ThisAliasTerm;
    };

    const thisTypeNoMethods = alias( type );

    const methods = getMethods( thisTypeNoMethods as any );

    const thisType: ThisAliasT = alias( type, methods ) as any;

    defineReadOnlyProperty(
        PAliasExtension,
        "type",
        thisType
    );

    defineReadOnlyProperty(
        PAliasExtension,
        "termType",
        thisType
    );

    defineReadOnlyProperty(
        PAliasExtension,
        "fromData",
        ( dataTerm: Term<PData> ): ThisAliasTerm => {

            assert(
                typeExtends( dataTerm.type, data ),
                "trying to construct an alias using static method 'fromData'; but the `Data` argument is not a `Data.Constr`"
            );

            const res = fromData( type )( dataTerm );

            if( typeof fromDataConstraint === "function" )
            {
                const constrained = fromDataConstraint( res );
                
                assert(
                    typeExtends( constrained.type, res.type ),
                    "'fromDataConstraint' changed the type of the term"
                );

                return punsafeConvertType( constrained, thisType ) as unknown as ThisAliasTerm;
            }

            return punsafeConvertType( res, thisType ) as unknown as ThisAliasTerm;
        }
    );

    defineReadOnlyProperty(
        PAliasExtension,
        "toData",
        ( aliasTerm: ThisAliasTerm ): Term<PData> => {

            const aliasT = aliasTerm.type;

            assert(
                aliasT[0] === PrimType.Alias && typeExtends( aliasT, thisType ),
                "trying to convert an alias type using the wrong class 'toData'"
            );

            return toData( type )( punsafeConvertType( aliasTerm, type ) );
        }
    );
    
    defineReadOnlyProperty(
        PAliasExtension,
        "from",
        ( toAlias: PappArg<PT> ): ThisAliasTerm => {
            return punsafeConvertType( pappArgToTerm( toAlias, type ), thisType ) as any
        }
    );

    return PAliasExtension as unknown as PAlias<PT, AMethods>;
}
