import Cloneable from "../../types/interfaces/Cloneable";
import Defaultable from "../../types/interfaces/Defaultable";
import UPLCTerm from "../UPLC/UPLCTerm";
import UPLCConst from "../UPLC/UPLCTerms/UPLCConst";
import ConstType, { constT, ConstTyTag } from "../UPLC/UPLCTerms/UPLCConst/ConstType";
import Term from "./Term";


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
    private readonly _isPType: true = true;
    private readonly _PTypeUPLCTerm?: UPLCTerm;

    constructor() {}

    static get default(): PType { return new PType };

    get ctor(): new () => PType { return PType };
};