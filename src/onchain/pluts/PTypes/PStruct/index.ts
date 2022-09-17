import Pair from "../../../../types/structs/Pair";
import JsRuntime from "../../../../utils/JsRuntime";
import ObjectUtils from "../../../../utils/ObjectUtils";
import { ConcreteInstanceType, ReturnT } from "../../../../utils/ts";
import { pConstrToData } from "../../Prelude/Builtins";
import PType, { PDataRepresentable } from "../../PType";
import Term from "../../Term";
import Type, { TermType } from "../../Term/Type";
import { typeExtends } from "../../Term/Type/utils";
import PData from "../PData";
import PInt, { pInt } from "../PInt";
import { pDataList, pList } from "../PList";
import PString from "../PString";

/**
 * intermediate class useful to differentiate structs form primitives
 */
class _PStruct extends PDataRepresentable
{
    protected constructor()
    {
        super();
    }
}

export type StructFieldsTypes = {
    [field: string | number]: new () => PDataRepresentable
}

type StructFieldsInstance<SFieldsTys extends StructFieldsTypes> = {
    [Field in keyof SFieldsTys]: Term<ReturnT<SFieldsTys[Field]>>
}

export type StructDefinition = {
    [constructor: string]: StructFieldsTypes
}

/**
 * @todo
 */
export function isStructDefinition( descriptor: object ): descriptor is StructDefinition
{
    if( !ObjectUtils.isObject( descriptor ) ) return false;

    const CtorsNames = Object.keys( descriptor );
    
    if( !CtorsNames.every( ctorName => Number.isNaN( parseFloat( ctorName ) ) ) ) return false; // one or more of the ctors names where numbers

    /*
    check fields 
     */

    return true;
}

export type PStruct<StructDefinition> = {
    new(): _PStruct

    termType: TermType;
    fromData: ( data: Term<PData> ) => Term<PStruct<StructDefinition>>;
    toData: ( data: Term<PStruct<StructDefinition>> ) => Term<PData>;

} & PDataRepresentable & {
    [Ctor in keyof StructDefinition]:
        //@ts-ignore Type 'StructDefinition[Ctor]' does not satisfy the constraint 'StructFieldsTypes'.
        ( ctorFields: StructFieldsInstance<StructDefinition[Ctor]> ) => Term<PStruct<StructDefinition>>
}

export default function pstruct<StructDef extends StructDefinition>( descriptor: StructDef ): PStruct<StructDef>
{
    JsRuntime.assert(
        isStructDefinition( descriptor ),
        "cannot construct '_PStruct' type; invalid constructors"
    );

    class PStructExt extends _PStruct
    {
        static _isPType: true = true;
        // private constructors are not a thing at js runtime
        // in any case constructing an instance is useless
        // private allows the typescript LSP to rise errors (not runtime) whet trying to extend the class
        private constructor()
        {
            super();
        }

        static termType: TermType;
        static fromData: <Ext extends PStructExt = PStructExt>( data: Term<PData> ) => Term<Ext>
        static toData:   <Ext extends PStructExt>( data: Term<Ext> ) => Term<PData>;

    }

    ObjectUtils.defineReadOnlyProperty(
        PStructExt.prototype,
        "termType",
        Type.Data.Constr // Structs are always Constructors
    );

    ObjectUtils.defineReadOnlyProperty(
        PStructExt.prototype,
        "fromData",
        ( data: Term<PData> ): Term<PStructExt> => {

            JsRuntime.assert(
                typeExtends( data.type, Type.Data.Constr ),
                "trying to construct a Struct using static method 'fromData'; but the `Data` argument is not a `Data.Constr`"
            );

            return ObjectUtils.defineReadOnlyHiddenProperty(
                // basically only mocking typescript here; still data
                new Term(
                    data.type as any,
                    data.toUPLC
                ),
                "_pIsConstantStruct",
                false
            );
        }
    );

    const constructors = Object.keys( descriptor );
    JsRuntime.assert(
        constructors.length >= 1,
        "struct definition requires at least 1 constructor"
    );

    //*
    for(let i = 0; i < constructors.length; i++)
    {
        const ctorName = constructors[ i ];

        ObjectUtils.defineReadOnlyProperty(
            PStructExt.prototype,
            ctorName,
            ( jsStruct: StructFieldsInstance<any> ): Term<PStructExt> => {
                JsRuntime.assert(
                    ObjectUtils.isObject( jsStruct ),
                    "cannot build a plu-ts structure if the input is not an object with named fields"
                );

                const thisCtor = descriptor[ctorName];
                const jsStructKeys = Object.keys( jsStruct );

                JsRuntime.assert(
                    // same number of parameters as in struct definition
                    jsStructKeys.length === Object.keys( thisCtor ).length &&
                    jsStructKeys.every( fieldKey =>
                        // every parameter is a Term
                        jsStruct[fieldKey] instanceof Term /*thisCtor[fieldKey]*/ &&
                        typeExtends(
                            jsStruct[fieldKey].type,
                            (thisCtor[fieldKey] as any).termType
                        )
                    ),
                    "the fields passed do not match the struct definition for constructor: " + ctorName
                );

                
                const dataReprTerm =
                    pConstrToData
                        .$( pInt( i ) )
                        .$( pList( Type.Data.Any )( jsStructKeys.map<Term<any>>(
                                structKey =>{
                                    // access PDataRepresentable constructor
                                    return (descriptor[ctorName][structKey] as any)
                                    // toData static method
                                    .toData( jsStruct[ structKey ] )
                                })
                            )
                        );
                    
                return ObjectUtils.defineReadOnlyHiddenProperty(
                    new Term(
                        // just mock ts return type
                        dataReprTerm.type as any,
                        dataReprTerm.toUPLC
                    ),
                    "_pIsConstantStruct",
                    true
                );
            }
        );

        ObjectUtils.defineReadOnlyProperty(
            PStructExt,
            ctorName,
            (PStructExt.prototype as any)[ctorName]
        );
    }
    //*/
    

    /*
    Type 'typeof PStructExt' is not assignable to type 'PStruct<StructDef>'
    
    Why is this?
    */
    return PStructExt as any;
}

type PDataRepreArrToTyArgs<PTyArgs extends [ PDataRepresentable, ...PDataRepresentable[] ] > =
    PTyArgs extends [ infer PTyArg extends PDataRepresentable ] ? [ { new (): PTyArg, termType: TermType } ] :
    PTyArgs extends [ infer PTyArg extends PDataRepresentable, ...infer RestPTyArg extends [ PDataRepresentable, ...PDataRepresentable[] ] ] ?
        [ { new (): PTyArg, termType: TermType }, ...PDataRepreArrToTyArgs<RestPTyArg> ] :
    never & { new (): PDataRepresentable, termType: TermType }[];

type PDataReprCtor = new () => PDataRepresentable
/**
 * @fixme add fixed length parameters in ```getDescriptor``` and the actual instantiation (last function)
 * @fixme throw if the length is not the same at js runtime
 * 
 * @param getDescriptor 
 * @returns 
 */
export function pgenericStruct<StructDef extends StructDefinition>
    (
        getDescriptor: ( ...tyArgs: [ PDataReprCtor, ...PDataReprCtor[] ] ) => StructDef
    ): ( ...tyArgs: [ PDataReprCtor, ...PDataReprCtor[] ] ) => PStruct<StructDef>
{
    /*
    lambda called immediately

    needed to allow the creation of a **new** cache per each generic struct
    cannot create a cache directly in the ```pgenericStruct``` function because that would be global
    for **every** generic structure;
    */
    return (() => {
        const tyArgsCache: Pair<string, PStruct<StructDef>>[] = []

        return ( ...tyArgs: [ PDataReprCtor, ...PDataReprCtor[] ] ): PStruct<StructDef> => {

            const thisTyArgsKey = tyArgs.map( tyArg => (tyArg as any).termType.join() ).join();
            const keys = tyArgsCache.map( pair => pair.fst );

            if( keys.includes( thisTyArgsKey ) )
            {
                const cachedResult = tyArgsCache.find( pair => pair.fst === thisTyArgsKey );
                if( cachedResult !== undefined ) return cachedResult.snd;
            }
            
            const result = pstruct( getDescriptor( tyArgs[0], ...tyArgs.slice(1) ) );
            tyArgsCache.push( new Pair<string, PStruct<StructDef>>( thisTyArgsKey, result ) );

            return result;
        }
    })();
};

const MyAuctionRedeemer = pstruct({
    Bid: { bidAmount: PInt },
    CloseAuction: {}
})

const PMaybe = pgenericStruct( tyArg => {
    return {
        Just: { value: tyArg },
        Nothing: {}
    }
})

const PMInt = PMaybe( PInt );

const bid42 = MyAuctionRedeemer.Bid({ bidAmount: pInt( 42 ) });

const maybe69 = PMaybe( PInt ).Just({ value: pInt( 69 ) });