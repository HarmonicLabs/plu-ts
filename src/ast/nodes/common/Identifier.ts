import { SourceRange } from "../../Source/SourceRange";
import { HasSourceRange } from "../HasSourceRange";

export class Identifier
    implements HasSourceRange
{
    constructor(
        readonly text: string,
        readonly range: SourceRange,
    ) {}

    /**
     * usually used for anonymous arrow functions
     */
    static anonymous( range: SourceRange ): Identifier
    {
        return new Identifier( "", range );
    }

    isAnonymous(): boolean
    {
        return this.text === "";
    }
}