import Cloneable from "../../types/interfaces/Cloneable";
import JsRuntime from "../../utils/JsRuntime";
import UPLCTerm from "../UPLC/UPLCTerm";
import PData from "./PTypes/PData";
import Term from "./Term";
import Type, { TermType } from "./Term/Type";


export type PTypeCtor< PInstance extends PType > = new (...args: any[]) => PInstance;
export type PTypeBuilder< PInstance extends PType > = (...args: any[]) => PInstance;
export type PTypeGetter< PInstance extends PType > = PTypeBuilder<PInstance> | PTypeCtor<PInstance>;

export type ToCtors< PTypes extends PType[] > =
    PTypes extends [] ? [] :
    PTypes extends [ infer PInstance extends PType ] ? [ new () => PInstance ] :
    PTypes extends [ infer PInstance extends PType, ...infer PInstances extends PType[] ] ? [ new () => PInstance, ...ToCtors<PInstances> ] :
    never;


/**
 * @abstract
 */
export default class PType
{
    /**
     * probably never used;
     * 
     * here only to make a difference from any generic object
    */
    protected readonly _isPType: true = true;
    protected readonly _PTypeUPLCTerm?: UPLCTerm;

    constructor() {}

    static get termType(): TermType { return Type.Any };
};

/**
 * @abstract
 */
export class PDataRepresentable extends PType
{
    constructor() { super(); }

    static fromData( data: Term<PData> ): Term<any>
    {
        throw JsRuntime.makeNotSupposedToHappenError(
            "'PDataRepresentable' is an abstract class; an extension of the class did not implemented the 'fromData' static method"
        );
    }

    static toData( term: Term<any> ): Term<PData> {
        throw JsRuntime.makeNotSupposedToHappenError(
            "'PDataRepresentable' is an abstract class; an extension of the class did not implemented the 'toData' static method"
        );
    }
}