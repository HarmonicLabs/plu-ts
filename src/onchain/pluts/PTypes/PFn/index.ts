import PType from "../../PType"
import PLam from "./PLam"


type PFn<Inputs extends [ PType, ...PType[] ], Output extends PType > = 
    Inputs extends [] ? never :
    Inputs extends [ infer PInstance extends PType ] ?
        PLam< PInstance, Output > :
    Inputs extends [ infer PInstance extends PType, ...infer PInstances extends [ PType, ...PType[] ] ] ?
        PLam< PInstance, PFn< PInstances, Output> >:
        never

export default PFn;
