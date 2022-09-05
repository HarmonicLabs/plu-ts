import Cloneable from "../../types/interfaces/Cloneable";
import UPLCTerm from "../UPLC/UPLCTerm";


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
};