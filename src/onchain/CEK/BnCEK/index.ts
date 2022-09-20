import UPLCTerm, { PureUPLCTerm } from "../../UPLC/UPLCTerm";
import UPLCBuiltinTag from "../../UPLC/UPLCTerms/Builtin/UPLCBuiltinTag";
import ErrorUPLC from "../../UPLC/UPLCTerms/ErrorUPLC";
import UPLCConst from "../../UPLC/UPLCTerms/UPLCConst";
import { constT, constTypeEq } from "../../UPLC/UPLCTerms/UPLCConst/ConstType" 
import PartialBuiltin from "./PartialBuiltin";
import Integer, { UInteger } from "../../../types/ints/Integer";

export default class BnCEK
{
    private constructor() {};

    static eval( bn: PartialBuiltin ): PureUPLCTerm
    {
        if( bn.tag === UPLCBuiltinTag.ifThenElse ){
            return BnCEK.ifThenElse( bn.args[0], bn.args[1], bn.args[2] )
        }

        if( bn.tag === UPLCBuiltinTag.equalsInteger ){
            return BnCEK.equalsInteger( bn.args[0], bn.args[1] )
        }


        return new ErrorUPLC;
    }

    static ifThenElse( condition: UPLCTerm, caseTrue: PureUPLCTerm, caseFalse: PureUPLCTerm ): PureUPLCTerm
    {
        if(!(
            condition instanceof UPLCConst &&
            constTypeEq( condition.type, constT.bool ) &&
            typeof condition.value === "boolean"
        )) return new ErrorUPLC;
        
        return condition.value ? caseTrue : caseFalse;
    }

    static equalsInteger( a: UPLCTerm, b: UPLCTerm ): PureUPLCTerm
    {
        console.log( "hello", a, b )

        if(!(
            a instanceof UPLCConst &&
            constTypeEq( a.type, constT.int ) &&
            (
                a.value instanceof Integer ||  
                a.value instanceof UInteger
            )  
        )) return new ErrorUPLC;

        if(!(
            b instanceof UPLCConst &&
            constTypeEq( b.type, constT.int ) &&
            (
                b.value instanceof Integer ||  
                b.value instanceof UInteger
            )  
        )) return new ErrorUPLC;

        const _a = a.value.asBigInt;
        const _b = b.value.asBigInt;

        return UPLCConst.bool( _a === _b );
    }
}