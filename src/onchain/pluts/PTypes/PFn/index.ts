import { Head, NonEmptyTail, Tail } from "../../../../utils/ts";
import PType from "../../PType"
import PLam from "./PLam"


type PFn<Inputs extends [ PType, ...PType[] ], Output extends PType > = 
    Inputs extends [] ? never :
    Inputs extends [ infer PInstance extends PType ] ?
        PLam< PInstance, Output > :
    Inputs extends [ infer PInstanceA extends PType, infer PInstanceB extends PType ] ?
        PLam< PInstanceA, PLam< PInstanceB, Output > > :
    Inputs extends [ infer PInstance extends PType, ...infer PInstances extends [ PType, PType, ...PType[] ] ] ?
        PLam< PInstance, PFn< NonEmptyTail<PInstances >, Output> >:
        never

export default PFn;
