import PType from "../../PType"
import PLam from "./PLam"

///@ts-check
export type PFn<Inputs extends [ PType, ...PType[] ], Output extends PType > = 
    Inputs extends [ infer PInstance extends PType ] ?
        PLam< PInstance, Output > :
    Inputs extends [ infer PInstance extends PType, ...infer PInstances extends [ PType, ...PType[] ] ] ?
        PLam< PInstance, PFn< PInstances, Output> >:
        never

export default PFn;
