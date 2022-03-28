import BasePluTsError from "../../errors/BasePluTsError";

export default function makeConstructionError< ErrorType extends BasePluTsError = BasePluTsError >
( 
    constructorName: string,
    schema: string,
    input: object
)
{
    return new BasePluTsError(
        "tring to construct a " + constructorName + " instance with a non valid object; object should follow the schema \"" + schema + "\", instead was: " + JSON.stringify( input )
    ) as ErrorType;
}