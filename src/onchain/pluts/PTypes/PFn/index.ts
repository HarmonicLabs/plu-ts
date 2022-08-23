import PType from "../../PType"
import PBool from "../PBool";
import PByteString from "../PByteString";
import PInt from "../PInt";
import PLam from "./PLam"


type PFn<Inputs extends [ PType, ...PType[] ], Output extends PType > = 
    Inputs extends [ infer PInstance extends PType ] ?
        PLam< PInstance, Output > :
    Inputs extends [ infer PInstance extends PType, ...infer PInstances extends [ PType, ...PType[] ] ] ?
        PLam< PInstance, PFn< PInstances, Output> >:
        never

//@ts-expect-error
type TestFn0 = PFn<[ ], PBool>

//PLam<PByteString, PBool>
type TestFn1 = PFn<[ PByteString ], PBool>
//PLam<PInt, PLam<PByteString, PBool>>
type TestFn2 = PFn<[ PInt, PByteString ], PBool>
//PLam<PInt, PLam<PInt, PLam< PByteString, PBool > >>
type TestFn3 = PFn<[ PInt, PInt, PByteString ], PBool>

export default PFn;
