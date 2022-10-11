import JsRuntime from "../../../../utils/JsRuntime";
import ObjectUtils from "../../../../utils/ObjectUtils";
import { PDataRepresentable } from "../../PType";
import { punsafeConvertType } from "../../Syntax";
import Term from "../../Term";
import Type, { ConstantableTermType, TermType, ToPType } from "../../Term/Type";
import { typeExtends } from "../../Term/Type/extension";
import { isConstantableTermType } from "../../Term/Type/kinds";
import { cloneTermType } from "../../Term/Type/utils";
import PData from "../PData";
import { getFromDataForType, getToDataForType } from "../PData/conversion";

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

export const aliasType = Symbol("aliasType");
export type Alias<T extends ConstantableTermType> = [ typeof aliasType, T ];

export type PAlias<T extends ConstantableTermType, PClass extends _PAlias = _PAlias> = T extends ConstantableTermType ?
{
    new(): PClass

    termType: Alias<T>;
    type: Alias<T>;
    fromData: ( data: Term<PData> ) => Term<PClass>;
    toData: ( data: Term<PClass> ) => Term<PData>;

    from: ( toAlias: Term<ToPType<T>> ) => Term<PAlias<T, PClass>>

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

        static termType: Alias<T>;
        static type: Alias<T>;
        static fromData: ( data: Term<PData> ) => Term<PAlias<T, PAliasExtension>>;
        static toData: ( data: Term<PAlias<T, PAliasExtension>> ) => Term<PData>;

        static from: ( toAlias: Term<ToPType<T>> ) => Term<PAlias<T, PAliasExtension>>
    };

    const thisType: TermType = Object.freeze([ aliasType, cloneTermType( (type[0] as any) === aliasType ? type[1] as ConstantableTermType : type ) ]);

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
        ( data: Term<PData> ): Term<PAlias<T, PAliasExtension>> => {

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

                return punsafeConvertType( constrained, thisType ) as unknown as Term<PAlias<T, PAliasExtension>>;
            }

            return punsafeConvertType( res, thisType ) as unknown as Term<PAlias<T, PAliasExtension>>;
        }
    );

    ObjectUtils.defineReadOnlyProperty(
        PAliasExtension,
        "toData",
        ( alias: Term<PAlias<T, PAliasExtension>>): Term<PData> => {

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
        ( toAlias: Term<ToPType<T>> ): Term<PAlias<T, PAliasExtension>> =>
            punsafeConvertType( toAlias, thisType ) as any
    );

    return PAliasExtension as unknown as PAlias<T, PAliasExtension>;
}