import BasePluTsError from "../../errors/BasePluTsError";

export default function shouldNeverGetHereError< ErrorType extends BasePluTsError = BasePluTsError >( methodName : string ) : ErrorType
{
    return new BasePluTsError(
        "unexpected flow execution, in method " + methodName +"; please open an issue if this error raised"
    ) as ErrorType;
}
