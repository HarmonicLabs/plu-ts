import DataConstr from "../../../../types/Data/DataConstr";
import ByteString from "../../../../types/HexString/ByteString";
import Pair from "../../../../types/structs/Pair";
import JsRuntime from "../../../../utils/JsRuntime";
import ObjectUtils from "../../../../utils/ObjectUtils";
import { NoInfer, ReturnT } from "../../../../utils/ts";
import UPLCTerm from "../../../UPLC/UPLCTerm";
import UPLCConst from "../../../UPLC/UPLCTerms/UPLCConst";
import { pConstrToData, pfstPair, punConstrData } from "../../Prelude/Builtins";
import PType from "../../PType";
import { plet } from "../../Syntax";
import Term from "../../Term";
import Type, { Type as Ty } from "../../Term/Type";
import { dataTypeExtends, typeExtends } from "../../Term/Type/utils";
import PBool from "../PBool";
import PByteString, { pByteString } from "../PByteString";
import PData from "../PData";
import PInt, { pInt } from "../PInt";
import { pDataList } from "../PList";
import PUnit from "../PUnit";

/**
 * intermediate class useful to differentiate structs form primitives
 */
export class PStruct extends PType
{
    constructor()
    {
        super();
    }
}

export type StructFields = {
    [field: string | number]: new () => PType
}

type StructFieldsInstance<SFields extends StructFields> = {
    [Field in keyof SFields]: Term<ReturnT<SFields[Field]>>
}

export type StructDefinition = {
    [constructor: string]: StructFields
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

export type PStructExtension<StructDefinition> = {
    new(): PStruct

    termType: Ty;
    fromData: ( data: Term<PData> ) => Term<PStructExtension<StructDefinition>>;

} & PType & {
    [Ctor in keyof StructDefinition]:
        //@ts-ignore Type 'StructDefinition[Ctor]' does not satisfy the constraint 'StructFields'.
        ( ctorFields: StructFieldsInstance<StructDefinition[Ctor]> ) => Term<PStructExtension<StructDefinition>>
}

export default function pstruct<SDescriptor extends StructDefinition>( descriptor: SDescriptor ): PStructExtension<SDescriptor>
{
    JsRuntime.assert(
        isStructDefinition( descriptor ),
        "cannot construct 'PStruct' type; invalid constructors"
    );

    class PStructExt extends PStruct
    {
        // private constructors are not a thing at js runtime
        // in any case constructing an instance is useless
        // private allows the typescript LSP to rise errors (not runtime) whet trying to extend the class
        private constructor()
        {
            super();
        }

        static termType: Ty;
        static fromData: ( data: Term<PData> ) => Term<PStructExtension<SDescriptor>>
    }

    ObjectUtils.defineReadOnlyProperty(
        PStructExt.prototype,
        "termType",
        Type.Data.Constr // Structs are always Constructors
    );

    ObjectUtils.defineReadOnlyProperty(
        PStructExt.prototype,
        "fromData",
        ( data: Term<PData> ): Term<PStructExtension<SDescriptor>> => {

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
            ( jsStruct: StructFieldsInstance<any> ): Term<PStructExtension<SDescriptor>> => {
                JsRuntime.assert(
                    ObjectUtils.isObject( jsStruct ),
                    "cannot build a plu-ts structure if the input is not an object with named fields"
                );

                const thisCtor = descriptor[ctorName];
                const jsStructKeys = Object.keys( jsStruct );

                JsRuntime.assert(
                    // same number of parameters as in struct definition
                    jsStructKeys.length === Object.keys( thisCtor ).length &&
                    // every parameter is a Term
                    jsStructKeys.every( fieldKey => jsStruct[fieldKey] instanceof Term/*thisCtor[fieldKey]*/ ),
                    "the fields passed do not match the struct definition for constructor: " + ctorName
                );

                const dataReprTerm =
                    pConstrToData
                        .$( pInt( i ) )
                        .$( pDataList( jsStructKeys.map<Term<any>>(
                                structKey =>
                                    // access PType constructor
                                    (descriptor[ctorName][structKey] as any)
                                    // toData static method
                                    .toData( jsStruct[ structKey ] )
                                )
                            )
                        );
                    
                return new Term(
                    // just mock ts
                    dataReprTerm.type as any,
                    dataReprTerm.toUPLC
                );
            }
        );
    }
    //*/
    

    /*
    type 'typeof PStructExt' is not assignable to type 'PStructExtension<SDescriptor>'.
        Property '_isPType' is missing in type 'typeof PStructExt' but required in type 'PType'
    
    Why is this?
    */
    return PStructExt as any;
}

/**
 * @fixme add fixed length parameters in ```getDescriptor``` and the actual instantiation (last function)
 * @fixme throw if the length is not the same at js runtime
 * 
 * @param getDescriptor 
 * @returns 
 */
export function pgenericStruct<SDescriptor extends StructDefinition>( getDescriptor: ( ...tyArgs: { new (): NoInfer<PType>, termType: Ty }[] ) => SDescriptor )
{
    /*
    lambda called immediately

    needed to allow the creation of a **new** cache per each generic struct
    cannot create a cache directly in the ```pgenericStruct``` function because that would be global
    for **every** generic structure;
    */
    return (() => {
        const tyArgsCache: Pair<string, PStructExtension<SDescriptor>>[] = []

        return ( ...tyArgs: { new (): NoInfer<PType>, termType: Ty }[] ) => {

            const thisTyArgsKey = tyArgs.map( tyArg => tyArg.termType.join() ).join();
            const keys = tyArgsCache.map( pair => pair.fst );

            if( keys.includes( thisTyArgsKey ) )
            {
                const cachedResult = tyArgsCache.find( pair => pair.fst === thisTyArgsKey );
                if( cachedResult !== undefined ) return cachedResult.snd;
            }
            
            const newTypeArgsStruct = pstruct<SDescriptor>( getDescriptor( ...tyArgs ) );
            tyArgsCache.push( new Pair<string, PStructExtension<SDescriptor>>( thisTyArgsKey, newTypeArgsStruct ) );

            return newTypeArgsStruct;
        }
    })();
};

const PEither = pgenericStruct(
    ( A, B ) => {
        return {
            Left:  { value: A },
            Rigth: { value: B }
        }
    }
)

const PPubKeyHash = pstruct({ PPubKeyHash: { _0: PByteString } })

const so = PPubKeyHash.PPubKeyHash({ _0: pByteString( ByteString.fromAscii("hello") ) })