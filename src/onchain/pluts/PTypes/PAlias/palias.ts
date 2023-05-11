import JsRuntime from "../../../../../../src/utils/JsRuntime";
import ObjectUtils from "../../../../../../src/utils/ObjectUtils";

import type { Term } from "../../Term";

import { punsafeConvertType } from "../../lib/punsafeConvertType";
import { AliasT, PrimType, TermType, alias, data } from "../../type_system/types";
import { PDataRepresentable } from "../../PType/PDataRepresentable";
import { PData } from "../PData/PData";
import { ToPType } from "../../type_system/ts-pluts-conversion";
import { isWellFormedType } from "../../type_system/kinds/isWellFormedType";
import { typeExtends } from "../../type_system/typeExtends";
import { PappArg, fromData, pappArgToTerm, toData } from "../../lib";


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

export type PAlias<T extends TermType, PClass extends _PAlias = _PAlias> =
{
    new(): PClass

    /**
     * @deprecated
     */
    readonly termType: AliasT<T>;
    readonly type: AliasT<T>;
    readonly fromData: ( data: Term<PData> ) => Term<PClass>;
    readonly toData: ( data: Term<PClass> ) => Term<PData>;

    readonly from: ( toAlias: PappArg<ToPType<T>> ) => Term<PAlias<T, PClass>>

} & PDataRepresentable


export function palias<T extends TermType>(
    type: T,
    fromDataConstraint: (( term: Term<ToPType<T>> ) => Term<ToPType<T>>) | undefined = undefined
)
{
    JsRuntime.assert(
        isWellFormedType( type ),
        "cannot construct 'PAlias' type; the type cannot be converted to an UPLC constant"
    );

    type ThisAliasT = AliasT<T>;
    type ThisAliasTerm = Term<PAlias<T>>;

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

        static from: ( toAlias: Term<ToPType<T>> ) => ThisAliasTerm;
    };

    const thisType: ThisAliasT = alias( type ) as any;

    ObjectUtils.defineReadOnlyProperty(
        PAliasExtension,
        "type",
        thisType
    );

    ObjectUtils.defineReadOnlyProperty(
        PAliasExtension,
        "termType",
        thisType
    );

    ObjectUtils.defineReadOnlyProperty(
        PAliasExtension,
        "fromData",
        ( dataTerm: Term<PData> ): ThisAliasTerm => {

            JsRuntime.assert(
                typeExtends( dataTerm.type, data ),
                "trying to construct an alias using static method 'fromData'; but the `Data` argument is not a `Data.Constr`"
            );

            const res = fromData( type )( dataTerm );

            if( typeof fromDataConstraint === "function" )
            {
                const constrained = fromDataConstraint( res );
                
                JsRuntime.assert(
                    typeExtends( constrained.type, res.type ),
                    "'fromDataConstraint' changed the type of the term"
                );

                return punsafeConvertType( constrained, thisType ) as unknown as ThisAliasTerm;
            }

            return punsafeConvertType( res, thisType ) as unknown as ThisAliasTerm;
        }
    );

    ObjectUtils.defineReadOnlyProperty(
        PAliasExtension,
        "toData",
        ( aliasTerm: ThisAliasTerm ): Term<PData> => {

            const aliasT = aliasTerm.type;

            JsRuntime.assert(
                aliasT[0] === PrimType.Alias && typeExtends( aliasT, thisType ),
                "trying to convert an alias type using the wrong class 'toData'"
            );

            return toData( type )( punsafeConvertType( aliasTerm, type ) );
        }
    );
    
    ObjectUtils.defineReadOnlyProperty(
        PAliasExtension,
        "from",
        ( toAlias: PappArg<ToPType<T>> ): ThisAliasTerm =>
            punsafeConvertType( pappArgToTerm( toAlias, type ), thisType ) as any
    );

    return PAliasExtension as unknown as PAlias<T, PAliasExtension>;
}
