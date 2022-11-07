import JsRuntime from "../../../../utils/JsRuntime";
import ObjectUtils from "../../../../utils/ObjectUtils";
import { PDataRepresentable } from "../../PType";
import punsafeConvertType from "../../Syntax/punsafeConvertType";
import Term from "../../Term";
import Type, { AliasTermType, aliasType, ConstantableTermType, TermType, ToPType } from "../../Term/Type/base";
import { typeExtends } from "../../Term/Type/extension";
import { isAliasType, isConstantableTermType } from "../../Term/Type/kinds";
import { cloneTermType } from "../../Term/Type/utils";
import PData from "../PData/PData";
import { getFromDataForType } from "../PData/conversion";
import { getToDataForType } from "../PData/conversion/getToDataTermForType";
import unwrapAlias from "./unwrapAlias";


/**
 * intermediate class useful to reconize structs form primitives
**/
class _PAlias extends PDataRepresentable
{
    protected constructor()
    {
        super();
    }
}

export type AliasDefinition<T extends ConstantableTermType, AliasId extends symbol = symbol> = {
    id: AliasId,
    type: T
}

export type PAlias<T extends ConstantableTermType, AliasId extends symbol = symbol, PClass extends _PAlias = _PAlias> = T extends ConstantableTermType ?
{
    new(): PClass

    termType: AliasTermType<AliasId,T>;
    type: AliasTermType<AliasId,T>;
    fromData: ( data: Term<PData> ) => Term<PClass>;
    toData: ( data: Term<PClass> ) => Term<PData>;

    from: ( toAlias: Term<ToPType<T>> ) => Term<PAlias<T, AliasId, PClass>>

} & PDataRepresentable
: never;


export default function palias<T extends ConstantableTermType>(
    type: T,
    fromDataConstraint: (( term: Term<ToPType<T>> ) => Term<ToPType<T>>) | undefined = undefined
)
{
    JsRuntime.assert(
        isConstantableTermType( type ),
        "cannot construct 'PAlias' type; the type cannot be converted to an UPLC constant"
    );

    const thisAliasId = Symbol("alias_id");
    type ThisAliasT = AliasTermType<typeof thisAliasId, T>;
    type ThisAliasTerm = Term<PAlias<T, typeof thisAliasId, PAliasExtension>>;

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

    const thisType: AliasTermType<typeof thisAliasId, T> = Object.freeze([
        aliasType,
        Object.freeze({
            id: thisAliasId,
            type: cloneTermType( isAliasType( type ) ? unwrapAlias( type ) : type )
        })
    ]) as any;

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
        ( data: Term<PData> ): ThisAliasTerm => {

            JsRuntime.assert(
                typeExtends( data.type, Type.Data.Any ),
                "trying to construct an alias using static method 'fromData'; but the `Data` argument is not a `Data.Constr`"
            );

            const res = getFromDataForType( type )( data );

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
        ( alias: ThisAliasTerm ): Term<PData> => {

            const aliasT = alias.type;

            JsRuntime.assert(
                aliasT[0] === aliasType && typeExtends( aliasT, thisType ),
                "trying to conver an alias type using the wrong 'toData'"
            );

            return getToDataForType( type )( punsafeConvertType( alias, type ) );
        }
    );
    
    ObjectUtils.defineReadOnlyProperty(
        PAliasExtension,
        "from",
        ( toAlias: Term<ToPType<T>> ): ThisAliasTerm =>
            punsafeConvertType( toAlias, thisType ) as any
    );

    return PAliasExtension as unknown as PAlias<T ,typeof thisAliasId, PAliasExtension>;
}
